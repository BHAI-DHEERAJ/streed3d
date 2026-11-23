import './style.css';
import { CONFIG, embedUrl } from './config.js';

const $ = (id) => document.getElementById(id);
const frame = $('sv-frame');
const overlay = $('overlay');
const overlayText = $('overlay-text');
const areaName = $('area-name');
const spotName = $('spot-name');
const hint = $('hint');

function startView() {
  const q = new URLSearchParams(location.search);
  const view = { ...CONFIG.view };
  for (const key of ['lat', 'lng', 'heading', 'pitch', 'zoom']) {
    const value = Number.parseFloat(q.get(key));
    if (Number.isFinite(value)) view[key] = value;
  }
  return view;
}

const view = startView();
document.body.classList.toggle('clean', Boolean(CONFIG.cleanMode));
areaName.textContent = `${CONFIG.label} · ${CONFIG.region}`;
spotName.textContent = `${view.lat.toFixed(4)}, ${view.lng.toFixed(4)}`;
hint.textContent = matchMedia('(pointer: coarse)').matches
  ? 'Drag to look around · Tap arrows to move'
  : 'Drag to look · Scroll to zoom · Click arrows to move';

frame.addEventListener('load', () => {
  overlay.classList.add('hidden');
  hint.classList.add('show');
});

frame.addEventListener('error', () => {
  overlayText.textContent = 'Street View could not load. Check your connection.';
});

setTimeout(() => {
  if (!overlay.classList.contains('hidden')) {
    overlayText.textContent = 'Still loading… if nothing appears, check your connection.';
  }
}, 12000);

setTimeout(() => hint.classList.remove('show'), 7000);

frame.src = embedUrl(view);

$('fullscreen-btn').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  } catch {
    hint.textContent = 'Fullscreen is not available here';
  }
});
