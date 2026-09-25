/* SafeRoute live map + backend route adapter
   Keeps the existing SafeRoute UI and route panel intact.
   It adds a Leaflet map and connects the existing Find best routes button
   to the FastAPI routing service, which searches locations worldwide.
*/
(() => {
  "use strict";

  const API = window.SAFE_ROUTE_API || "http://localhost:8000";
  let map = null;
  let routeLayers = [];
  let startMarker = null;
  let destinationMarker = null;
  let latest = null;
  let selected = 0;

  const $ = (id) => document.getElementById(id);

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[c]));
  }

  function mode() {
    const active = document.querySelector(".travel-mode .choice-btn.active");
    return active?.dataset.mode || "walk";
  }

  function preference() {
    const active = document.querySelector(".priority-btn.active");
    return active?.dataset.priority || "safest";
  }

  function preferences() {
    const result = {};
    document.querySelectorAll('input[type="checkbox"][data-preference], input[type="checkbox"][data-pref]')
      .forEach(input => {
        if (input.checked) result[input.dataset.preference || input.dataset.pref] = true;
      });
    return result;
  }

  function toast(message) {
    if (typeof window.toast === "function") window.toast(message);
    else if ($("toast")) $("toast").textContent = message;
  }

  function ensureMap() {
    const host = $("fakeMap");
    if (!host) return null;

    if (!map) {
      // Use the existing map card as the real map surface. Remove only the
      // decorative placeholder layers; the surrounding SafeRoute UI remains untouched.
      host.querySelectorAll(":scope > *").forEach(el => el.remove());

      const live = document.createElement("div");
      live.id = "liveLeafletMap";
      host.appendChild(live);

      const badge = document.createElement("div");
      badge.className = "live-map-badge";
      badge.textContent = "● LIVE ROUTE MAP";
      host.appendChild(badge);

      const legend = document.createElement("div");
      legend.className = "live-map-legend";
      legend.innerHTML = `
        <span><i class="safe"></i>Selected / safer</span>
        <span><i class="alt"></i>Alternative</span>
        <span><i class="risk"></i>Higher risk</span>`;
      host.appendChild(legend);

      map = L.map(live, {
        zoomControl: true,
        preferCanvas: true,
        scrollWheelZoom: true
      }).setView([20, 0], 2); // world view by default; fitBounds() recenters once a route is drawn

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);

      setTimeout(() => map.invalidateSize(), 150);
    } else {
      setTimeout(() => map.invalidateSize(), 50);
    }
    return map;
  }

  function clearMap() {
    routeLayers.forEach(layer => map?.removeLayer(layer));
    routeLayers = [];
    if (startMarker && map) map.removeLayer(startMarker);
    if (destinationMarker && map) map.removeLayer(destinationMarker);
    startMarker = destinationMarker = null;
  }

  function colorFor(route, index) {
    if (index === selected || route.is_recommended) return "#1b9e5a";
    if (route.safety_score >= 70) return "#2f80ed";
    return "#7b8794";
  }

  function drawRoutes(response) {
    const m = ensureMap();
    if (!m) return;
    clearMap();

    response.routes.forEach((route, index) => {
      const layer = L.geoJSON(route.geometry, {
        style: {
          color: colorFor(route, index),
          weight: index === selected ? 6 : 4,
          opacity: index === selected ? 0.95 : 0.72,
          dashArray: index === selected ? null : "7 7"
        }
      });
      layer.on("click", () => selectRoute(index));
      layer.addTo(m);
      routeLayers.push(layer);
    });

    startMarker = L.circleMarker([response.start.lat, response.start.lon], {
      radius: 8,
      color: "#ffffff",
      weight: 3,
      fillColor: "#1b9e5a",
      fillOpacity: 1
    }).addTo(m).bindPopup(`<b>Start</b><br>${escapeHTML(response.start_query)}`);

    destinationMarker = L.circleMarker([response.destination.lat, response.destination.lon], {
      radius: 8,
      color: "#ffffff",
      weight: 3,
      fillColor: "#e34b4b",
      fillOpacity: 1
    }).addTo(m).bindPopup(`<b>Destination</b><br>${escapeHTML(response.destination_query)}`);

    const all = L.featureGroup([
      ...routeLayers,
      startMarker,
      destinationMarker
    ]);
    m.fitBounds(all.getBounds().pad(0.08));
  }

  function renderFactorList(route) {
    const container = $("factorList");
    if (!container) return;
    const factors = route.factors || {};
    const labels = [
      ["Lighting", factors.lighting],
      ["Crowd density", factors.crowd],
      ["Incident safety", Math.max(0, 100 - Number(factors.incident ?? 0))],
      ["Emergency access", factors.emergency]
    ];
    container.innerHTML = labels.map(([label, value]) => `
      <div class="factor-row">
        <div class="factor-name">${escapeHTML(label)}</div>
        <div class="factor-bar"><i style="width:${Math.max(0, Math.min(100, value))}%"></i></div>
        <div class="factor-score">${value}</div>
      </div>
    `).join("");
  }

  function renderSummary(route, response) {
    if ($("mainScore")) $("mainScore").textContent = route.safety_score;
    if ($("mainRouteName")) $("mainRouteName").textContent = route.label;
    if ($("mainDistance")) $("mainDistance").textContent = `${route.distance_km} km`;
    if ($("mainTime")) $("mainTime").textContent = `${route.duration_minutes} min`;
    if ($("mainRouteReason")) $("mainRouteReason").textContent =
      (route.reasons || [route.risk_label])[0];
    if ($("resultSubtitle")) $("resultSubtitle").textContent =
      `Live route comparison from ${response.start_query} to ${response.destination_query}.`;
    if ($("mapStartLabel")) $("mapStartLabel").textContent = response.start_query;
    if ($("mapDestinationLabel")) $("mapDestinationLabel").textContent = response.destination_query;
    renderFactorList(route);
  }

  function renderCards(response) {
    const container = $("routeCards");
    if (!container) return;

    container.innerHTML = response.routes.map((route, index) => `
      <div class="route-option ${index === selected ? "selected" : ""}" data-live-route="${index}">
        <div>
          <h4>${escapeHTML(route.label)}</h4>
          <p>${route.distance_km} km · ${route.duration_minutes} min · ${escapeHTML(route.risk_label)}</p>
        </div>
        <div class="option-score">${route.safety_score}<small>/100</small></div>
        <button type="button">${index === selected ? "Currently selected ✓" : "View this route on map →"}</button>
      </div>
    `).join("");

    container.querySelectorAll("[data-live-route]").forEach(card => {
      card.addEventListener("click", () => selectRoute(Number(card.dataset.liveRoute)));
    });
    if ($("routeCount")) $("routeCount").textContent = `${response.routes.length} live routes`;
  }

  function recordHistory(response, route) {
    // Mirrors the schema script.js's getHistory()/renderHistory() expect,
    // so the History page shows real live-routed journeys instead of the
    // old mock data.
    try {
      const currentUser = localStorage.getItem("safeRouteCurrentUser") || "guest";
      const key = `safeRouteHistory_${currentUser}`;
      const history = JSON.parse(localStorage.getItem(key) || "[]");
      const journey = {
        id: Date.now(),
        start: response.start_query,
        destination: response.destination_query,
        mode: mode(),
        date: response.request?.travel_date || "",
        time: response.request?.departure_time || "",
        score: route.safety_score,
        route: route.label,
        duration: `${route.duration_minutes} min`,
        distance: `${route.distance_km} km`
      };
      history.unshift(journey);
      localStorage.setItem(key, JSON.stringify(history.slice(0, 10)));
      if (typeof window.renderHistory === "function") window.renderHistory();
      if (typeof window.renderAccountStats === "function") window.renderAccountStats();
    } catch (error) {
      console.error("SafeRoute history save failed:", error);
    }
  }

  function selectRoute(index) {
    if (!latest?.routes?.[index]) return;
    selected = index;
    latest.routes.forEach((route, i) => route.selected = i === index);
    routeLayers.forEach((layer, i) => {
      const route = latest.routes[i];
      layer.setStyle({
        color: colorFor(route, i),
        weight: i === selected ? 9 : 5,
        opacity: i === selected ? 1 : 0.62,
        dashArray: i === selected ? null : "10 8"
      });
    });
    renderSummary(latest.routes[index], latest);
    renderCards(latest);
  }

  const locationSearchState = {
    fromInput: { timer: null, results: [], requestId: 0 },
    toInput: { timer: null, results: [], requestId: 0 }
  };

  function hideSuggestions(field) {
    const box = $(`${field === "fromInput" ? "from" : "to"}Suggestions`);
    if (!box) return;
    box.classList.remove("show");
    box.innerHTML = "";
  }

  function renderSuggestions(field, results) {
    const box = $(`${field === "fromInput" ? "from" : "to"}Suggestions`);
    if (!box) return;
    const state = locationSearchState[field];
    state.results = results;

    if (!results.length) {
      box.innerHTML = `<div class="location-empty">No matching places found</div>`;
      box.classList.add("show");
      return;
    }

    box.innerHTML = results.map((place, index) => `
      <button type="button" class="location-suggestion" data-location-index="${index}">
        <span class="location-pin">📍</span>
        <span class="location-copy">
          <strong>${escapeHTML(place.name)}</strong>
          <small>${escapeHTML(place.address)}</small>
        </span>
      </button>
    `).join("");

    box.querySelectorAll(".location-suggestion").forEach(button => {
      button.addEventListener("click", () => {
        const place = state.results[Number(button.dataset.locationIndex)];
        if (!place) return;
        const input = $(field);
        input.value = place.name;
        input.dataset.lat = place.lat;
        input.dataset.lon = place.lon;
        input.dataset.address = place.address;
        hideSuggestions(field);
      });
    });
    box.classList.add("show");
  }

  async function searchLocations(field) {
    const input = $(field);
    if (!input) return;
    const query = input.value.trim();
    if (query.length < 2) { hideSuggestions(field); return; }

    const state = locationSearchState[field];
    const requestId = ++state.requestId;
    try {
      const response = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Location search failed");
      const results = await response.json();
      if (requestId !== state.requestId || input.value.trim() !== query) return;
      renderSuggestions(field, results);
    } catch (error) {
      if (requestId !== state.requestId) return;
      const box = $(`${field === "fromInput" ? "from" : "to"}Suggestions`);
      if (box) {
        box.innerHTML = `<div class="location-empty">Location search unavailable — is the backend running?</div>`;
        box.classList.add("show");
      }
    }
  }

  function handleLocationInput(field) {
    const input = $(field);
    if (!input) return;
    delete input.dataset.lat;
    delete input.dataset.lon;
    delete input.dataset.address;

    const state = locationSearchState[field];
    clearTimeout(state.timer);
    const query = input.value.trim();
    if (query.length < 2) { hideSuggestions(field); return; }

    const box = $(`${field === "fromInput" ? "from" : "to"}Suggestions`);
    if (box) {
      box.innerHTML = `<div class="location-loading">🔎 Searching...</div>`;
      box.classList.add("show");
    }
    state.timer = setTimeout(() => searchLocations(field), 250);
  }

  function wireLocationAutocomplete() {
    ["fromInput", "toInput"].forEach(field => {
      const input = $(field);
      if (!input || input.dataset.autocompleteWired) return;
      input.dataset.autocompleteWired = "1";
      input.addEventListener("input", () => handleLocationInput(field));
      input.addEventListener("focus", () => {
        if (input.value.trim().length >= 2) handleLocationInput(field);
      });
      input.addEventListener("keydown", event => {
        if (event.key === "Escape") hideSuggestions(field);
      });
    });

    document.addEventListener("click", event => {
      if (!event.target.closest(".location-field")) {
        hideSuggestions("fromInput");
        hideSuggestions("toInput");
      }
    });
  }

  async function calculateLiveRoute(event) {
    // event is optional: this is now the single routing entry point, called
    // both from real click events and programmatically (Enter key, quick
    // destination buttons) via window.safeRouteLive.calculateLiveRoute().
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const start = $("fromInput")?.value.trim();
    const destination = $("toInput")?.value.trim();
    const travelDate = $("travelDate")?.value;
    const departureTime = $("departureTime")?.value;

    if (!start || !destination) {
      toast("Enter both a starting point and destination.");
      return;
    }
    if (!travelDate || !departureTime) {
      toast("Select the travel date and departure time.");
      return;
    }

    const button = $("findRouteBtn");
    const original = button?.innerHTML;
    if (button) {
      button.disabled = true;
      button.innerHTML = "<span>Calculating live routes…</span>";
    }

    try {
      const startInput = $("fromInput");
      const destinationInput = $("toInput");
      const hasCoordinates = startInput?.dataset.lat && startInput?.dataset.lon &&
        destinationInput?.dataset.lat && destinationInput?.dataset.lon;

      const endpoint = hasCoordinates ? `${API}/api/route/coordinates` : `${API}/api/route`;
      const payload = hasCoordinates ? {
        start: { lat: Number(startInput.dataset.lat), lon: Number(startInput.dataset.lon) },
        destination: { lat: Number(destinationInput.dataset.lat), lon: Number(destinationInput.dataset.lon) },
        mode: mode(),
        preference: preference(),
        preferences: preferences(),
        departure_time: departureTime,
        travel_date: travelDate
      } : {
        start, destination, mode: mode(), preference: preference(),
        preferences: preferences(), departure_time: departureTime, travel_date: travelDate
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Route calculation failed.");

      latest = data;
      selected = 0;
      renderSummary(data.routes[0], data);
      renderCards(data);
      drawRoutes(data);
      recordHistory(data, data.routes[0]);

      if (typeof window.showPage === "function") {
        window.showPage("maps");
      }
      toast(`Found ${data.routes.length} live route alternatives.`);
    } catch (error) {
      console.error("SafeRoute live routing error:", error);
      toast(error.message || "Unable to calculate live route. Start the backend and try again.");
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original || "<span>Find best routes</span>";
      }
    }
  }

  function wire() {
    wireLocationAutocomplete();
    // findRouteBtn's click is now owned by script.js's triggerRouteSearch(),
    // which calls window.safeRouteLive.calculateLiveRoute() below. This file
    // no longer binds its own click handler, so there is a single routing
    // entry point instead of two competing ones.

    document.querySelectorAll("[data-scroll='maps']").forEach(el => {
      el.addEventListener("click", () => setTimeout(ensureMap, 150));
    });

    const recenter = $("recenterBtn");
    if (recenter) recenter.addEventListener("click", () => {
      if (latest) {
        drawRoutes(latest);
      } else {
        ensureMap();
      }
    });

    checkBackendHealth();
    setInterval(checkBackendHealth, 15000);
  }

  /* =========================================================
     BACKEND CONNECTIVITY CHECK
     Pings /api/health on load and every 15s. Shows a persistent
     banner the moment the backend is unreachable, instead of only
     surfacing "Failed to fetch" after the person clicks something.
  ========================================================= */
  async function checkBackendHealth() {
    const banner = $("backendStatusBanner");
    const urlLabel = $("backendApiUrl");
    if (urlLabel) urlLabel.textContent = API;
    try {
      const response = await fetch(`${API}/api/health`, { cache: "no-store" });
      if (!response.ok) throw new Error("Backend responded with an error");
      if (banner) banner.classList.add("hidden");
    } catch (error) {
      if (banner) banner.classList.remove("hidden");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }

  window.safeRouteLive = {
    ensureMap,
    calculateLiveRoute,
    selectRoute,
    checkBackendHealth,
    get latest() { return latest; }
  };
})();
