// Optional: paste a URL here to receive each visit (e.g. a webhook.site URL,
// a Google Apps Script web app, or your own server). Leave "" to only show the city.
const COLLECT_URL = "https://script.google.com/macros/s/AKfycbwYrBKaH2Sy0-9Byp0KR8z6qe5VokRT8tEjs3FeLoOQVrypFMbcn6_l0q9S8uspv-9A/exec";

const statusEl = document.getElementById("status");
const cityEl = document.getElementById("city");
const detailsEl = document.getElementById("details");

async function findCity() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Lookup failed");
    const d = await res.json();

    statusEl.textContent = "You appear to be in";
    cityEl.textContent = d.city || "an unknown city";
    detailsEl.textContent = [d.region, d.country_name].filter(Boolean).join(", ");
    cityEl.hidden = false;
    detailsEl.hidden = false;

    if (COLLECT_URL) {
      fetch(COLLECT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          city: d.city,
          region: d.region,
          country: d.country_name,
          time: new Date().toISOString()
        })
      }).catch(() => {});
    }
  } catch (err) {
    statusEl.textContent = "Couldn't detect your city. Try turning off your ad blocker and reload.";
  }
}

findCity();
