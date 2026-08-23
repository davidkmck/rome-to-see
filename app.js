const ITALY_BOUNDS = L.latLngBounds([35.5, 6.5], [47.1, 18.5]);
let ROME_CENTER = [41.9028, 12.4964]; // Fallback to central Rome

const map = L.map('map', {
  center: ROME_CENTER,
  zoom: 13,
  minZoom: 6,
  maxZoom: 18,
  maxBounds: ITALY_BOUNDS,
  maxBoundsViscosity: 1.0,
  zoomControl: false
});

// Base Map Tile Layers
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri'
});

let isSatellite = false;
osmLayer.addTo(map);

function toggleBaseMap() {
  const toggleBtn = document.getElementById('layerToggleBtn');
  if (isSatellite) {
    map.removeLayer(satelliteLayer);
    map.addLayer(osmLayer);
    if (toggleBtn) toggleBtn.innerHTML = '🛰️ Satellite';
    isSatellite = false;
    localStorage.setItem('rome_map_type', 'standard');
  } else {
    map.removeLayer(osmLayer);
    map.addLayer(satelliteLayer);
    if (toggleBtn) toggleBtn.innerHTML = '🗺️ Standard';
    isSatellite = true;
    localStorage.setItem('rome_map_type', 'satellite');
  }
}

function loadSavedMapType() {
  const savedType = localStorage.getItem('rome_map_type');
  if (savedType === 'satellite') toggleBaseMap();
}

const landmarkGroup = L.layerGroup().addTo(map);
let selectedMarker = null;
let currentCoords = null;

const EMOJI_ICONS = {
  home: '🏠',
  ancient: '🏛️',
  fountain: '⛲',
  vatican: '⛪',
  square: '🏟️',
  airport: '✈️',
  transit: '🚆',
  mall: '🛍️',
  museum: '🖼️',
  gallery: '🎨',
  park: '🌳',
  district: '🍝',
  default: '📍'
};

const CATEGORY_NAMES = {
  home: 'Home Base',
  ancient: 'Ancient & Monuments',
  fountain: 'Fountains',
  vatican: 'Churches & Vatican',
  square: 'Squares & Steps',
  airport: 'Airports',
  transit: 'Train Stations',
  mall: 'Shopping Malls',
  museum: 'Museums',
  gallery: 'Galleries',
  park: 'Parks & Gardens',
  district: 'Neighborhoods',
  default: 'Custom / Other'
};

const categoryLayers = {};
let activeCategories = JSON.parse(localStorage.getItem('rome_active_categories')) || Object.keys(CATEGORY_NAMES);
let customLandmarks = JSON.parse(localStorage.getItem('rome_custom_landmarks')) || [];

function toggleOverlayMinimization() {
  const content = document.getElementById('overlayContent');
  const icon = document.getElementById('minIcon');
  if (!content) return;
  if (content.classList.contains('minimized')) {
    content.classList.remove('minimized');
    if (icon) icon.innerText = '➖';
  } else {
    content.classList.add('minimized');
    if (icon) icon.innerText = '➕';
  }
}

function openAddLandmarkModal() {
  if (!currentCoords) {
    alert("Select a location on the map first!");
    return;
  }
  document.getElementById('customName').value = '';
  document.getElementById('customDesc').value = '';
  document.getElementById('addLandmarkModal').classList.remove('hidden');
}

function closeAddLandmarkModal() {
  document.getElementById('addLandmarkModal').classList.add('hidden');
}

function saveCustomLandmark() {
  const name = document.getElementById('customName').value.trim();
  const type = document.getElementById('customType').value;
  const desc = document.getElementById('customDesc').value.trim();

  if (!name) {
    alert("Please enter a name for the landmark.");
    return;
  }

  const newSite = {
    id: 'custom_' + Date.now(),
    name,
    lat: parseFloat(currentCoords.lat),
    lon: parseFloat(currentCoords.lng),
    type,
    desc,
    isCustom: true
  };

  customLandmarks.push(newSite);
  localStorage.setItem('rome_custom_landmarks', JSON.stringify(customLandmarks));
  
  closeAddLandmarkModal();
  loadLandmarks();
}

function setHomeFromSelected() {
  if (!currentCoords) {
    alert("Tap a location on the map first!");
    return;
  }
  
  const newHome = {
    id: 'custom_' + Date.now(),
    name: 'Home / Accommodation',
    lat: parseFloat(currentCoords.lat),
    lon: parseFloat(currentCoords.lng),
    type: 'home',
    desc: 'Base accommodation',
    isCustom: true
  };

  customLandmarks.push(newHome);
  localStorage.setItem('rome_custom_landmarks', JSON.stringify(customLandmarks));
  loadLandmarks();

  const btn = document.getElementById('setHomeBtn');
  if (btn) {
    btn.innerText = '✅';
    setTimeout(() => { btn.innerText = '🏠'; }, 1500);
  }
}

function deleteCustomLandmark(id) {
  if (!confirm("Are you sure you want to delete this custom landmark?")) return;
  customLandmarks = customLandmarks.filter(item => item.id !== id);
  localStorage.setItem('rome_custom_landmarks', JSON.stringify(customLandmarks));
  loadLandmarks();
}

function loadLandmarks() {
  landmarkGroup.clearLayers();
  Object.keys(CATEGORY_NAMES).forEach(k => categoryLayers[k] = []);

  const allSites = [
    ...(typeof ROME_LANDMARKS !== 'undefined' ? ROME_LANDMARKS : []),
    ...customLandmarks
  ];

  // Set central home reference if at least one 'home' type exists
  const homeSite = allSites.find(s => s.type === 'home');
  if (homeSite) {
    ROME_CENTER = [homeSite.lat, homeSite.lon];
  }

  allSites.forEach(site => {
    const type = CATEGORY_NAMES[site.type] ? site.type : 'default';
    const emoji = EMOJI_ICONS[type] || EMOJI_ICONS.default;
    
    const icon = L.divIcon({
      className: 'landmark-marker',
      html: emoji,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    let tooltipContent = `<strong>${site.name}</strong><br/>${site.desc}`;
    if (site.isCustom) {
      tooltipContent += `<br/><button onclick="deleteCustomLandmark('${site.id}')" style="margin-top:6px; background:#e74c3c; color:white; border:none; border-radius:4px; padding:2px 6px; cursor:pointer; font-size:11px;">🗑️ Delete</button>`;
    }

    const marker = L.marker([site.lat, site.lon], { icon })
      .bindTooltip(tooltipContent, { direction: 'top', interactive: true });

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      setSelectedPoint(site.lat, site.lon);
      map.flyTo([site.lat, site.lon], 16, { animate: true, duration: 1.2 });
    });

    if (!categoryLayers[type]) categoryLayers[type] = [];
    categoryLayers[type].push(marker);

    if (activeCategories.includes(type)) {
      landmarkGroup.addLayer(marker);
    }
  });

  buildFilterPanelUI();
}

function buildFilterPanelUI() {
  const container = document.getElementById('filterOptions');
  if (!container) return;
  container.innerHTML = '';

  Object.keys(CATEGORY_NAMES).forEach(type => {
    if (!categoryLayers[type] || categoryLayers[type].length === 0) return;

    const label = document.createElement('label');
    label.className = 'filter-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = activeCategories.includes(type);
    checkbox.onchange = () => toggleCategory(type, checkbox.checked);

    const iconSpan = document.createElement('span');
    iconSpan.innerText = `${EMOJI_ICONS[type]} ${CATEGORY_NAMES[type]}`;

    label.appendChild(checkbox);
    label.appendChild(iconSpan);
    container.appendChild(label);
  });
}

function toggleCategory(type, isChecked) {
  if (isChecked) {
    if (!activeCategories.includes(type)) activeCategories.push(type);
    if (categoryLayers[type]) {
      categoryLayers[type].forEach(m => landmarkGroup.addLayer(m));
    }
  } else {
    activeCategories = activeCategories.filter(c => c !== type);
    if (categoryLayers[type]) {
      categoryLayers[type].forEach(m => landmarkGroup.removeLayer(m));
    }
  }
  localStorage.setItem('rome_active_categories', JSON.stringify(activeCategories));
}

function toggleFilterPanel() {
  const panel = document.getElementById('filterPanel');
  if (panel) panel.classList.toggle('hidden');
}

function flyToHome() {
  const allSites = [
    ...(typeof ROME_LANDMARKS !== 'undefined' ? ROME_LANDMARKS : []),
    ...customLandmarks
  ];
  const homeSite = allSites.find(s => s.type === 'home');
  
  if (homeSite) {
    setSelectedPoint(homeSite.lat, homeSite.lon);
    map.flyTo([homeSite.lat, homeSite.lon], 16, { animate: true, duration: 1.2 });
  } else {
    alert("No Home landmark added yet! Select a location and tap '🏠' or create a Home landmark.");
  }
}

function setSelectedPoint(lat, lng) {
  currentCoords = { lat: lat.toFixed(5), lng: lng.toFixed(5) };

  document.getElementById('coordsInput').value = `${currentCoords.lat}, ${currentCoords.lng}`;
  document.getElementById('gmapsLink').href = `https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`;
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
    if (copyBtn) {
      copyBtn.innerText = '✅';
      setTimeout(() => { copyBtn.innerText = '📋'; }, 1500);
    }
  });
}

function parseDMSComponent(dmsStr) {
  const regex = /(\d+)°\s*(\d+)'\s*([\d.]+)"?\s*([NSEW])/i;
  const match = dmsStr.match(regex);
  if (!match) return null;

  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2]);
  const seconds = parseFloat(match[3]);
  const direction = match[4].toUpperCase();

  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  if (direction === 'S' || direction === 'W') decimal = -decimal;
  return decimal;
}

function parseCoordinates(input) {
  const str = input.trim();
  const decRegex = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/;
  const decMatch = str.match(decRegex);
  if (decMatch) return [parseFloat(decMatch[1]), parseFloat(decMatch[3])];

  const parts = str.split(/(?<=[NSEWnsew])[\s,]+/);
  if (parts.length >= 2) {
    const lat = parseDMSComponent(parts[0]);
    const lng = parseDMSComponent(parts[1]);
    if (lat !== null && lng !== null) return [lat, lng];
  }
  return null;
}

function handleManualCoordInput() {
  const rawInput = document.getElementById('coordsInput').value;
  const coords = parseCoordinates(rawInput);

  if (!coords) {
    alert("Invalid coordinate format. Try '41.91838, 12.49865' or '41°55'06.2\"N 12°29'55.1\"E'.");
    return;
  }

  const [lat, lng] = coords;
  if (!ITALY_BOUNDS.contains(L.latLng(lat, lng))) {
    alert("Target location is outside the supported map bounds (Italy).");
    return;
  }

  setSelectedPoint(lat, lng);
  map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
}

map.on('click', (e) => {
  setSelectedPoint(e.latlng.lat, e.latlng.lng);
});

const coordsInputElem = document.getElementById('coordsInput');
if (coordsInputElem) {
  coordsInputElem.addEventListener('paste', () => {
    setTimeout(() => handleManualCoordInput(), 100);
  });
}

function resetMapView() {
  map.flyTo(ROME_CENTER, 13, { animate: true, duration: 1.2 });
}

window.toggleBaseMap = toggleBaseMap;
window.toggleFilterPanel = toggleFilterPanel;
window.toggleOverlayMinimization = toggleOverlayMinimization;
window.openAddLandmarkModal = openAddLandmarkModal;
window.closeAddLandmarkModal = closeAddLandmarkModal;
window.saveCustomLandmark = saveCustomLandmark;
window.deleteCustomLandmark = deleteCustomLandmark;
window.setHomeFromSelected = setHomeFromSelected;
window.handleManualCoordInput = handleManualCoordInput;
window.resetMapView = resetMapView;
window.flyToHome = flyToHome;
window.copyCoordsToClipboard = copyCoordsToClipboard;

loadLandmarks();
loadSavedMapType();
