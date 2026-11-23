import './style.css';
import { CONFIG, embedUrl } from './config.js';

const $ = (id) => document.getElementById(id);
const frame = $('sv-frame');
const overlay = $('overlay');
const overlayText = $('overlay-text');
const spotName = $('spot-name');
const hint = $('hint');
const joystick = $('joystick');
const knob = $('joystick-knob');

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const RADIUS = 34; // joystick travel in CSS pixels
const MAX_TURN = 8; // degrees at full stick deflection
const MAX_TILT = 4; // degrees at full stick deflection
const MAX_STEP = 6; // metres at full stick deflection

function startView() {
  const q = new URLSearchParams(location.search);
  const view = { ...CONFIG.view };
  for (const key of ['lat', 'lng', 'heading', 'pitch', 'zoom']) {
    const value = Number.parseFloat(q.get(key));
    if (Number.isFinite(value)) view[key] = value;
  }
  return view;
}

const current = startView();
let firstLoad = true;
let stickActive = false;
let lastApply = 0;
let stickBase = null;
let stickNx = 0;
let stickNy = 0;
let repeatTimer = null;

document.body.classList.toggle('clean', Boolean(CONFIG.cleanMode));
spotName.textContent = CONFIG.visitor;
spotName.title = `${current.lat.toFixed(5)}, ${current.lng.toFixed(5)}`;
hint.textContent = 'Joystick: left/right to look · up/down to move';

function applyView() {
  spotName.title = `${current.lat.toFixed(5)}, ${current.lng.toFixed(5)}`;
  frame.src = embedUrl(current);
}

function advance(meters, heading) {
  const h = (heading * Math.PI) / 180;
  const latRad = (current.lat * Math.PI) / 180;
  current.lat += (meters * Math.cos(h)) / 111320;
  current.lng += (meters * Math.sin(h)) / (111320 * Math.max(0.2, Math.cos(latRad)));
}

// Absolute mapping: full deflection = a fixed small turn/move, no matter how
// many pointermove events the browser fires. This keeps the stick gentle.
function setFromStick(nx, ny) {
  current.heading = (stickBase.heading + nx * MAX_TURN + 360) % 360;
  current.pitch = clamp(stickBase.pitch - ny * MAX_TILT, -80, 80);

  const meters = -ny * MAX_STEP; // stick up = walk forward
  const h = (current.heading * Math.PI) / 180;
  const latRad = (stickBase.lat * Math.PI) / 180;
  current.lat = stickBase.lat + (meters * Math.cos(h)) / 111320;
  current.lng = stickBase.lng + (meters * Math.sin(h)) / (111320 * Math.max(0.2, Math.cos(latRad)));
}

function repeatStep() {
  if (!stickActive) return;
  stickBase = { ...current };
  current.heading = (current.heading + stickNx * 1.2 + 360) % 360;
  current.pitch = clamp(current.pitch - stickNy * 0.6, -80, 80);
  advance(-stickNy * 2, current.heading);
  applyView();
}

function updateStick(e) {
  const rect = joystick.getBoundingClientRect();
  let dx = e.clientX - (rect.left + rect.width / 2);
  let dy = e.clientY - (rect.top + rect.height / 2);
  const dist = Math.hypot(dx, dy);
  if (dist > RADIUS) {
    dx *= RADIUS / dist;
    dy *= RADIUS / dist;
  }
  stickNx = dx / RADIUS;
  stickNy = dy / RADIUS;
  knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  setFromStick(stickNx, stickNy);

  const now = performance.now();
  if (now - lastApply > 900) {
    lastApply = now;
    applyView();
  }
}

joystick.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  joystick.setPointerCapture(e.pointerId);
  stickActive = true;
  stickBase = { ...current };
  stickNx = 0;
  stickNy = 0;
  lastApply = performance.now();
  joystick.classList.add('active');
  repeatTimer = setInterval(repeatStep, 900);
});

joystick.addEventListener('pointermove', (e) => {
  if (stickActive) updateStick(e);
});

function releaseStick() {
  if (!stickActive) return;
  stickActive = false;
  clearInterval(repeatTimer);
  repeatTimer = null;
  joystick.classList.remove('active');
  knob.style.transform = 'translate(-50%, -50%)';
  applyView();
}
joystick.addEventListener('pointerup', releaseStick);
joystick.addEventListener('pointercancel', releaseStick);
joystick.addEventListener('lostpointercapture', releaseStick);

frame.addEventListener('load', () => {
  overlay.classList.add('hidden');
  if (firstLoad) {
    firstLoad = false;
    hint.classList.add('show');
    setTimeout(() => hint.classList.remove('show'), 7000);
  }
});

frame.addEventListener('error', () => {
  overlayText.textContent = 'Street View could not load. Check your connection.';
});

setTimeout(() => {
  if (!overlay.classList.contains('hidden')) {
    overlayText.textContent = 'Still loading… if nothing appears, check your connection.';
  }
}, 12000);

frame.src = embedUrl(current);

$('fullscreen-btn').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  } catch {
    hint.textContent = 'Fullscreen is not available here';
  }
});
