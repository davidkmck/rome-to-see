// Scope viewport boundaries around Italy: SW [35.5, 6.5], NE [47.1, 18.5]
const ITALY_BOUNDS = L.latLngBounds([35.5, 6.5], [47.1, 18.5]);
const ROME_CENTER = [41.9028, 12.4964];

const map = L.map('map', {
  center: ROME_CENTER,
  zoom: 13,
  minZoom: 6,        // Minimum zoom allows viewing the entire Italian peninsula
  maxZoom: 18,
  maxBounds: ITALY_BOUNDS,
  maxBoundsViscosity: 1.0,
  zoomControl: false
});

// Primary Basemap (OpenStreetMap / Esri World Topo)
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Landmarks Layer Group
const landmarkGroup = L.layerGroup().addTo(map);
let homeMarker = null;

// Icon Mapping
const EMOJI_ICONS = {
  ancient: '🏛️',
  fountain: '⛲',
  vatican: '⛪',
  square: '🏟️',
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

    marker.on('click', () => {
      map.flyTo([site.lat, site.lon], 16, { animate: true, duration: 1.2 });
    });

    landmarkGroup.addLayer(marker);
  });
}

// Home Base Management
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
    map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
  } else {
    alert("Click anywhere on the map and choose 'Set as Home' first!");
  }
}

// Right-click or long-press map to set Home
map.on('contextmenu', (e) => {
  const { lat, lng } = e.latlng;
  const setHome = confirm(`Set this location (${lat.toFixed(4)}, ${lng.toFixed(4)}) as your Home accommodation?`);
  if (setHome) setHomeLocation(lat, lng);
});

function resetMapView() {
  map.flyTo(ROME_CENTER, 13, { animate: true, duration: 1.2 });
}

window.resetMapView = resetMapView;
window.flyToHome = flyToHome;

// Initialization
loadLandmarks();
loadSavedHome();
