# dheeraj bhai · BHP School (repo: streed3d)

Google Street View in a **fullscreen webview**. It opens directly in a 360°
panorama at a chosen spot — no 2D map view, no map UI, no API key required.

The app is just a phone-first shell around Google's own Street View embed
(`https://www.google.com/maps/embed?...`), rendered in an `<iframe>` that fills
the screen.

## Run locally

```bash
npm install
npm run dev
```

Build a static site with `npm run build` (output in `dist/`).

## Change the starting area

Edit [`src/config.js`](src/config.js):

```js
export const CONFIG = {
  label: 'BHP School',
  region: 'Satrod Kalan Rd, Hisar, Haryana',
  view: {
    lat: 29.11069827,
    lng: 75.8149245,
    heading: 194.50165329,
    pitch: -4.36154057,
    zoom: 1,
  },
  cleanMode: true,
};
```

This matches the Google Earth viewpoint `29.11069827, 75.8149245`,
heading `194.5°`, tilt `85.64°` (≈ `-4.36°` Street View pitch).

Or deep-link any viewpoint:

```
https://<your-site>/?lat=29.11069827&lng=75.8149245&heading=194.5&pitch=-4.36&zoom=1
```

### About `cleanMode`

The Google logo and "map data" attribution are drawn **inside Google's own
iframe**, so they cannot be removed with our CSS or JS. `cleanMode: true` simply
places a dark gradient over the two bottom corners so they aren't visible.

**Warning:** Google's Maps Platform terms require that attribution to remain
visible. This cover is cosmetic and may put the embed in breach of those terms;
set `cleanMode: false` to disable it.

## Controls

Use the **joystick** at the bottom: left/right turns the view, up/down walks
forward/back along the current heading. The Google arrows and on-image text are
visually hidden by `cleanMode` corner/edge covers; the app's own header reads
"dheeraj bhai" and "BHP School".

Works in portrait and landscape; in landscape the joystick moves to the corner
and the header compacts.

## Deploy to GitHub Pages

The included [workflow](.github/workflows/deploy.yml) builds and publishes the
site on every push to `main`.

1. Repo **Settings → Pages → Source → GitHub Actions**
2. Push to `main`
3. Site: `https://<user>.github.io/streed3d/`

No secrets or API keys are needed.

## Tech

Vanilla JS + Vite + a Google Maps embed iframe. No UI framework, no Maps API
key, no custom panorama renderer.
