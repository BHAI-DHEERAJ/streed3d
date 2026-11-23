/**
 * The area you drop into on open. Google renders the actual 360° Street View
 * imagery inside the iframe — this app never draws a map or a 2D view.
 *
 * Override per link with: ?lat=40.7580&lng=-73.9855&heading=30&pitch=0&zoom=1
 */
export const CONFIG = {
  label: 'Times Square',
  region: 'Manhattan, New York',
  view: {
    lat: 40.758,
    lng: -73.9855,
    heading: 30,
    pitch: 0,
    zoom: 1,
  },
};

/**
 * Builds Google's own no-API-key Street View embed URL.
 * `!6m7!...` is the protobuf-style marker for a Street View panorama.
 */
export function embedUrl(view) {
  const pb = `!6m7!1m6!2m2!1d${view.lat}!2d${view.lng}!3f${view.heading}!4f${view.pitch}!5f${view.zoom}`;
  return `https://www.google.com/maps/embed?origin=mfe&pb=${pb}`;
}
