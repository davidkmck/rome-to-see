const ITALY_BOUNDS = L.latLngBounds([35.5, 6.5], [47.1, 18.5]);
const ROME_CENTER = [41.9028, 12.4964];

const map = L.map('map', {
  center: ROME_CENTER,
  zoom: 13,
  minZoom: 6,
  maxZoom: 18,
  maxBounds: ITALY_BOUNDS,
  maxBoundsViscosity: 1.0,
  zoomControl: false
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const landmarkGroup = L.layerGroup().addTo(map);
let homeMarker = null;
let selectedMarker = null;
let currentCoords = null;

const EMOJI_ICONS = {
  ancient: '🏛️',
  fountain: '⛲',
  vatican: '⛪',
  square: '🏟️',
  airport: '✈️',
  transit: '🚆',
  mall: '🛍️',
  museum: '🖼️',
  gallery: '🎨',
  default: '📍'
};

function loadLandmarks() {
  landmarkGroup.clearLayers();
  if (typeof ROME_LANDMARKS === 'undefined') return;

  ROME_LANDMARKS.forEach(site => {
    const emoji = EMOJI_ICONS[site.type] || EMOJI_ICONS.default;
    const icon = L.divIcon({
      className: 'landmark-marker',
      html: emoji,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([site.lat, site.lon], { icon })
      .bindTooltip(`<strong>${site.name}</strong><br/>${site.desc}`, { direction: 'top' });

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      setSelectedPoint(site.lat, site.lon);
      map.flyTo([site.lat, site.lon], 16, { animate: true, duration: 1.2 });
    });

    landmarkGroup.addLayer(marker);
  });
}

// Home Base Management via LocalStorage
function setHomeLocation(lat, lng) {
  const coords = [lat, lng];
  localStorage.setItem('rome_home', JSON.stringify(coords));
  
  if (homeMarker) map.removeLayer(homeMarker);

  const homeIcon = L.divIcon({
    className: 'home-marker',
    html: '🏠',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  homeMarker = L.marker(coords, { icon: homeIcon })
    .bindTooltip('<strong>Home / Accommodation</strong>', { permanent: false, direction: 'top' })
    .addTo(map);

  setSelectedPoint(lat, lng);
  map.closePopup();
}

function loadSavedHome() {
  const saved = localStorage.getItem('rome_home');
  if (saved) {
    const [lat, lng] = JSON.parse(saved);
    setHomeLocation(lat, lng);
  }
}

function flyToHome() {
  const saved = localStorage.getItem('rome_home');
  if (saved) {
    const [lat, lng] = JSON.parse(saved);
    setSelectedPoint(lat, lng);
    map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
  } else {
    alert("Click anywhere on the map and choose 'Set as Home' first!");
  }
}

// Selected Point & Display Controls
function setSelectedPoint(lat, lng) {
  currentCoords = { lat: lat.toFixed(5), lng: lng.toFixed(5) };

  const formattedStr = `${currentCoords.lat}, ${currentCoords.lng}`;
  document.getElementById('coordsInput').value = formattedStr;

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`;
  document.getElementById('gmapsLink').href = gmapsUrl;

  document.getElementById('coordsPanel').classList.remove('hidden');

  if (selectedMarker) map.removeLayer(selectedMarker);

  const selectedIcon = L.divIcon({
    className: 'selected-marker',
    html: '📍',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });

  selectedMarker = L.marker([lat, lng], { icon: selectedIcon }).addTo(map);
}

function copyCoordsToClipboard() {
  if (!currentCoords) return;
  const str = `${currentCoords.lat}, ${currentCoords.lng}`;
  navigator.clipboard.writeText(str).then(() => {
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.innerText = '✅';
    setTimeout(() => { copyBtn.innerText = '📋'; }, 1500);
  });
}

// Map Click Interactions
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  setSelectedPoint(lat, lng);
});

map.on('contextmenu', (e) => {
  const { lat, lng } = e.latlng;
  setSelectedPoint(lat, lng);

  const popupContent = document.createElement('div');
  popupContent.style.textAlign = 'center';
  
  const setHomeBtn = document.createElement('button');
  setHomeBtn.className = 'popup-btn';
  setHomeBtn.innerText = '🏠 Set as Home';
  setHomeBtn.onclick = () => setHomeLocation(lat, lng);

  popupContent.appendChild(setHomeBtn);

  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupContent)
    .openOn(map);
});

function resetMapView() {
  map.flyTo(ROME_CENTER, 13, { animate: true, duration: 1.2 });
}

// Converts DMS string component to Decimal Degrees
function parseDMSComponent(dmsStr) {
  const regex = /(\d+)°\s*(\d+)'\s*([\d.]+)"?\s*([NSEW])/i;
  const match = dmsStr.match(regex);
  if (!match) return null;

  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2]);
  const seconds = parseFloat(match[3]);
  const direction = match[4].toUpperCase();

  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  return decimal;
}

// Parses raw string into [lat, lng] array
function parseCoordinates(input) {
  const str = input.trim();

  // Try standard Decimal format: "41.91838, 12.49865"
  const decRegex = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/;
  const decMatch = str.match(decRegex);
  if (decMatch) {
    return [parseFloat(decMatch[1]), parseFloat(decMatch[3])];
  }

  // Try DMS format: "41°55'06.2"N 12°29'55.1"E" or "41°55'06.2"N, 12°29'55.1"E"
  const parts = str.split(/(?<=[NSEWnsew])[\s,]+/);
  if (parts.length >= 2) {
    const lat = parseDMSComponent(parts[0]);
    const lng = parseDMSComponent(parts[1]);
    if (lat !== null && lng !== null) {
      return [lat, lng];
    }
  }

  return null;
}

// Handler for manual input
function handleManualCoordInput() {
  const rawInput = document.getElementById('coordsInput').value;
  const coords = parseCoordinates(rawInput);

  if (!coords) {
    alert("Invalid coordinate format. Try '41.91838, 12.49865' or '41°55'06.2\"N 12°29'55.1\"E'.");
    return;
  }

  const [lat, lng] = coords;
  const targetLatLng = L.latLng(lat, lng);

  // Bounds Validation
  if (!ITALY_BOUNDS.contains(targetLatLng)) {
    alert("Target location is outside the supported map bounds (Italy).");
    return;
  }

  setSelectedPoint(lat, lng);
  map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
}

// Also trigger auto-navigation on paste
document.getElementById('coordsInput').addEventListener('paste', (e) => {
  setTimeout(() => handleManualCoordInput(), 100);
});

window.handleManualCoordInput = handleManualCoordInput;

window.resetMapView = resetMapView;
window.flyToHome = flyToHome;
window.copyCoordsToClipboard = copyCoordsToClipboard;

// Initialization
loadLandmarks();
loadSavedHome();
