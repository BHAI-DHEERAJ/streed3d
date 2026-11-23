import './style.css';
import { API_KEY, CONFIG } from './config.js';

const $ = (id) => document.getElementById(id);
const viewport = $('viewport');
const overlay = $('overlay');
const loadingView = $('loading-view');
const setupView = $('setup-view');
const setupText = $('setup-text');
const areaName = $('area-name');
const spotName = $('spot-name');
const compassDial = $('compass-dial');
const compassValue = $('compass-value');
const hint = $('hint');
const motionBtn = $('motion-btn');

let panorama = null;
let entered = false;

areaName.textContent = `${CONFIG.label} · ${CONFIG.region}`;
hint.textContent = matchMedia('(pointer: coarse)').matches
  ? 'Drag to look around · Tap arrows to move'
  : 'Drag to look · Scroll to zoom · Click arrows to move';

function showSetup(message) {
  loadingView.classList.add('hidden');
  setupView.classList.remove('hidden');
  overlay.classList.remove('hidden');
  if (message) setupText.textContent = message;
}

function flashHint(message) {
  hint.textContent = message;
  hint.classList.add('warn');
  clearTimeout(flashHint.timer);
  flashHint.timer = setTimeout(() => {
    hint.classList.remove('warn');
    hint.textContent = matchMedia('(pointer: coarse)').matches
      ? 'Drag to look around · Tap arrows to move'
      : 'Drag to look · Scroll to zoom · Click arrows to move';
  }, 2600);
}

function startView() {
  const q = new URLSearchParams(location.search);
  const lat = Number.parseFloat(q.get('lat'));
  const lng = Number.parseFloat(q.get('lng'));
  const base = { ...CONFIG.start };
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    base.lat = lat;
    base.lng = lng;
    const heading = Number.parseFloat(q.get('heading'));
    const pitch = Number.parseFloat(q.get('pitch'));
    if (Number.isFinite(heading)) base.heading = heading;
    if (Number.isFinite(pitch)) base.pitch = pitch;
  }
  return base;
}

function loadGoogleMaps(key) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.StreetViewPanorama) return resolve();
    window.__streed3dMapsReady = resolve;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__streed3dMapsReady`;
    script.async = true;
    script.onerror = () => reject(new Error('Google Maps could not be loaded. Check your connection.'));
    document.head.appendChild(script);
  });
}

function updateHud() {
  if (!panorama) return;
  const pov = panorama.getPov();
  if (pov && Number.isFinite(pov.heading)) {
    compassValue.textContent = `${Math.round(pov.heading)}°`;
    compassDial.style.transform = `rotate(${-pov.heading}deg)`;
  }
  const place = panorama.getLocation()?.description;
  if (place) spotName.textContent = place;

  if (!entered) {
    entered = true;
    overlay.classList.add('hidden');
  }
}

async function boot() {
  if (!API_KEY || API_KEY === 'YOUR_KEY') {
    showSetup('Add your Google Maps JavaScript API key to enter the area.');
    return;
  }

  try {
    await loadGoogleMaps(API_KEY);
    // In newer API versions the panorama class lives in the streetView library.
    if (!window.google?.maps?.StreetViewPanorama) {
      await google.maps.importLibrary('streetView');
    }
  } catch (error) {
    showSetup(error.message || 'Google Maps could not be loaded.');
    return;
  }

  const view = startView();

  panorama = new google.maps.StreetViewPanorama(viewport, {
    position: { lat: view.lat, lng: view.lng },
    pov: { heading: view.heading, pitch: view.pitch },
    zoom: view.zoom,
    visible: true,

    // Pure panorama: hide every default control, then re-enable only the
    // walking arrows that live on the imagery itself. No map is ever created.
    disableDefaultUI: true,
    linksControl: true,
    clickToGo: true,
    enableCloseButton: false,
    scrollwheel: true,

    // Phone motion is driven by our own button (handles iOS permission).
    motionTracking: true,
    motionTrackingControl: false,
  });

  panorama.addListener('pov_changed', updateHud);
  panorama.addListener('pano_changed', updateHud);
  panorama.addListener('status_changed', () => {
    if (panorama.getStatus() === google.maps.StreetViewStatus.ZERO_RESULTS) {
      showSetup('No Street View imagery at this spot. Change the coordinates in src/config.js.');
    }
  });

  updateHud();
  setTimeout(updateHud, 1200); // fallback if no events fire on a slow connection
}

motionBtn.addEventListener('click', async () => {
  if (!panorama) return;
  if (!matchMedia('(pointer: coarse)').matches && !('ontouchstart' in window)) {
    flashHint('Motion tracking is for phones');
    return;
  }
  try {
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      const result = await DOE.requestPermission();
      if (result !== 'granted') {
        flashHint('Motion permission was denied');
        return;
      }
    }
    const next = !panorama.getMotionTracking();
    panorama.setMotionTracking(next);
    motionBtn.classList.toggle('active', next);
    flashHint(next ? 'Motion on — move your phone to look' : 'Motion off — drag to look');
  } catch {
    flashHint('Motion is not available on this device');
  }
});

$('recenter-btn').addEventListener('click', () => {
  if (!panorama) return;
  panorama.setPov({ heading: startView().heading, pitch: CONFIG.start.pitch });
  flashHint('View recentered');
});

$('fullscreen-btn').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else flashHint('Fullscreen is not supported here');
  } catch {
    flashHint('Fullscreen is not available here');
  }
});

window.addEventListener('keydown', (e) => {
  if (!panorama) return;
  const pov = panorama.getPov();
  if (!pov) return;
  switch (e.key) {
    case 'ArrowLeft': panorama.setPov({ ...pov, heading: pov.heading + 10 }); break;
    case 'ArrowRight': panorama.setPov({ ...pov, heading: pov.heading - 10 }); break;
    case 'ArrowUp': panorama.setPov({ ...pov, pitch: Math.min(80, pov.pitch + 8) }); break;
    case 'ArrowDown': panorama.setPov({ ...pov, pitch: Math.max(-80, pov.pitch - 8) }); break;
    default: return;
  }
  e.preventDefault();
});

boot();
