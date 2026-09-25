from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import math
from typing import Dict, List, Optional, Tuple

app = FastAPI(title="SafeRoute Global Routing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
USER_AGENT = "SafeRoute-SIH2026-Prototype/1.0"

# Amenity types treated as "crowd/activity" signals vs "emergency access" signals.
CROWD_AMENITIES = {
    "shop", "restaurant", "cafe", "bank", "atm", "marketplace", "bus_station",
    "pharmacy", "fast_food", "convenience", "mall", "supermarket",
    "community_centre", "place_of_worship"
}
EMERGENCY_AMENITIES = {"hospital", "police", "fire_station", "clinic"}
ISOLATED_HIGHWAY_TYPES = {"footway", "path", "track"}

GEOCODE_CACHE: Dict[str, dict] = {}
CONTEXT_CACHE: Dict[Tuple[float, float, float, float], dict] = {}

class LocationRequest(BaseModel):
    start: str = Field(min_length=2)
    destination: str = Field(min_length=2)
    mode: str = "walk"
    preference: str = "safest"
    preferences: dict = {}
    departure_time: str = "12:00"
    travel_date: str = ""

class Coordinate(BaseModel):
    lat: float
    lon: float

class RouteRequest(BaseModel):
    start: Coordinate
    destination: Coordinate
    mode: str = "walk"
    preference: str = "safest"
    preferences: dict = {}
    departure_time: str = "12:00"
    travel_date: str = ""


async def geocode(place: str) -> dict:
    key = place.strip().lower()
    if key in GEOCODE_CACHE:
        return GEOCODE_CACHE[key]
    params = {
        "format": "jsonv2",
        "q": place,
        "limit": 5
    }
    headers = {"User-Agent": USER_AGENT}
    try:
        async with httpx.AsyncClient(timeout=15, headers=headers) as client:
            response = await client.get(NOMINATIM_URL, params=params)
            response.raise_for_status()
            results = response.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Geocoding service unavailable: {exc}")
    if not results:
        raise HTTPException(status_code=404, detail=f"'{place}' could not be found.")
    result = results[0]
    value = {
        "lat": float(result["lat"]),
        "lon": float(result["lon"]),
        "display_name": result.get("display_name", place)
    }
    GEOCODE_CACHE[key] = value
    return value


def clamp(value: float) -> int:
    return max(0, min(100, round(value)))


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(min(1, math.sqrt(a)))


async def fetch_osm_context(south: float, west: float, north: float, east: float) -> Optional[dict]:
    """Fetch real OpenStreetMap street-lighting, POI and emergency-facility
    data for the bounding box around a set of candidate routes. This is the
    live, freely-available signal that replaces the old placeholder scoring.
    Returns None on failure so callers can degrade gracefully."""
    key = (round(south, 3), round(west, 3), round(north, 3), round(east, 3))
    if key in CONTEXT_CACHE:
        return CONTEXT_CACHE[key]

    crowd_and_emergency = "|".join(sorted(CROWD_AMENITIES | EMERGENCY_AMENITIES))
    highway_types = "motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian|footway|path|track|service"
    query = f"""
    [out:json][timeout:25];
    (
      way["highway"~"^({highway_types})$"]({south},{west},{north},{east});
      node["amenity"~"^({crowd_and_emergency})$"]({south},{west},{north},{east});
    );
    out geom;
    """
    try:
        async with httpx.AsyncClient(timeout=30, headers={"User-Agent": USER_AGENT}) as client:
            response = await client.post(OVERPASS_URL, data={"data": query})
            response.raise_for_status()
            payload = response.json()
    except Exception:
        return None

    lit_ways, unlit_ways, crowd_nodes, emergency_nodes = [], [], [], []
    for el in payload.get("elements", []):
        tags = el.get("tags", {})
        if el.get("type") == "way" and "highway" in tags:
            coords = [(pt["lat"], pt["lon"]) for pt in el.get("geometry", []) if pt]
            if not coords:
                continue
            entry = {"coords": coords, "lit": tags.get("lit"), "highway": tags.get("highway")}
            (lit_ways if tags.get("lit") == "yes" else unlit_ways).append(entry)
        elif el.get("type") == "node" and "amenity" in tags:
            lat, lon = el.get("lat"), el.get("lon")
            if lat is None or lon is None:
                continue
            amenity = tags["amenity"]
            if amenity in EMERGENCY_AMENITIES:
                emergency_nodes.append((lat, lon))
            elif amenity in CROWD_AMENITIES:
                crowd_nodes.append((lat, lon))

    context = {
        "lit_ways": lit_ways,
        "unlit_ways": unlit_ways,
        "crowd_nodes": crowd_nodes,
        "emergency_nodes": emergency_nodes
    }
    CONTEXT_CACHE[key] = context
    return context


def sample_route_points(geometry_coords: list, max_samples: int = 12) -> List[Tuple[float, float]]:
    """Pick up to max_samples (lat, lon) points evenly spaced along the
    route's GeoJSON coordinates (which are stored as [lon, lat])."""
    n = len(geometry_coords)
    if n == 0:
        return []
    if n <= max_samples:
        idxs = list(range(n))
    else:
        step = (n - 1) / (max_samples - 1)
        idxs = sorted({round(i * step) for i in range(max_samples)})
    return [(geometry_coords[i][1], geometry_coords[i][0]) for i in idxs]


def nearest_way(point: Tuple[float, float], ways: list, limit_m: float = 120) -> Optional[dict]:
    best_dist, best_way = None, None
    for way in ways:
        for wlat, wlon in way["coords"]:
            d = haversine_m(point[0], point[1], wlat, wlon)
            if best_dist is None or d < best_dist:
                best_dist, best_way = d, way
    if best_dist is not None and best_dist <= limit_m:
        return best_way
    return None


def compute_crowd(sample_pts: list, route_length_km: float, context: dict) -> int:
    nodes = context["crowd_nodes"]
    if not nodes:
        return 45  # no nearby POI data returned -> treat as a quiet baseline
    nearby_ids = set()
    for idx, (nlat, nlon) in enumerate(nodes):
        for pt in sample_pts:
            if haversine_m(pt[0], pt[1], nlat, nlon) <= 150:
                nearby_ids.add(idx)
                break
    density_per_km = len(nearby_ids) / max(route_length_km, 0.1)
    return clamp(30 + min(density_per_km, 15) / 15 * 65)


def compute_emergency(sample_pts: list, context: dict) -> Optional[int]:
    nodes = context["emergency_nodes"]
    if not nodes or not sample_pts:
        return None
    best = None
    for nlat, nlon in nodes:
        for pt in sample_pts:
            d = haversine_m(pt[0], pt[1], nlat, nlon)
            if best is None or d < best:
                best = d
    if best is None:
        return None
    return clamp(96 - min(best, 3000) / 3000 * 71)


def analyze_route(sample_pts: list, route_length_km: float, context: dict) -> dict:
    """Real, live-data-derived safety factors for one candidate route:
    - lighting: share of sampled points that sit on OSM ways tagged lit=yes
    - crowd: density of nearby shops/eateries/transit points along the route
    - emergency: proximity to the nearest hospital/police/fire station
    - incident: a transparent proxy (isolation from lighting/crowd/road type),
      NOT a real crime statistic -- no licensed incident dataset is connected yet.
    """
    all_ways = context["lit_ways"] + context["unlit_ways"]
    lit_hits, isolated_hits, checked = 0, 0, 0
    for pt in sample_pts:
        way = nearest_way(pt, all_ways)
        if way:
            checked += 1
            if way["lit"] == "yes":
                lit_hits += 1
            if way["highway"] in ISOLATED_HIGHWAY_TYPES:
                isolated_hits += 1

    have_lighting_data = checked > 0
    lighting = clamp(40 + (lit_hits / checked) * 55) if have_lighting_data else 62
    isolation_ratio = (isolated_hits / checked) if checked else 0

    crowd = compute_crowd(sample_pts, route_length_km, context)
    emergency = compute_emergency(sample_pts, context)
    have_emergency_data = emergency is not None
    if emergency is None:
        emergency = 55  # no hospital/police/fire node found in range -> neutral default

    incident = clamp((100 - (lighting * 0.5 + crowd * 0.5)) * 0.75 + isolation_ratio * 100 * 0.20)

    data_confidence = "osm" if (have_lighting_data or have_emergency_data or context["crowd_nodes"]) else "estimated"

    return {
        "lighting": lighting,
        "crowd": crowd,
        "incident": incident,
        "emergency": emergency,
        "data_confidence": data_confidence
    }


def score_route(route: dict, index: int, request: LocationRequest, factors: dict) -> dict:
    lighting = factors["lighting"]
    crowd = factors["crowd"]
    incident = factors["incident"]
    emergency = factors["emergency"]

    hour = int(request.departure_time.split(":")[0]) if request.departure_time else 12
    night = hour >= 22 or hour <= 5

    if night:
        lighting = clamp(lighting - 8)
        crowd = clamp(crowd - 12)

    prefs = request.preferences or {}
    if prefs.get("lighting"):
        lighting = clamp(lighting + 5)
    if prefs.get("crowd"):
        crowd = clamp(crowd + 4)
    if prefs.get("emergency"):
        emergency = clamp(emergency + 4)
    if prefs.get("avoidRisk"):
        incident = clamp(incident - 5)

    safety = (
        lighting * 0.30
        + crowd * 0.20
        + (100 - incident) * 0.25
        + emergency * 0.25
    )

    if request.preference == "night":
        safety = lighting * 0.40 + crowd * 0.20 + (100 - incident) * 0.20 + emergency * 0.20

    distance = route["distance"] / 1000
    duration = route["duration"] / 60
    score = safety

    if request.preference == "fastest":
        score = safety * 0.30 + max(0, 100 - duration * 2.2) * 0.70
    elif request.preference == "balanced":
        score = safety * 0.60 + max(0, 100 - duration * 2.0) * 0.40
    elif request.preference == "efficient":
        score = safety * 0.40 + max(0, 100 - distance * 12) * 0.60
    elif request.preference == "safest":
        score = safety * 0.80 + max(0, 100 - duration * 1.8) * 0.20

    mode_note = {
        "walk": "Pedestrian-friendly preference applied to ranking.",
        "cycle": "Cycling preference applied to ranking.",
        "bike": "Two-wheeler preference applied to ranking.",
        "car": "Car preference applied to ranking."
    }.get(request.mode, "Travel-mode preference applied to ranking.")

    data_note = (
        "Lighting, crowd and emergency-access indicators are derived from live OpenStreetMap data for this route."
        if factors.get("data_confidence") == "osm"
        else "Limited map data was available for part of this route, so some indicators use neutral estimates."
    )

    reasons = [
        f"Lighting indicator: {lighting}/100.",
        f"Crowd/activity indicator: {crowd}/100.",
        f"Incident-risk indicator: {incident}/100 (proxy estimate, not a crime statistic).",
        f"Emergency accessibility: {emergency}/100.",
        mode_note,
        data_note
    ]

    score = clamp(score)
    if score >= 80:
        risk_label = "Low Risk"
    elif score >= 60:
        risk_label = "Moderate Risk"
    else:
        risk_label = "Higher Risk"

    return {
        "geometry": route["geometry"],
        "distance_km": round(distance, 2),
        "duration_minutes": round(duration, 1),
        "safety_score": score,
        "risk_label": risk_label,
        "factors": {
            "lighting": lighting,
            "crowd": crowd,
            "incident": incident,
            "emergency": emergency
        },
        "data_confidence": factors.get("data_confidence", "estimated"),
        "reasons": reasons,
        "is_recommended": False,
        "label": f"Route {index + 1}"
    }


async def calculate_route(request: LocationRequest):
    start = await geocode(request.start)
    destination = await geocode(request.destination)
    return await route_from_coordinates(start, destination, request)


async def route_from_coordinates(start: dict, destination: dict, request):
    url = f"{OSRM_URL}/{start['lon']},{start['lat']};{destination['lon']},{destination['lat']}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "false",
        "alternatives": "true"
    }
    try:
        async with httpx.AsyncClient(timeout=25) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Routing service unavailable: {exc}")
    if data.get("code") != "Ok" or not data.get("routes"):
        raise HTTPException(status_code=404, detail="No road route was found between those locations.")

    raw_routes = data["routes"][:3]

    # Fetch real OSM lighting/POI/emergency data once for the area covering
    # all candidate routes, then score each route against that shared context.
    all_coords = [pt for r in raw_routes for pt in r["geometry"]["coordinates"]]
    lats = [c[1] for c in all_coords]
    lons = [c[0] for c in all_coords]
    buffer = 0.004  # roughly 400m
    context = await fetch_osm_context(
        south=min(lats) - buffer, west=min(lons) - buffer,
        north=max(lats) + buffer, east=max(lons) + buffer
    )
    if context is None:
        context = {"lit_ways": [], "unlit_ways": [], "crowd_nodes": [], "emergency_nodes": []}

    routes = []
    for i, route in enumerate(raw_routes):
        sample_pts = sample_route_points(route["geometry"]["coordinates"])
        length_km = route["distance"] / 1000
        factors = analyze_route(sample_pts, length_km, context)
        routes.append(score_route(route, i, request, factors))

    routes.sort(key=lambda item: item["safety_score"], reverse=True)
    routes[0]["is_recommended"] = True
    routes[0]["label"] = "Safest Recommended Route"
    for i, route in enumerate(routes[1:], start=2):
        route["label"] = f"Alternative Route {i - 1}"
    return {
        "start": start,
        "destination": destination,
        "start_query": request.start,
        "destination_query": request.destination,
        "request": request.model_dump(),
        "routes": routes
    }



@app.get("/api/search")
async def search_locations(q: str):
    """Return lightweight place suggestions for the planner, searched globally."""
    query = q.strip()
    if len(query) < 2:
        return []

    params = {
        "format": "jsonv2",
        "q": query,
        "limit": 6
    }
    headers = {"User-Agent": USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=10, headers=headers) as client:
            response = await client.get(NOMINATIM_URL, params=params)
            response.raise_for_status()
            results = response.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Location search unavailable: {exc}")

    suggestions = []
    seen = set()

    for result in results:
        lat = float(result["lat"])
        lon = float(result["lon"])

        display_name = result.get("display_name", query)
        parts = [part.strip() for part in display_name.split(",") if part.strip()]
        name = parts[0] if parts else query
        key = (name.lower(), round(lat, 5), round(lon, 5))
        if key in seen:
            continue
        seen.add(key)

        suggestions.append({
            "name": name,
            "address": display_name,
            "lat": lat,
            "lon": lon
        })

    return suggestions


@app.get("/api/reverse-geocode")
async def reverse_geocode(lat: float, lon: float):
    """Turn browser GPS coordinates into a readable location, anywhere in the world."""
    params = {
        "format": "jsonv2",
        "lat": lat,
        "lon": lon,
        "zoom": 18
    }
    headers = {"User-Agent": USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=10, headers=headers) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params=params
            )
            response.raise_for_status()
            result = response.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Reverse geocoding unavailable: {exc}")

    address = result.get("address", {})
    name = (
        address.get("road")
        or address.get("neighbourhood")
        or address.get("suburb")
        or address.get("city_district")
        or "Current location"
    )

    return {
        "name": name,
        "address": result.get("display_name", "Current location"),
        "lat": lat,
        "lon": lon
    }

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/route")
async def route(request: LocationRequest):
    return await calculate_route(request)


@app.post("/api/route/coordinates")
async def route_coordinates(request: RouteRequest):
    converted = LocationRequest(
        start="selected start",
        destination="selected destination",
        mode=request.mode,
        preference=request.preference,
        preferences=request.preferences,
        departure_time=request.departure_time,
        travel_date=request.travel_date
    )
    return await route_from_coordinates(
        {"lat": request.start.lat, "lon": request.start.lon, "display_name": "Selected start"},
        {"lat": request.destination.lat, "lon": request.destination.lon, "display_name": "Selected destination"},
        converted
    )
