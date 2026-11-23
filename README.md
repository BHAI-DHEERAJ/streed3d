# streed3d

**Google Street View in pure 3D panorama mode.** It drops you straight into a
specific area on load. No 2D map, no map view, no flat thumbnails — only the
360° Street View panorama, tuned for phones.

Built with the official **Google Maps JavaScript API** `StreetViewPanorama`.
A `google.maps.Map` is never created, so there is no map UI at all.

## Run locally

1. Get a Google Maps **JavaScript API key** (billing must be enabled on the
   Google Cloud project, and the Maps JavaScript API enabled).
2. Copy `.env.example` to `.env.local` and paste your key:

   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIza...your_key...
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open the printed URL on your phone (same Wi‑Fi) to test touch + motion.

## Change the starting area

Edit [`src/config.js`](src/config.js):

```js
export const CONFIG = {
  label: 'Times Square',
  region: 'Manhattan, New York',
  start: {
    lat: 40.758,
    lng: -73.9855,
    heading: 30,   // compass direction
    pitch: 0,      // look up/down
    zoom: 1,       // Street View zoom level
  },
};
```

You can also deep-link to any viewpoint:

```
https://<your-site>/?lat=40.7580&lng=-73.9855&heading=30&pitch=0
```

## Phone controls

- **Drag** to look around, **pinch / scroll** to zoom
- **Google's arrows** on the imagery move you to the next panorama
- **Motion** button turns on gyroscope tracking (requests permission on iOS)
- **Center** resets to the configured heading
- Compass shows the current heading

## Deploy to GitHub Pages

The included [workflow](.github/workflows/deploy.yml) builds and publishes on
every push to `main`.

1. In the GitHub repo: **Settings → Pages → Source → GitHub Actions**
2. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: your Google Maps JavaScript API key
3. Push to `main`. The site appears at `https://<user>.github.io/streed3d/`.

Restrict the key's **Website referrers** to your GitHub Pages URL in Google
Cloud to prevent abuse.

## Tech

Vanilla JS + Google Maps JavaScript API + Vite. No UI framework, no map library.
