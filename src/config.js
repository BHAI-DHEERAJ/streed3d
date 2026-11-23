/**
 * Where the app drops you when it opens.
 * Google Street View imagery only — there is no 2D map anywhere in this app.
 *
 * You can override the start point per link with:
 *   ?lat=40.7580&lng=-73.9855&heading=30&pitch=0
 */
export const CONFIG = {
  label: 'Times Square',
  region: 'Manhattan, New York',
  start: {
    lat: 40.758,
    lng: -73.9855,
    heading: 30,
    pitch: 0,
    zoom: 1,
  },
};

/** Set VITE_GOOGLE_MAPS_API_KEY in .env.local (or as a GitHub repo secret). */
export const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
