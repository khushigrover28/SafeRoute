/* =========================================================
   SAFEROUTE — COMPLETE FRONTEND PROTOTYPE
========================================================= */


/* =========================================================
   BASIC HELPERS
========================================================= */

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

  authenticated: false,

  authMode: "login",

  language: localStorage.getItem("safeRouteLanguage") || "en",

  theme: localStorage.getItem("safeRouteTheme") || "dark",

  selectedMode: "walk",

  priority: "safety",

  destination: "",

  start: "",

  departureTime: "",

  travelDate: "",

  layer: "risk",

  selectedRoute: 0,

  currentLocation: null,

  currentPage: localStorage.getItem("safeRoutePage") || "planner",

  weights: {

    lighting: 30,

    crowd: 25,

    incidents: 30,

    emergency: 15

  }

};


/* =========================================================
   ROUTE DATA
========================================================= */

const routes = [

  {

    id: "safe",

    name: "Safer practical route",

    score: 86,

    distance: "3.8 km",

    time: "14 min",

    meta: "Balanced safety + practicality",

    reason:
      "Best overall combination of lighting, crowd activity, emergency access and manageable travel time.",

    factors: {

      Lighting: 88,

      "Crowd density": 71,

      "Incident safety": 76,

      "Emergency access": 91

    }

  },

  {

    id: "balanced",

    name: "Balanced route",

    score: 81,

    distance: "3.6 km",

    time: "12 min",

    meta: "Good safety + faster travel",

    reason:
      "A strong compromise between safety signals and shorter travel time.",

    factors: {

      Lighting: 82,

      "Crowd density": 76,

      "Incident safety": 72,

      "Emergency access": 87

    }

  },

  {

    id: "traffic",

    name: "Low-traffic route",

    score: 78,

    distance: "3.5 km",

    time: "12 min",

    meta: "Less crowd · slightly higher risk",

    reason:
      "Useful when avoiding crowded areas matters more than maximum safety.",

    factors: {

      Lighting: 76,

      "Crowd density": 86,

      "Incident safety": 68,

      "Emergency access": 82

    }

  },

  {

    id: "fast",

    name: "Shortest / fastest route",

    score: 63,

    distance: "3.1 km",

    time: "10 min",

    meta: "Fastest · weaker safety signals",

    reason:
      "Shortest travel time, but weaker lighting and incident-safety signals.",

    factors: {

      Lighting: 59,

      "Crowd density": 61,

      "Incident safety": 55,

      "Emergency access": 78

    }

  }

];


/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {

  en: {

    tagline: "Safety-first navigation",

    welcomeBack: "WELCOME TO SAFEROUTE",

    loginTitle: "Travel smarter.<br>Travel safer.",

    loginSubtitle:
      "Sign in to plan safer journeys and keep your safety history in one place.",

    emailPhone: "Email or phone number",

    password: "Password",

    remember: "Remember me",

    forgotPassword: "Forgot password?",

    login: "Log in",

    fullName: "Full name",

    confirmPassword: "Confirm password",

    createAccount: "Create account",

    sendCode: "Send verification code",

    verificationCode: "Verification code",

    newPassword: "New password",

    resetPassword: "Reset password",

    resendCode: "Resend code",
    backToLogin: "Back to login",

    or: "OR",

    noAccount: "Don't have an account?",

    prototypeAuth: "Frontend prototype authentication",

    planRoute: "Plan Route",

    maps: "Maps",

    safetyDashboard: "Safety Dashboard",

    myHistory: "My History",

    reportIncident: "Report Incident",

    aboutSafeRoute: "About SafeRoute",

    sos: "SOS",

    systemName: "WOMEN'S SAFETY ROUTE RECOMMENDATION SYSTEM",

    heroLine1: "Don't just find",

    heroLine2: "the shortest way.",

    heroLine3: "Find the safer way.",

    heroDescription:
      "SafeRoute combines lighting, crowd density, reported incidents, emergency access, distance and travel time to recommend a safer practical route.",

    safetySignals: "safety signals",

    explainableScore: "explainable score",

    adaptableCities: "adaptable cities",

    routePlanner: "ROUTE PLANNER",

    whereGoing: "Where are you going?",

    startingPoint: "STARTING POINT",

    destination: "DESTINATION",

    travellingBy: "HOW ARE YOU TRAVELLING?",

    walk: "Walk",

    cycle: "Cycle",

    bus: "Bus",

    car: "Car",

    auto: "Auto",

    bike: "Bike",

    mattersMost: "WHAT MATTERS MOST?",

    safety: "Safety",

    maximumSafety: "Maximum safety",

    fastest: "Fastest",

    minimumTime: "Minimum travel time",

    balanced: "Balanced",

    safetyTime: "Safety + time",

    preferences: "ADDITIONAL PREFERENCES",

    wellLit: "Prefer well-lit roads",

    crowded: "Prefer active/crowded areas",

    emergencyAccess: "Stay near emergency facilities",

    mainRoads: "Prefer main roads",

    travelDate: "TRAVEL DATE",

    departureTime: "DEPARTURE TIME",

    findBestRoutes: "Find best routes",

    prototypeNote:
      "Prototype route engine · connect real map and safety datasets for deployment",

    routeComparison: "ROUTE COMPARISON",

    chooseConfidence: "Choose with confidence.",

    recenter: "Recenter view",

    safetyLayerActive: "Safety layer active",

    recommended: "RECOMMENDED",

    safetyBreakdown: "SAFETY BREAKDOWN",

    whyRoute: "Why this route?",

    recommendedRoutes: "RECOMMENDED ROUTES",

    averageSafety: "AVERAGE SAFETY SCORE",

    lightingCoverage: "LIGHTING COVERAGE",

    crowdActivity: "CROWD ACTIVITY",

    emergencyActivity: "EMERGENCY ACCESS",

    safetyIntelligence: "Understand the safety around you.",

    dashboardDescription:
      "SafeRoute combines multiple signals to create an explainable picture of route safety.",

    howSafetyCalculated: "HOW SAFETY IS CALCULATED",

    weightedSignals: "Every route gets a weighted safety score.",

    calculationDescription:
      "Road segments are evaluated using multiple signals instead of distance alone. The weights can be adjusted depending on the user's priorities.",

    lighting: "Lighting",

    crowdDensity: "Crowd density",

    incidentRisk: "Incident safety",

    timeBasedActivity: "TIME-BASED ACTIVITY",

    riskChanges: "Risk can change with time.",

    day: "Day",

    evening: "Evening",

    night: "Night",

    lowRisk: "Low risk",

    moderateRisk: "Moderate risk",

    highRisk: "Higher risk",

    journeyHistory: "Your recent journeys.",

    historyDescription:
      "Review your previous routes and safety decisions.",

    communitySignal: "COMMUNITY SAFETY",

    helpImprove: "Help improve the safety picture.",

    reportDescription:
      "Report incidents so safety information can become more useful over time.",

    moreThanNavigation: "More than navigation.",

    aboutDescription:
      "SafeRoute is designed to make safety a visible part of everyday route decisions.",

    safetyFirst: "Safety-first",

    safetyFirstText:
      "Routes are evaluated using safety signals instead of relying only on distance.",

    explainable: "Explainable",

    explainableText:
      "Users can see why a route received its score and which factors influenced it.",

    adaptive: "Adaptive",

    adaptiveText:
      "Preferences, travel mode and departure time can change the route recommendation.",

    communityDriven: "Community-driven",

    communityDrivenText:
      "Verified reports can help create a more useful and continuously updated safety picture.",

    dataTransparency: "DATA TRANSPARENCY",

    safetyDataChanges: "Safety data can change.",

    dataDescription:
      "Real deployment should use verified/open datasets, timestamps, multiple sources and adjustable weights to handle incomplete, outdated or biased reports.",

    builtSafer: "Built for safer decisions.",

    locationPermission:
      "Allow SafeRoute to access your location?",

    locationPermissionText:
      "Your current location will be used only to set your starting point for route planning.",

    notNow: "Not now",

    allowLocation: "Allow location",

    safetyReport: "SAFETY REPORT",

    reportModalText:
      "Help improve the safety information around your community.",

    location: "Location",

    incidentType: "Incident type",

    harassment: "Harassment",

    poorLighting: "Poor lighting",

    suspiciousActivity: "Suspicious activity",

    unsafeStretch: "Unsafe / isolated stretch",

    other: "Other",

    severity: "Severity",

    low: "Low",

    moderate: "Moderate",

    high: "High",

    critical: "Critical",

    description: "Description",

    submitReport: "Submit report",

    emergencySOS: "Emergency SOS",

    sosText:
      "This prototype can be connected to emergency contacts, location sharing and emergency services.",

    activateSOS: "Activate SOS",

    cancel: "Cancel",

    myAccount: "MY ACCOUNT",

    accountTitle: "Your SafeRoute account.",
    accountDescription: "Manage your profile, saved locations and personal safety statistics.",
    profile: "PROFILE",
    savedLocations: "SAVED LOCATIONS",
    savedLocationsTitle: "Places you use often.",
    yourStatistics: "YOUR STATISTICS",
    statsTitle: "Your safety activity.",
    journeysPlanned: "Journeys planned",
    averageScore: "Average safety score",
    reportsSubmitted: "Reports submitted",
    bestScore: "Best route score",
    save: "Save",
    noSavedLocations: "No saved locations yet.",
    remove: "Remove",

    logout: "Log out"

  },


  hi: {

    tagline: "सुरक्षा-केंद्रित नेविगेशन",

    welcomeBack: "SAFEROUTE में आपका स्वागत है",

    loginTitle: "स्मार्ट यात्रा करें।<br>सुरक्षित यात्रा करें।",

    loginSubtitle:
      "सुरक्षित यात्राओं की योजना बनाने और अपनी यात्रा सुरक्षा हिस्ट्री देखने के लिए लॉग इन करें।",

    emailPhone: "ईमेल या फोन नंबर",

    password: "पासवर्ड",

    remember: "मुझे याद रखें",

    forgotPassword: "पासवर्ड भूल गए?",

    login: "लॉग इन",

    fullName: "पूरा नाम",

    confirmPassword: "पासवर्ड की पुष्टि करें",

    createAccount: "अकाउंट बनाएं",

    sendCode: "वेरिफिकेशन कोड भेजें",

    verificationCode: "वेरिफिकेशन कोड",

    newPassword: "नया पासवर्ड",

    resetPassword: "पासवर्ड रीसेट करें",

    resendCode: "कोड दोबारा भेजें",
    backToLogin: "लॉगिन पर वापस जाएं",

    or: "या",

    noAccount: "अभी अकाउंट नहीं है?",

    prototypeAuth: "फ्रंटएंड प्रोटोटाइप ऑथेंटिकेशन",

    planRoute: "रूट प्लान करें",

    maps: "मैप्स",

    safetyDashboard: "सेफ्टी डैशबोर्ड",

    myHistory: "मेरी हिस्ट्री",

    reportIncident: "घटना रिपोर्ट करें",

    aboutSafeRoute: "SafeRoute के बारे में",

    sos: "SOS",

    systemName: "महिलाओं के लिए सुरक्षित रूट सुझाव प्रणाली",

    heroLine1: "सिर्फ रास्ता",

    heroLine2: "सबसे छोटा मत खोजें।",

    heroLine3: "सबसे सुरक्षित रास्ता खोजें।",

    heroDescription:
      "SafeRoute प्रकाश, भीड़, रिपोर्ट की गई घटनाओं, आपातकालीन सुविधाओं, दूरी और यात्रा समय को मिलाकर सुरक्षित और व्यावहारिक रास्ते की सलाह देता है।",

    safetySignals: "सुरक्षा संकेत",

    explainableScore: "समझने योग्य स्कोर",

    adaptableCities: "अनेक शहर",

    routePlanner: "रूट प्लानर",

    whereGoing: "आप कहाँ जा रहे हैं?",

    startingPoint: "शुरुआती स्थान",

    destination: "गंतव्य",

    travellingBy: "आप कैसे यात्रा कर रहे हैं?",

    walk: "पैदल",

    cycle: "साइकिल",

    bus: "बस",

    car: "कार",

    auto: "ऑटो",

    bike: "बाइक",

    mattersMost: "आपके लिए सबसे महत्वपूर्ण क्या है?",

    safety: "सुरक्षा",

    maximumSafety: "अधिकतम सुरक्षा",

    fastest: "सबसे तेज",

    minimumTime: "कम से कम समय",

    balanced: "संतुलित",

    safetyTime: "सुरक्षा + समय",

    preferences: "अतिरिक्त प्राथमिकताएं",

    wellLit: "अच्छी रोशनी वाली सड़कें",

    crowded: "सक्रिय/भीड़ वाले क्षेत्र",

    emergencyAccess: "आपातकालीन सुविधाओं के पास रहें",

    mainRoads: "मुख्य सड़कें पसंद करें",

    travelDate: "यात्रा की तारीख",

    departureTime: "रवाना होने का समय",

    findBestRoutes: "सबसे अच्छे रूट खोजें",

    prototypeNote:
      "प्रोटोटाइप रूट इंजन · वास्तविक मैप और सुरक्षा डेटा जोड़कर इसे डिप्लॉय किया जा सकता है",

    routeComparison: "रूट तुलना",

    chooseConfidence: "विश्वास के साथ चुनें।",

    recenter: "मैप केंद्रित करें",

    safetyLayerActive: "सुरक्षा लेयर सक्रिय",

    recommended: "अनुशंसित",

    safetyBreakdown: "सुरक्षा विवरण",

    whyRoute: "यह रूट क्यों?",

    recommendedRoutes: "अनुशंसित रूट",

    averageSafety: "औसत सुरक्षा स्कोर",

    lightingCoverage: "प्रकाश कवरेज",

    crowdActivity: "भीड़ गतिविधि",

    emergencyActivity: "आपातकालीन पहुंच",

    safetyIntelligence: "अपने आसपास की सुरक्षा समझें।",

    dashboardDescription:
      "SafeRoute कई सुरक्षा संकेतों को मिलाकर रूट की सुरक्षा का समझने योग्य चित्र बनाता है।",

    howSafetyCalculated: "सुरक्षा कैसे गणना की जाती है",

    weightedSignals: "हर रूट को एक भारित सुरक्षा स्कोर मिलता है।",

    calculationDescription:
      "सड़क के हिस्सों का मूल्यांकन केवल दूरी से नहीं बल्कि कई सुरक्षा संकेतों से किया जाता है। उपयोगकर्ता की प्राथमिकताओं के अनुसार इनका भार बदला जा सकता है।",

    lighting: "प्रकाश",

    crowdDensity: "भीड़ घनत्व",

    incidentRisk: "घटना सुरक्षा",

    timeBasedActivity: "समय आधारित गतिविधि",

    riskChanges: "समय के साथ जोखिम बदल सकता है।",

    day: "दिन",

    evening: "शाम",

    night: "रात",

    lowRisk: "कम जोखिम",

    moderateRisk: "मध्यम जोखिम",

    highRisk: "अधिक जोखिम",

    journeyHistory: "आपकी हाल की यात्राएं।",

    historyDescription:
      "अपनी पिछली यात्राओं और सुरक्षा निर्णयों को देखें।",

    communitySignal: "सामुदायिक सुरक्षा",

    helpImprove: "सुरक्षा जानकारी बेहतर बनाने में मदद करें।",

    reportDescription:
      "घटनाओं की रिपोर्ट करें ताकि समय के साथ सुरक्षा जानकारी बेहतर हो सके।",

    moreThanNavigation: "सिर्फ नेविगेशन से अधिक।",

    aboutDescription:
      "SafeRoute रोजमर्रा की यात्रा में सुरक्षा को एक महत्वपूर्ण हिस्सा बनाने के लिए बनाया गया है।",

    safetyFirst: "सुरक्षा पहले",

    safetyFirstText:
      "रूट का मूल्यांकन केवल दूरी के आधार पर नहीं बल्कि सुरक्षा संकेतों के आधार पर किया जाता है।",

    explainable: "समझने योग्य",

    explainableText:
      "उपयोगकर्ता देख सकता है कि रूट को उसका स्कोर क्यों मिला और किन कारकों ने उसे प्रभावित किया।",

    adaptive: "अनुकूल",

    adaptiveText:
      "प्राथमिकताएं, यात्रा का तरीका और रवाना होने का समय रूट की सलाह को बदल सकते हैं।",

    communityDriven: "समुदाय आधारित",

    communityDrivenText:
      "सत्यापित रिपोर्ट लगातार बेहतर सुरक्षा जानकारी बनाने में मदद कर सकती हैं।",

    dataTransparency: "डेटा पारदर्शिता",

    safetyDataChanges: "सुरक्षा डेटा बदल सकता है।",

    dataDescription:
      "वास्तविक सिस्टम में सत्यापित डेटा, टाइमस्टैम्प, कई स्रोत और समायोज्य भार का उपयोग किया जाना चाहिए।",

    builtSafer: "सुरक्षित निर्णयों के लिए बनाया गया।",

    locationPermission:
      "क्या SafeRoute को आपकी लोकेशन की अनुमति दें?",

    locationPermissionText:
      "आपकी वर्तमान लोकेशन का उपयोग केवल शुरुआती स्थान सेट करने के लिए किया जाएगा।",

    notNow: "अभी नहीं",

    allowLocation: "लोकेशन की अनुमति दें",

    safetyReport: "सुरक्षा रिपोर्ट",

    reportModalText:
      "अपने आसपास की सुरक्षा जानकारी बेहतर बनाने में मदद करें।",

    location: "स्थान",

    incidentType: "घटना का प्रकार",

    harassment: "उत्पीड़न",

    poorLighting: "खराब प्रकाश",

    suspiciousActivity: "संदिग्ध गतिविधि",

    unsafeStretch: "असुरक्षित / सुनसान क्षेत्र",

    other: "अन्य",

    severity: "गंभीरता",

    low: "कम",

    moderate: "मध्यम",

    high: "अधिक",

    critical: "गंभीर",

    description: "विवरण",

    submitReport: "रिपोर्ट जमा करें",

    emergencySOS: "आपातकालीन SOS",

    sosText:
      "इस प्रोटोटाइप को आपातकालीन संपर्कों, लोकेशन शेयरिंग और आपातकालीन सेवाओं से जोड़ा जा सकता है।",

    activateSOS: "SOS सक्रिय करें",

    cancel: "रद्द करें",

    myAccount: "मेरा अकाउंट",

    accountTitle: "आपका SafeRoute अकाउंट।",
    accountDescription: "अपनी प्रोफाइल, सेव की गई लोकेशन और सुरक्षा आंकड़े मैनेज करें।",
    profile: "प्रोफाइल",
    savedLocations: "सेव की गई लोकेशन",
    savedLocationsTitle: "आपके अक्सर इस्तेमाल होने वाले स्थान।",
    yourStatistics: "आपके आंकड़े",
    statsTitle: "आपकी सुरक्षा गतिविधि।",
    journeysPlanned: "प्लान की गई यात्राएं",
    averageScore: "औसत सुरक्षा स्कोर",
    reportsSubmitted: "जमा की गई रिपोर्ट",
    bestScore: "सबसे अच्छा रूट स्कोर",
    save: "सेव करें",
    noSavedLocations: "अभी कोई लोकेशन सेव नहीं है।",
    remove: "हटाएं",

    logout: "लॉग आउट"

  }

};


/* =========================================================
   TOAST
========================================================= */

function toast(message){

  const element = $("#toast");

  if(!element){
    return;
  }

  element.textContent = message;

  element.classList.add("show");

  clearTimeout(window.safeRouteToastTimer);

  window.safeRouteToastTimer = setTimeout(() => {

    element.classList.remove("show");

  }, 2500);

}


/* =========================================================
   LANGUAGE
========================================================= */

function applyLanguage(){

  const dictionary =
    translations[state.language] ||
    translations.en;

  /* Keep the document language in sync as well. */
  document.documentElement.lang =
    state.language === "hi"
      ? "hi"
      : "en";

  $$("[data-i18n]").forEach(element => {

    const key =
      element.dataset.i18n;

    if(!Object.prototype.hasOwnProperty.call(dictionary,key)){
      return;
    }

    /*
       innerHTML is intentionally retained because some existing
       translations (for example the login heading) contain <br>.
       No styling or layout is changed here.
    */
    element.innerHTML =
      dictionary[key];

  });

  /* Keep the authentication heading/subtitle in the selected language. */
  showAuthMode(state.authMode);

  localStorage.setItem(
    "safeRouteLanguage",
    state.language
  );

  updateLanguageButton();

  /* Refresh dynamic sections so they do not remain in the old language. */
  renderHistory();
  renderRouteSummary();

}


function updateLanguageButton(){

  const button =
    $("#siteLanguageBtn");

  if(button){

    button.textContent =
      state.language === "en"
        ? "EN"
        : "हि";

  }

  const authLanguage =
    $("#authLanguage");

  if(authLanguage){

    authLanguage.value =
      state.language;

  }

}


function changeLanguage(language){

  if(
    language !== "en" &&
    language !== "hi"
  ){

    language = "en";

  }

  state.language = language;

  applyLanguage();

}


/* =========================================================
   THEME
========================================================= */

function applyTheme(){

  document.body.classList.toggle(
    "light-theme",
    state.theme === "light"
  );

  localStorage.setItem(
    "safeRouteTheme",
    state.theme
  );

  const button =
    $("#themeBtn");

  if(button){

    button.textContent =
      state.theme === "light"
        ? "☀"
        : "☾";

  }

}


function toggleTheme(){

  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  applyTheme();

  toast(
    state.theme === "light"
      ? "Light theme enabled"
      : "Dark theme enabled"
  );

}


/* =========================================================
   VALIDATION
========================================================= */

function isValidEmail(value){

  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
    .test(value.trim());

}


function isValidPhone(value){

  const cleaned =
    value.replace(/[\s()-]/g,"");

  return /^\+?[1-9]\d{7,14}$/.test(cleaned);

}


function isValidIdentifier(value){

  return (
    isValidEmail(value) ||
    isValidPhone(value)
  );

}


function isValidPassword(value){

  return (
    typeof value === "string" &&
    value.length >= 6 &&
    /\d/.test(value)
  );

}


function normalizeIdentifier(value){

  return value
    .trim()
    .toLowerCase();

}


/* =========================================================
   DEMO ACCOUNT STORAGE
========================================================= */

function getAccounts(){

  try{

    return JSON.parse(
      localStorage.getItem(
        "safeRouteAccounts"
      )
    ) || [];

  }catch(error){

    return [];

  }

}


function saveAccounts(accounts){

  localStorage.setItem(
    "safeRouteAccounts",
    JSON.stringify(accounts)
  );

}


function findAccount(identifier){

  const normalized =
    normalizeIdentifier(identifier);

  return getAccounts().find(
    account =>
      account.identifier === normalized
  );

}


/* =========================================================
   AUTH MODE
========================================================= */

function showAuthMode(mode){

  state.authMode = mode;

  const loginForm =
    $("#loginForm");

  const signupForm =
    $("#signupForm");

  const forgotForm =
    $("#forgotForm");

  const title =
    $("#authTitle");

  const subtitle =
    $("#authSubtitle");

  const switchText =
    $("#authSwitchText");

  const switchButton =
    $("#authSwitchBtn");

  if(!loginForm ||
     !signupForm ||
     !forgotForm){

    return;

  }

  loginForm.classList.toggle(
    "hidden",
    mode !== "login"
  );

  signupForm.classList.toggle(
    "hidden",
    mode !== "signup"
  );

  forgotForm.classList.toggle(
    "hidden",
    mode !== "forgot"
  );


  const dictionary =
    translations[state.language];


  if(mode === "login"){

    title.innerHTML =
      dictionary.loginTitle;

    subtitle.textContent =
      dictionary.loginSubtitle;

    switchText.textContent =
      dictionary.noAccount;

    switchButton.textContent =
      dictionary.createAccount;

  }


  if(mode === "signup"){

    title.textContent =
      state.language === "hi"
        ? "अपना SafeRoute अकाउंट बनाएं।"
        : "Create your SafeRoute account.";

    subtitle.textContent =
      state.language === "hi"
        ? "अपनी यात्राओं और सुरक्षा प्राथमिकताओं को एक जगह रखें।"
        : "Keep your journeys and safety preferences in one place.";

    switchText.textContent =
      state.language === "hi"
        ? "पहले से अकाउंट है?"
        : "Already have an account?";

    switchButton.textContent =
      dictionary.login;

  }


  if(mode === "forgot"){

    title.textContent =
      state.language === "hi"
        ? "अकाउंट वापस पाएं।"
        : "Recover your account.";

    subtitle.textContent =
      state.language === "hi"
        ? "अपना ईमेल या फोन नंबर डालें और हम वेरिफिकेशन कोड भेजेंगे।"
        : "Enter your email or phone number and we'll send a verification code.";

    switchText.textContent =
      state.language === "hi"
        ? "लॉगिन पर वापस जाएं"
        : "Back to login";

    switchButton.textContent =
      dictionary.login;

  }

}


/* =========================================================
   AUTH VALIDATION ERRORS
========================================================= */

function setFieldError(inputId, errorId, message){

  const input =
    $("#" + inputId);

  const error =
    $("#" + errorId);

  if(input){

    input.classList.toggle(
      "invalid",
      Boolean(message)
    );

  }

  if(error){

    error.textContent =
      message || "";

  }

}


function clearAuthErrors(){

  $$(".field-error").forEach(
    element =>
      element.textContent = ""
  );

  $$("input").forEach(
    input =>
      input.classList.remove("invalid")
  );

}


/* =========================================================
   LOGIN
========================================================= */

function handleLogin(event){

  event.preventDefault();

  clearAuthErrors();

  const identifier =
    $("#loginIdentifier").value.trim();

  const password =
    $("#loginPassword").value;

  let valid = true;


  if(!isValidIdentifier(identifier)){

    setFieldError(
      "loginIdentifier",
      "loginIdentifierError",
      state.language === "hi"
        ? "कृपया सही ईमेल या फोन नंबर दर्ज करें।"
        : "Enter a valid email or phone number."
    );

    valid = false;

  }


  if(!isValidPassword(password)){

    setFieldError(
      "loginPassword",
      "loginPasswordError",
      state.language === "hi"
        ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए और उसमें एक नंबर होना चाहिए।"
        : "Password must contain at least 6 characters and a number."
    );

    valid = false;

  }


  if(!valid){
    return;
  }


  const account =
    findAccount(identifier);


  if(!account){

    const message =
      state.language === "hi"
        ? "अकाउंट मौजूद नहीं है। कृपया नया अकाउंट बनाएं।"
        : "Account doesn't exist. Please create a new account.";

    setFieldError(
      "loginIdentifier",
      "loginIdentifierError",
      message
    );

    toast(message);

    /*
       IMPORTANT:
       Keep the user on the Login screen.
       Do NOT automatically switch to Create Account.
    */
    return;

  }


  if(account.password !== password){

    setFieldError(
      "loginPassword",
      "loginPasswordError",
      state.language === "hi"
        ? "गलत पासवर्ड। पासवर्ड दोबारा दर्ज करें या Forgot Password चुनें।"
        : "Incorrect password. Try again or use Forgot Password."
    );

    return;

  }


  loginSuccess(account);

}


/* =========================================================
   LOGIN SUCCESS
========================================================= */

function loginSuccess(account){

  state.authenticated = true;

  localStorage.setItem(
    "safeRouteCurrentUser",
    account.identifier
  );

  const authScreen =
    $("#authScreen");

  const app =
    $("#app");

  if(authScreen){
    authScreen.classList.add("hidden");
  }

  if(app){
    app.classList.remove("hidden");
  }


  const profileName =
    $("#profileName");

  const profileIdentifier =
    $("#profileIdentifier");

  const avatar =
    $("#profileAvatar");

  const modalAvatar =
    $("#profileModalAvatar");


  if(profileName){

    profileName.textContent =
      account.name || "SafeRoute User";

  }

  if(profileIdentifier){

    profileIdentifier.textContent =
      account.identifier;

  }

  const letter =
    (account.name || "S")
      .charAt(0)
      .toUpperCase();

  if(avatar){
    avatar.textContent = letter;
  }

  if(modalAvatar){
    modalAvatar.textContent = letter;
  }


  setDefaultPlannerDate();

  renderHistory();

  renderAccountPage();

  applyLanguage();

  applyTheme();

  toast(
    state.language === "hi"
      ? `स्वागत है, ${account.name || "User"}`
      : `Welcome, ${account.name || "User"}`
  );

}


/* =========================================================
   SIGNUP
========================================================= */

function handleSignup(event){

  event.preventDefault();

  clearAuthErrors();

  const name =
    $("#signupName").value.trim();

  const identifier =
    $("#signupIdentifier").value.trim();

  const password =
    $("#signupPassword").value;

  const confirm =
    $("#signupConfirmPassword").value;

  let valid = true;


  if(name.length < 2){

    setFieldError(
      "signupName",
      "signupNameError",
      state.language === "hi"
        ? "कृपया अपना सही नाम दर्ज करें।"
        : "Enter your name."
    );

    valid = false;

  }


  if(!isValidIdentifier(identifier)){

    setFieldError(
      "signupIdentifier",
      "signupIdentifierError",
      state.language === "hi"
        ? "सही ईमेल या फोन नंबर दर्ज करें।"
        : "Enter a valid email or phone number."
    );

    valid = false;

  }


  if(!isValidPassword(password)){

    setFieldError(
      "signupPassword",
      "signupPasswordError",
      state.language === "hi"
        ? "पासवर्ड में कम से कम 6 अक्षर और एक नंबर होना चाहिए।"
        : "Password needs at least 6 characters and a number."
    );

    valid = false;

  }


  if(password !== confirm){

    setFieldError(
      "signupConfirmPassword",
      "signupConfirmError",
      state.language === "hi"
        ? "पासवर्ड मेल नहीं खाते।"
        : "Passwords do not match."
    );

    valid = false;

  }


  if(!valid){
    return;
  }


  const normalized =
    normalizeIdentifier(identifier);

  const accounts =
    getAccounts();


  if(
    accounts.some(
      account =>
        account.identifier === normalized
    )
  ){

    setFieldError(
      "signupIdentifier",
      "signupIdentifierError",
      state.language === "hi"
        ? "इस ईमेल/फोन से अकाउंट पहले से मौजूद है।"
        : "An account with this email/phone already exists."
    );

    return;

  }


  const account = {

    name,

    identifier: normalized,

    password,

    createdAt:
      new Date().toISOString()

  };


  accounts.push(account);

  saveAccounts(accounts);

  toast(
    state.language === "hi"
      ? "अकाउंट बन गया। अब लॉगिन करें।"
      : "Account created. You can now log in."
  );

  /*
     Clear the Create Account form after successful registration.
     Do not carry the newly entered details into the Login form.
  */
  $("#signupName").value = "";
  $("#signupIdentifier").value = "";
  $("#signupPassword").value = "";
  $("#signupConfirmPassword").value = "";

  clearAuthErrors();

  /* Keep Login completely empty so the user enters their credentials. */
  $("#loginIdentifier").value = "";
  $("#loginPassword").value = "";

  showAuthMode("login");

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

let resetIdentifier = "";
let resendInterval = null;
let resendSeconds = 0;


/* STEP 1 */

function handleForgotRequest(event){

  event.preventDefault();

  const identifier =
    $("#forgotIdentifier").value.trim();


  setFieldError(
    "forgotIdentifier",
    "forgotIdentifierError",
    ""
  );


  if(!isValidIdentifier(identifier)){

    setFieldError(
      "forgotIdentifier",
      "forgotIdentifierError",
      state.language === "hi"
        ? "सही ईमेल या फोन नंबर दर्ज करें।"
        : "Enter a valid email or phone number."
    );

    return;

  }


  const account =
    findAccount(identifier);


  if(!account){

    toast(
      state.language === "hi"
        ? "इस जानकारी से कोई अकाउंट नहीं मिला। पहले अकाउंट बनाएं।"
        : "No account found. Please create an account first."
    );

    return;

  }


  resetIdentifier =
    normalizeIdentifier(identifier);


  const stepOne =
    $("#forgotStepOne");

  const stepTwo =
    $("#forgotStepTwo");


  if(stepOne){
    stepOne.classList.add("hidden");
  }

  if(stepTwo){
    stepTwo.classList.remove("hidden");
  }


  const message =
    $("#verificationMessage");


  if(message){

    message.textContent =
      state.language === "hi"
        ? "आपके रजिस्टर्ड संपर्क पर 6 अंकों का कोड भेजा गया है। डेमो कोड: 123456"
        : "A 6-digit code was sent to your registered contact. Demo code: 123456";

  }


  autoFillVerificationCode();

}


/* =========================================================
   VERIFICATION CODE
========================================================= */

function autoFillVerificationCode(){

  const inputs = $$(".code-inputs input");
  const code = "123456";

  inputs.forEach((input,index) => {
    input.value = code[index] || "";
  });

}

function startResendCooldown(){

  clearInterval(resendInterval);
  resendSeconds = 30;

  const button = $("#resendCodeBtn");
  const timer = $("#resendTimer");

  if(button) button.disabled = true;

  const tick = () => {
    if(timer){
      timer.textContent = resendSeconds > 0 ? `(${resendSeconds}s)` : "";
    }

    if(resendSeconds <= 0){
      clearInterval(resendInterval);
      if(button) button.disabled = false;
      return;
    }

    resendSeconds -= 1;
  };

  tick();
  resendInterval = setInterval(tick, 1000);

}


/* =========================================================
   RESET PASSWORD
========================================================= */

function resetPassword(){

  const inputs =
    $$(".code-inputs input");

  const code =
    inputs
      .map(input => input.value)
      .join("");

  const newPassword =
    $("#newPassword").value;


  if(code !== "123456"){

    toast(
      state.language === "hi"
        ? "गलत वेरिफिकेशन कोड।"
        : "Incorrect verification code."
    );

    return;

  }


  if(!isValidPassword(newPassword)){

    toast(
      state.language === "hi"
        ? "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए और उसमें एक नंबर होना चाहिए।"
        : "New password needs at least 6 characters and a number."
    );

    return;

  }


  const accounts =
    getAccounts();

  const index =
    accounts.findIndex(
      account =>
        account.identifier ===
        resetIdentifier
    );


  if(index === -1){

    toast(
      "Account not found"
    );

    return;

  }


  accounts[index].password =
    newPassword;

  saveAccounts(accounts);

  clearInterval(resendInterval);
  resendSeconds = 0;
  if($("#resendTimer")) $("#resendTimer").textContent = "";
  if($("#resendCodeBtn")) $("#resendCodeBtn").disabled = false;

  $("#newPassword").value = "";
  $$(".code-inputs input").forEach(input => input.value = "");

  $("#loginIdentifier").value = resetIdentifier;
  $("#loginPassword").value = "";

  showAuthMode("login");

  toast(
    state.language === "hi"
      ? "पासवर्ड अपडेट हो गया। अब अपने नए पासवर्ड से लॉगिन करें।"
      : "Password updated. Please log in with your new password."
  );

  $("#loginPassword")?.focus();

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function setupPasswordToggles(){

  $$(".password-toggle").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const input =
          $("#" + button.dataset.password);

        if(!input){
          return;
        }

        input.type =
          input.type === "password"
            ? "text"
            : "password";

        button.textContent =
          input.type === "password"
            ? "👁"
            : "🙈";

      }
    );

  });

}


/* =========================================================
   LOCATION PERMISSION
========================================================= */

function openLocationModal(){

  const modal =
    $("#locationModal");

  if(modal){
    modal.classList.add("open");
  }

}


function closeLocationModal(){

  const modal =
    $("#locationModal");

  if(modal){
    modal.classList.remove("open");
  }

}


/* =========================================================
   USE CURRENT LOCATION
========================================================= */

function requestCurrentLocation(){

  openLocationModal();

}


function allowCurrentLocation(){

  if(!navigator.geolocation){

    toast(
      state.language === "hi"
        ? "इस ब्राउज़र में लोकेशन उपलब्ध नहीं है।"
        : "Geolocation is not available in this browser."
    );

    closeLocationModal();

    return;

  }


  toast(
    state.language === "hi"
      ? "लोकेशन की अनुमति मांगी जा रही है..."
      : "Requesting location permission..."
  );


  navigator.geolocation.getCurrentPosition(

    position => {

      state.currentLocation = {

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude

      };


      const fromInput =
        $("#fromInput");


      if(fromInput){

        fromInput.value =
          `Current location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;

      }


      closeLocationModal();


      toast(
        state.language === "hi"
          ? "वर्तमान लोकेशन सेट हो गई।"
          : "Current location set successfully."
      );

    },


    error => {

      closeLocationModal();


      let message =
        "Unable to access your location.";

      if(error.code === 1){

        message =
          state.language === "hi"
            ? "लोकेशन की अनुमति नहीं दी गई।"
            : "Location permission was denied.";

      }

      if(error.code === 2){

        message =
          state.language === "hi"
            ? "लोकेशन उपलब्ध नहीं है।"
            : "Location is unavailable.";

      }

      if(error.code === 3){

        message =
          state.language === "hi"
            ? "लोकेशन प्राप्त करने में समय लग गया।"
            : "Location request timed out.";

      }


      toast(message);

    },

    {

      enableHighAccuracy:true,

      timeout:10000,

      maximumAge:0

    }

  );

}


/* =========================================================
   DATE DEFAULT
========================================================= */

function setDefaultPlannerDate(){

  const dateInput =
    $("#travelDate");

  const timeInput =
    $("#departureTime");


  const today =
    new Date();

  const date =
    today.toISOString()
      .split("T")[0];


  if(dateInput &&
     !dateInput.value){

    dateInput.value =
      date;

  }


  if(timeInput &&
     !timeInput.value){

    const hours =
      String(
        today.getHours()
      ).padStart(2,"0");

    const minutes =
      String(
        today.getMinutes()
      ).padStart(2,"0");

    timeInput.value =
      `${hours}:${minutes}`;

  }

}


/* =========================================================
   ROUTE FACTOR LIST
========================================================= */

function renderFactorList(route){

  const container =
    $("#factorList");

  if(!container){
    return;
  }


  const factors = [

    ["Lighting",route.factors.Lighting],

    [
      "Crowd density",
      route.factors["Crowd density"]
    ],

    [
      "Incident safety",
      route.factors["Incident safety"]
    ],

    [
      "Emergency access",
      route.factors["Emergency access"]
    ]

  ];


  container.innerHTML =
    factors.map(
      ([name,score]) => `

        <div class="factor-row">

          <span class="factor-name">
            ${name}
          </span>

          <span class="factor-bar">
            <i style="width:${score}%"></i>
          </span>

          <span class="factor-score">
            ${score}
          </span>

        </div>

      `
    ).join("");

}


/* =========================================================
   ROUTE SUMMARY
========================================================= */

function renderRouteSummary(){

  const route =
    routes[state.selectedRoute];

  if(!route){
    return;
  }


  const score =
    $("#mainScore");

  const distance =
    $("#mainDistance");

  const time =
    $("#mainTime");

  const name =
    $("#mainRouteName");

  const reason =
    $("#mainRouteReason");

  const ring =
    $("#mainScoreRing");


  if(score){
    score.textContent =
      route.score;
  }

  if(distance){
    distance.textContent =
      route.distance;
  }

  if(time){
    time.textContent =
      route.time;
  }

  if(name){
    name.textContent =
      route.name;
  }

  if(reason){
    reason.textContent =
      route.reason;
  }


  if(ring){

    ring.style.background =
      `conic-gradient(
        var(--cyan) 0 ${route.score}%,
        #19313d ${route.score}% 100%
      )`;

  }


  renderFactorList(route);

  renderRoutes();

  updateRouteVisual();

}


/* =========================================================
   ROUTE CARDS
========================================================= */

function renderRoutes(){

  const container =
    $("#routeCards");

  if(!container){
    return;
  }


  let routeList =
    [...routes];


  /* SAFETY */

  if(state.priority === "safety"){

    routeList.sort(
      (a,b) =>
        b.score - a.score
    );

  }


  /* FASTEST */

  if(state.priority === "fastest"){

    routeList.sort(
      (a,b) => {

        const timeA =
          parseInt(a.time);

        const timeB =
          parseInt(b.time);

        return timeA - timeB;

      }
    );

  }


  /* BALANCED */

  if(state.priority === "balanced"){

    routeList.sort(
      (a,b) => {

        const scoreA =
          a.score * .65;

        const scoreB =
          b.score * .65;

        const timeA =
          parseInt(a.time);

        const timeB =
          parseInt(b.time);

        return (
          (scoreB - timeB) -
          (scoreA - timeA)
        );

      }
    );

  }


  container.innerHTML =
    routeList.map(route => {

      const index =
        routes.indexOf(route);

      const selected =
        index === state.selectedRoute;


      return `

        <div
          class="route-option
          ${selected ? "selected" : ""}"
          data-route="${index}"
        >

          <div>

            <h4>
              ${route.name}
            </h4>

            <p>
              ${route.distance}
              ·
              ${route.time}
              ·
              ${route.meta}
            </p>

          </div>

          <div class="option-score">

            ${route.score}

            <small>/100</small>

          </div>

          <button
            type="button"
            data-select="${index}"
          >

            ${
              selected
                ? "Currently selected ✓"
                : "View this route on map →"
            }

          </button>

        </div>

      `;

    }).join("");


  $$("[data-select]",container)
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          const index =
            Number(
              button.dataset.select
            );

          selectRoute(index);

          showPage("maps");

        }
      );

    });


  $$("[data-route]",container)
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const index =
            Number(
              card.dataset.route
            );

          selectRoute(index);

        }
      );

    });

}


/* =========================================================
   SELECT ROUTE
========================================================= */

function selectRoute(index){

  if(
    index < 0 ||
    index >= routes.length
  ){

    return;

  }


  state.selectedRoute =
    index;

  renderRouteSummary();

  toast(
    state.language === "hi"
      ? `${routes[index].name} चुना गया`
      : `${routes[index].name} selected`
  );

}


/* =========================================================
   ROUTE VISUAL
========================================================= */

function updateRouteVisual(){

  const main =
    $("#routeMain");

  const alt =
    $("#routeAlt");

  const fast =
    $("#routeFast");


  if(!main ||
     !alt ||
     !fast){

    return;

  }


  main.style.opacity =
    state.selectedRoute === 0
      ? "1"
      : ".8";

  alt.style.opacity =
    state.selectedRoute === 1 ||
    state.selectedRoute === 2
      ? ".95"
      : ".4";

  fast.style.opacity =
    state.selectedRoute === 3
      ? ".95"
      : ".4";


  if(state.selectedRoute === 0){

    main.style.stroke =
      "var(--cyan)";

  }

  if(state.selectedRoute === 1){

    alt.style.stroke =
      "#ffd76b";

  }

  if(state.selectedRoute === 2){

    alt.style.stroke =
      "#b8a0ff";

  }

  if(state.selectedRoute === 3){

    fast.style.stroke =
      "#ff8798";

  }

}


/* =========================================================
   FIND ROUTES — LEGACY MOCK FALLBACK
   Uses the hardcoded `routes` array above, NOT the real backend.
   Only reached by triggerRouteSearch() when the live routing engine
   (live_map_route.js / window.safeRouteLive) failed to load. Every
   normal user action goes through triggerRouteSearch() instead of
   calling this directly.
========================================================= */

function findRoutes(){

  const destinationInput =
    $("#toInput");

  const startInput =
    $("#fromInput");


  if(!destinationInput ||
     !startInput){

    return;

  }


  const destination =
    destinationInput.value.trim();

  const start =
    startInput.value.trim();


  if(!start){

    startInput.focus();

    toast(
      state.language === "hi"
        ? "कृपया शुरुआती स्थान दर्ज करें।"
        : "Please enter a starting point."
    );

    return;

  }


  if(!destination){

    destinationInput.focus();

    toast(
      state.language === "hi"
        ? "कृपया गंतव्य दर्ज करें।"
        : "Please enter a destination."
    );

    return;

  }


  const date =
    $("#travelDate")?.value;

  const time =
    $("#departureTime")?.value;


  if(!date){

    toast(
      state.language === "hi"
        ? "यात्रा की तारीख चुनें।"
        : "Please select a travel date."
    );

    return;

  }


  if(!time){

    toast(
      state.language === "hi"
        ? "रवाना होने का समय चुनें।"
        : "Please select a departure time."
    );

    return;

  }


  state.start =
    start;

  state.destination =
    destination;

  state.travelDate =
    date;

  state.departureTime =
    time;


  /* PRIORITY */

  if(state.priority === "safety"){

    state.selectedRoute = 0;

  }

  if(state.priority === "balanced"){

    state.selectedRoute = 1;

  }

  if(state.priority === "fastest"){

    state.selectedRoute = 3;

  }


  /* LOW TRAFFIC PREFERENCE */

  const crowdPreference =
    $('input[value="crowd"]');


  if(
    crowdPreference &&
    crowdPreference.checked &&
    state.priority === "balanced"
  ){

    state.selectedRoute = 2;

  }


  /* UPDATE SUBTITLE */

  const subtitle =
    $("#resultSubtitle");


  if(subtitle){

    subtitle.textContent =
      state.language === "hi"
        ? `${start} से ${destination} तक ${getModeHindi()} यात्रा के लिए रूट तुलना।`
        : `Route comparison from ${start} to ${destination} for your ${state.selectedMode} journey.`;

  }


  /* MAP LABELS */

  const mapStart =
    $("#mapStartLabel");

  const mapDestination =
    $("#mapDestinationLabel");


  if(mapStart){

    mapStart.textContent =
      start.length > 18
        ? start.substring(0,18) + "…"
        : start;

  }


  if(mapDestination){

    mapDestination.textContent =
      destination.length > 18
        ? destination.substring(0,18) + "…"
        : destination;

  }


  /* ADJUST SCORE BASED ON MODE */

  applyTravelModeAdjustment();


  renderRouteSummary();

  saveJourneyToHistory();

  showPage("maps");


  toast(
    state.language === "hi"
      ? "सुरक्षित रूट विश्लेषण पूरा हुआ।"
      : "Best route analysis complete."
  );

}


/* =========================================================
   MODE HINDI
========================================================= */

function getModeHindi(){

  const modes = {

    walk:"पैदल",

    cycle:"साइकिल",

    bus:"बस",

    car:"कार",

    auto:"ऑटो",

    bike:"बाइक"

  };

  return modes[state.selectedMode] || "यात्रा";

}


/* =========================================================
   TRAVEL MODE ADJUSTMENT
========================================================= */

function applyTravelModeAdjustment(){

  const adjustment = {

    walk:0,

    cycle:-1,

    bus:-2,

    car:1,

    auto:0,

    bike:0

  };


  routes.forEach(route => {

    route.displayScore =
      Math.max(
        0,
        Math.min(
          100,
          route.score +
          adjustment[state.selectedMode]
        )
      );

  });

}


/* =========================================================
   QUICK DESTINATIONS
========================================================= */

$$(".quick-destinations button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const input =
          $("#toInput");

        if(!input){
          return;
        }

        input.value =
          button.dataset.destination;

        triggerRouteSearch();

      }
    );

  });


/* =========================================================
   TRAVEL MODE
========================================================= */

$$(".choice-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        $$(".choice-btn")
          .forEach(
            item =>
              item.classList.remove("active")
          );

        button.classList.add("active");

        state.selectedMode =
          button.dataset.mode;


        toast(
          state.language === "hi"
            ? `${button.textContent.trim()} चुना गया`
            : `${button.textContent.trim()} selected`
        );

      }
    );

  });


/* =========================================================
   PRIORITY
========================================================= */

$$(".priority-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        $$(".priority-btn")
          .forEach(
            item =>
              item.classList.remove("active")
          );

        button.classList.add("active");

        state.priority =
          button.dataset.priority;


        if(state.priority === "safety"){

          state.selectedRoute = 0;

        }

        if(state.priority === "balanced"){

          state.selectedRoute = 1;

        }

        if(state.priority === "fastest"){

          state.selectedRoute = 3;

        }


        renderRouteSummary();

      }
    );

  });


/* =========================================================
   SWAP
========================================================= */

/* =========================================================
   FIND ROUTES CTA
   Always move the viewer to the Maps page after a valid route
   request. This is intentionally wired to the main CTA as well
   as the Enter-key flow.
========================================================= */

/* =========================================================
   ROUTE SEARCH — SINGLE ENTRY POINT
   All routing UI actions (main button, quick destinations, Enter key)
   funnel through here. It always prefers the live backend-powered
   engine (live_map_route.js); the old mock findRoutes() below is kept
   only as a fallback if that engine failed to load (e.g. Leaflet CDN
   blocked), so the page never goes fully dead.
========================================================= */

function triggerRouteSearch(event){

  if(
    window.safeRouteLive &&
    typeof window.safeRouteLive.calculateLiveRoute === "function"
  ){

    window.safeRouteLive.calculateLiveRoute(event);

  }else{

    event?.preventDefault?.();
    findRoutes();

  }

}

$("#findRouteBtn")?.addEventListener("click", event => {
  triggerRouteSearch(event);
});


$("#swapBtn")?.addEventListener(
  "click",
  () => {

    const from =
      $("#fromInput");

    const to =
      $("#toInput");


    if(!from || !to){
      return;
    }


    const value =
      from.value;

    from.value =
      to.value;

    to.value =
      value;


    toast(
      state.language === "hi"
        ? "स्थान बदल दिए गए।"
        : "Locations swapped."
    );

  }
);


/* =========================================================
   CLEAR DESTINATION
========================================================= */

$("#clearDestination")?.addEventListener(
  "click",
  () => {

    const input =
      $("#toInput");

    if(!input){
      return;
    }

    input.value = "";

    input.focus();

  }
);


/* =========================================================
   LOCATION
========================================================= */

$("#locateBtn")?.addEventListener(
  "click",
  requestCurrentLocation
);

$("#allowLocation")?.addEventListener(
  "click",
  allowCurrentLocation
);

$("#denyLocation")?.addEventListener(
  "click",
  () => {

    closeLocationModal();

    toast(
      state.language === "hi"
        ? "लोकेशन अभी सेट नहीं की गई।"
        : "Location access cancelled."
    );

  }
);

$("#locationModalClose")?.addEventListener(
  "click",
  closeLocationModal
);


/* =========================================================
   MAP LAYERS
========================================================= */

$$(".map-tool")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        $$(".map-tool")
          .forEach(
            item =>
              item.classList.remove("active")
          );

        button.classList.add("active");

        state.layer =
          button.dataset.map;


        const messages = {

          risk:
            "Combined route-risk view enabled",

          lighting:
            "Street-lighting layer enabled",

          crowd:
            "Crowd-density layer enabled",

          incidents:
            "Reported-incident layer enabled"

        };


        toast(
          messages[state.layer]
        );

      }
    );

  });


/* =========================================================
   MAP PINS
========================================================= */

$$(".map-pin")
  .forEach(pin => {

    pin.addEventListener(
      "click",
      () => {

        const tooltip =
          $("#mapTooltip");

        const map =
          $("#fakeMap");


        if(!tooltip ||
           !map){

          return;

        }


        tooltip.textContent =
          pin.dataset.pin;

        tooltip.style.display =
          "block";


        const pinRect =
          pin.getBoundingClientRect();

        const mapRect =
          map.getBoundingClientRect();


        tooltip.style.left =
          `${pinRect.left - mapRect.left + 35}px`;

        tooltip.style.top =
          `${pinRect.top - mapRect.top - 5}px`;


        clearTimeout(
          window.mapTooltipTimer
        );


        window.mapTooltipTimer =
          setTimeout(
            () => {

              tooltip.style.display =
                "none";

            },
            2800
          );

      }
    );

  });


/* =========================================================
   RECENTER
========================================================= */

$("#recenterBtn")?.addEventListener(
  "click",
  () => {

    toast(
      state.language === "hi"
        ? "मैप को केंद्रित किया गया।"
        : "Map view recentered."
    );

  }
);


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const pageIds = [
  "planner",
  "maps",
  "dashboard",
  "history",
  "report",
  "about",
  "account"
];

function showPage(id, options = {}){

  if(!pageIds.includes(id)){
    id = "planner";
  }

  const pages = $$(`[data-page]`);
  const target = pages.find(page => page.dataset.page === id);

  pages.forEach(page => {
    const isTarget = page === target;
    page.classList.toggle("page-hidden", !isTarget);
    if(isTarget){
      // Restart the entrance animation every time a page is selected.
      page.classList.remove("page-enter-active");
      void page.offsetWidth;
      page.classList.add("page-enter-active");
    }
  });

  $$(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.scroll === id);
  });

  state.currentPage = id;
  localStorage.setItem("safeRoutePage", id);

  if(options.scroll !== false){
    window.scrollTo({top:0, behavior:"smooth"});
  }

  if(id === "history"){
    renderHistory();
  }

  if(id === "account"){
    renderAccountPage();
  }
}

function navigateTo(id){
  showPage(id);
}

$$("[data-scroll]").forEach(button => {
  button.addEventListener("click", () => navigateTo(button.dataset.scroll));
});

/* =========================================================
   INCIDENT MODAL
========================================================= */

function openIncidentModal(){

  const modal =
    $("#incidentModal");

  if(modal){

    modal.classList.add("open");

  }

}


function closeIncidentModal(){

  const modal =
    $("#incidentModal");

  if(modal){

    modal.classList.remove("open");

  }

}


$("#reportBtn")?.addEventListener(
  "click",
  openIncidentModal
);

$("#incidentModalClose")?.addEventListener(
  "click",
  closeIncidentModal
);


/* =========================================================
   INCIDENT FORM
========================================================= */

$("#incidentForm")?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const location =
      $("#incidentLocation").value.trim();

    const description =
      $("#incidentDescription").value.trim();


    if(!location){

      toast(
        state.language === "hi"
          ? "कृपया स्थान दर्ज करें।"
          : "Please enter the incident location."
      );

      return;

    }


    if(!description){

      toast(
        state.language === "hi"
          ? "कृपया घटना का विवरण दें।"
          : "Please describe the incident."
      );

      return;

    }


    const report = {

      id:Date.now(),

      location,

      description,

      type:
        $("#incidentType").value,

      severity:
        $("#incidentSeverity").value,

      date:
        new Date().toLocaleString()

    };


    const reports =
      JSON.parse(
        localStorage.getItem(
          "safeRouteReports"
        ) || "[]"
      );


    reports.push(report);


    localStorage.setItem(
      "safeRouteReports",
      JSON.stringify(reports)
    );

    renderAccountStats();


    $("#incidentSuccess")
      ?.classList.add("show");


    event.target.reset();


    toast(
      state.language === "hi"
        ? "घटना रिपोर्ट सफलतापूर्वक दर्ज हुई।"
        : "Incident report submitted successfully."
    );


    setTimeout(
      closeIncidentModal,
      1200
    );

  }
);


/* =========================================================
   HISTORY
========================================================= */

function getHistory(){

  const currentUser =
    localStorage.getItem(
      "safeRouteCurrentUser"
    ) || "guest";

  try{

    return JSON.parse(
      localStorage.getItem(
        `safeRouteHistory_${currentUser}`
      )
    ) || [];

  }catch(error){

    return [];

  }

}


function saveJourneyToHistory(){

  if(!state.destination){
    return;
  }


  const currentUser =
    localStorage.getItem(
      "safeRouteCurrentUser"
    ) || "guest";


  const history =
    getHistory();


  const route =
    routes[state.selectedRoute];


  const journey = {

    id:Date.now(),

    start:state.start,

    destination:state.destination,

    mode:state.selectedMode,

    date:state.travelDate,

    time:state.departureTime,

    score:route.score,

    route:route.name,

    duration:route.time,

    distance:route.distance

  };


  history.unshift(journey);


  const limited =
    history.slice(0,10);


  localStorage.setItem(

    `safeRouteHistory_${currentUser}`,

    JSON.stringify(limited)

  );


  renderHistory();

}


function renderHistory(){

  const container =
    $("#historyList");

  if(!container){
    return;
  }


  const history =
    getHistory();


  if(!history.length){

    container.innerHTML = `

      <div class="history-item">

        <div class="history-icon">
          ◎
        </div>

        <div>

          <h4>
            ${
              state.language === "hi"
                ? "अभी कोई यात्रा नहीं है"
                : "No journeys yet"
            }
          </h4>

          <p>
            ${
              state.language === "hi"
                ? "अपना पहला सुरक्षित रूट प्लान करें।"
                : "Plan your first safer journey to see it here."
            }
          </p>

        </div>

      </div>

    `;

    return;

  }


  container.innerHTML =
    history.map(item => `

      <div class="history-item">

        <div class="history-icon">
          ${
            item.mode === "walk"
              ? "🚶"
              : item.mode === "bus"
                ? "🚌"
                : item.mode === "car"
                  ? "🚗"
                  : "🧭"
          }
        </div>

        <div>

          <h4>
            ${item.start}
            →
            ${item.destination}
          </h4>

          <p>

            ${item.distance}
            ·
            ${item.duration}
            ·
            ${item.date}
            ·
            ${item.time}

          </p>

        </div>

        <div class="history-score">

          ${item.score}

          <small>/100 safety</small>

        </div>

      </div>

    `).join("");

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

$("#clearHistoryBtn")?.addEventListener(
  "click",
  () => {

    const currentUser =
      localStorage.getItem(
        "safeRouteCurrentUser"
      ) || "guest";


    localStorage.removeItem(
      `safeRouteHistory_${currentUser}`
    );


    renderHistory();
    renderAccountStats();

    toast(
      state.language === "hi"
        ? "यात्रा हिस्ट्री साफ कर दी गई।"
        : "Journey history cleared."
    );

  }
);


/* =========================================================
   SOS
========================================================= */

function openSOS(){

  const modal =
    $("#sosModal");

  if(modal){

    modal.classList.add("open");

  }

}


function closeSOS(){

  const modal =
    $("#sosModal");

  if(modal){

    modal.classList.remove("open");

  }

}


$("#sosBtn")?.addEventListener(
  "click",
  openSOS
);

$("#sosClose")?.addEventListener(
  "click",
  closeSOS
);

$("#cancelSOS")?.addEventListener(
  "click",
  closeSOS
);


$("#confirmSOS")?.addEventListener(
  "click",
  () => {

    closeSOS();

    toast(
      state.language === "hi"
        ? "SOS डेमो सक्रिय किया गया। वास्तविक सिस्टम में इसे आपातकालीन सेवा से जोड़ा जाएगा।"
        : "SOS demo activated. Connect this action to emergency services in the production system."
    );

  }
);


/* =========================================================
   PROFILE
========================================================= */

function openProfile(){
  // The profile avatar is the quick entry point to the full My Account page.
  // This keeps the header clean and puts profile, saved locations and stats
  // in one consistent destination.
  showPage("account");
}


function closeProfile(){

  const modal =
    $("#profileModal");

  if(modal){

    modal.classList.remove("open");

  }

}


$("#profileBtn")?.addEventListener(
  "click",
  openProfile
);

$("#profileClose")?.addEventListener(
  "click",
  closeProfile
);


/* =========================================================
   MY ACCOUNT
========================================================= */

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[char]));
}

function getCurrentAccount(){
  const identifier = localStorage.getItem("safeRouteCurrentUser");
  return identifier ? findAccount(identifier) : null;
}

function getSavedLocations(){
  const user = localStorage.getItem("safeRouteCurrentUser") || "guest";
  try{
    return JSON.parse(localStorage.getItem(`safeRouteLocations_${user}`)) || [];
  }catch(error){
    return [];
  }
}

function saveSavedLocations(locations){
  const user = localStorage.getItem("safeRouteCurrentUser") || "guest";
  localStorage.setItem(`safeRouteLocations_${user}`, JSON.stringify(locations));
}

function renderSavedLocations(){
  const container = $("#savedLocationsList");
  if(!container) return;

  const locations = getSavedLocations();

  if(!locations.length){
    container.innerHTML = `<div class="empty-account-state">${translations[state.language].noSavedLocations}</div>`;
    return;
  }

  container.innerHTML = locations.map((location,index) => `
    <div class="saved-location-item">
      <button class="saved-location-main" data-use-location="${index}">
        <span class="saved-location-icon">⌖</span>
        <span>${escapeHtml(location)}</span>
      </button>
      <button class="saved-location-remove" data-remove-location="${index}" title="${translations[state.language].remove}">×</button>
    </div>
  `).join("");

  $$("[data-use-location]").forEach(button => {
    button.addEventListener("click", () => {
      const location = locations[Number(button.dataset.useLocation)];
      $("#fromInput").value = location;
      showPage("planner");
      toast(state.language === "hi" ? `${location} शुरुआती स्थान के रूप में चुना गया।` : `${location} selected as your starting point.`);
    });
  });

  $$("[data-remove-location]").forEach(button => {
    button.addEventListener("click", () => {
      locations.splice(Number(button.dataset.removeLocation),1);
      saveSavedLocations(locations);
      renderSavedLocations();
    });
  });
}

function renderAccountStats(){
  const history = getHistory();
  const scores = history.map(item => Number(item.score)).filter(Number.isFinite);

  const reports = JSON.parse(localStorage.getItem("safeRouteReports") || "[]");

  $("#statJourneys").textContent = history.length;
  $("#statAverage").textContent = scores.length
    ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)
    : "—";
  $("#statReports").textContent = reports.length;
  $("#statBest").textContent = scores.length ? Math.max(...scores) : "—";
}

function renderAccountPage(){
  const account = getCurrentAccount();
  if(!account) return;

  const name = account.name || "SafeRoute User";
  const letter = name.charAt(0).toUpperCase();

  $("#accountName") && ($("#accountName").textContent = name);
  $("#accountIdentifier") && ($("#accountIdentifier").textContent = account.identifier);
  $("#accountAvatar") && ($("#accountAvatar").textContent = letter);

  renderSavedLocations();
  renderAccountStats();
}

$("#saveLocationBtn")?.addEventListener("click", () => {
  const input = $("#newLocationInput");
  const value = input?.value.trim();

  if(!value){
    toast(state.language === "hi" ? "कृपया लोकेशन दर्ज करें।" : "Please enter a location.");
    return;
  }

  const locations = getSavedLocations();
  if(!locations.some(item => item.toLowerCase() === value.toLowerCase())){
    locations.push(value);
    saveSavedLocations(locations);
  }

  input.value = "";
  renderSavedLocations();

  toast(state.language === "hi" ? "लोकेशन सेव हो गई।" : "Location saved.");
});

$("#accountLogoutBtn")?.addEventListener("click", () => {
  $("#logoutBtn")?.click();
});

/* =========================================================
   LOGOUT
========================================================= */

$("#logoutBtn")?.addEventListener(
  "click",
  () => {

    localStorage.removeItem(
      "safeRouteCurrentUser"
    );


    state.authenticated =
      false;


    closeProfile();


    $("#app")
      ?.classList.add("hidden");

    $("#authScreen")
      ?.classList.remove("hidden");


    showAuthMode("login");


    toast(
      state.language === "hi"
        ? "आप लॉग आउट हो गए हैं।"
        : "You have been logged out."
    );

  }
);


/* =========================================================
   WEIGHTS MODAL
========================================================= */

function openWeights(){

  const modal =
    $("#weightsModal");

  if(!modal){
    return;
  }


  $("#weightLighting").value =
    state.weights.lighting;

  $("#weightCrowd").value =
    state.weights.crowd;

  $("#weightIncidents").value =
    state.weights.incidents;

  $("#weightEmergency").value =
    state.weights.emergency;


  modal.classList.add("open");

}


function closeWeights(){

  $("#weightsModal")
    ?.classList.remove("open");

}


$("#weightsBtn")?.addEventListener(
  "click",
  openWeights
);

$("#weightsClose")?.addEventListener(
  "click",
  closeWeights
);


/* =========================================================
   SAVE WEIGHTS
========================================================= */

$("#saveWeights")?.addEventListener(
  "click",
  () => {

    const values = [

      Number(
        $("#weightLighting").value
      ),

      Number(
        $("#weightCrowd").value
      ),

      Number(
        $("#weightIncidents").value
      ),

      Number(
        $("#weightEmergency").value
      )

    ];


    const valid =
      values.every(
        value =>
          Number.isFinite(value) &&
          value >= 0
      );


    const total =
      values.reduce(
        (sum,value) =>
          sum + value,
        0
      );


    if(!valid ||
       Math.round(total) !== 100){

      toast(
        state.language === "hi"
          ? "सभी चार भारों का कुल 100 होना चाहिए।"
          : "The four weights must total 100."
      );

      return;

    }


    state.weights.lighting =
      values[0];

    state.weights.crowd =
      values[1];

    state.weights.incidents =
      values[2];

    state.weights.emergency =
      values[3];


    closeWeights();


    toast(
      state.language === "hi"
        ? "सुरक्षा भार अपडेट हो गए।"
        : "Safety weights updated."
    );

  }
);


/* =========================================================
   AUTH LANGUAGE
========================================================= */

$("#authLanguage")?.addEventListener(
  "change",
  event => {

    changeLanguage(
      event.target.value
    );

    showAuthMode(
      state.authMode
    );

  }
);


/* =========================================================
   SITE LANGUAGE
========================================================= */

$("#siteLanguageBtn")?.addEventListener(
  "click",
  () => {

    changeLanguage(
      state.language === "en"
        ? "hi"
        : "en"
    );

    renderHistory();

    renderRouteSummary();

    toast(
      state.language === "hi"
        ? "हिंदी भाषा सक्रिय है।"
        : "English language enabled."
    );

  }
);


/* =========================================================
   THEME
========================================================= */

$("#themeBtn")?.addEventListener(
  "click",
  toggleTheme
);


/* =========================================================
   AUTH SWITCH
========================================================= */

$("#authSwitchBtn")?.addEventListener(
  "click",
  () => {

    if(state.authMode === "login"){

      showAuthMode("signup");

    }else{

      showAuthMode("login");

    }

  }
);


/* =========================================================
   FORGOT PASSWORD BUTTON
========================================================= */

$("#forgotPasswordBtn")?.addEventListener(
  "click",
  () => {

    clearAuthErrors();

    showAuthMode("forgot");

    $("#forgotStepOne")
      ?.classList.remove("hidden");

    $("#forgotStepTwo")
      ?.classList.add("hidden");

    resetIdentifier = "";
    clearInterval(resendInterval);
    resendSeconds = 0;
    if($("#resendCodeBtn")) $("#resendCodeBtn").disabled = false;
    if($("#resendTimer")) $("#resendTimer").textContent = "";

  }
);


/* =========================================================
   AUTH FORMS
========================================================= */

$("#loginForm")?.addEventListener(
  "submit",
  handleLogin
);

$("#signupForm")?.addEventListener(
  "submit",
  handleSignup
);

$("#forgotForm")?.addEventListener(
  "submit",
  handleForgotRequest
);

$("#resetPasswordBtn")?.addEventListener(
  "click",
  resetPassword
);

$("#resendCodeBtn")?.addEventListener(
  "click",
  () => {

    if(resendSeconds > 0) return;

    if(!resetIdentifier){
      toast(state.language === "hi" ? "पहले अपना ईमेल या फोन नंबर दर्ज करें।" : "Please enter your email or phone number first.");
      showAuthMode("forgot");
      $("#forgotStepOne")?.classList.remove("hidden");
      $("#forgotStepTwo")?.classList.add("hidden");
      return;
    }

    autoFillVerificationCode();
    startResendCooldown();

    toast(
      state.language === "hi"
        ? "नया verification code भेजा गया। डेमो कोड: 123456"
        : "A new verification code was sent. Demo code: 123456"
    );

  }
);

$("#backToLoginBtn")?.addEventListener("click", () => {
  clearInterval(resendInterval);
  resendSeconds = 0;
  showAuthMode("login");
  $("#forgotStepOne")?.classList.remove("hidden");
  $("#forgotStepTwo")?.classList.add("hidden");
});


/* =========================================================
   VERIFICATION INPUT AUTO ADVANCE
========================================================= */

$$(".code-inputs input")
  .forEach(
    (input,index,inputs) => {

      input.addEventListener(
        "input",
        () => {

          input.value =
            input.value
              .replace(/\D/g,"")
              .slice(0,1);


          if(
            input.value &&
            inputs[index + 1]
          ){

            inputs[index + 1]
              .focus();

          }

        }
      );


      input.addEventListener(
        "keydown",
        event => {

          if(
            event.key === "Backspace" &&
            !input.value &&
            inputs[index - 1]
          ){

            inputs[index - 1]
              .focus();

          }

        }
      );

    }
  );


/* =========================================================
   ENTER KEY
========================================================= */

$("#toInput")?.addEventListener(
  "keydown",
  event => {

    if(event.key === "Enter"){

      triggerRouteSearch(event);

    }

  }
);

$("#fromInput")?.addEventListener(
  "keydown",
  event => {

    if(event.key === "Enter"){

      triggerRouteSearch(event);

    }

  }
);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if(event.key !== "Escape"){
      return;
    }

    closeLocationModal();

    closeIncidentModal();

    closeSOS();

    closeProfile();

    closeWeights();

  }
);


/* =========================================================
   MODAL BACKDROP CLOSE
========================================================= */

$$(".modal-backdrop")
  .forEach(modal => {

    modal.addEventListener(
      "click",
      event => {

        if(event.target !== modal){
          return;
        }

        modal.classList.remove("open");

      }
    );

  });


/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

function checkExistingSession(){

  const identifier =
    localStorage.getItem(
      "safeRouteCurrentUser"
    );


  if(!identifier){

    showAuthMode("login");

    return;

  }


  const account =
    findAccount(identifier);


  if(account){

    loginSuccess(account);

  }else{

    localStorage.removeItem(
      "safeRouteCurrentUser"
    );

    showAuthMode("login");

  }

}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize(){

  applyLanguage();

  applyTheme();

  setupPasswordToggles();

  setDefaultPlannerDate();

  renderRouteSummary();

  renderHistory();

  checkExistingSession();
  showPage(state.currentPage, {scroll:false});

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initialize
);