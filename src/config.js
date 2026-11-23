/**
 * The area you drop into on open. Google renders the actual 360° Street View
 * imagery inside the iframe — this app never draws a map or a 2D view.
 *
 * Override per link with: ?lat=29.11069827&lng=75.8149245&heading=194.5&pitch=-4.36&zoom=1
 */
export const CONFIG = {
  label: 'BHP School',
  region: 'Satrod Kalan Rd, Hisar, Haryana',
  visitor: 'Dheeraj Bhai',
  view: {
    lat: 29.11069827,
    lng: 75.8149245,
    heading: 194.50165329,
    pitch: -4.36154057,
    zoom: 1,
  },

  // Cosmetic corner cover over Google's logo/attribution in the embed.
  // NOTE: Google's terms require this attribution to stay visible — see README.
  cleanMode: true,
};

/**
 * Builds Google's own no-API-key Street View embed URL.
 * `!6m7!...` is the protobuf-style marker for a Street View panorama.
 */
export function embedUrl(view) {
  const pb = `!6m7!1m6!2m2!1d${view.lat}!2d${view.lng}!3f${view.heading}!4f${view.pitch}!5f${view.zoom}`;
  return `https://www.google.com/maps/embed?origin=mfe&pb=${pb}`;
}
