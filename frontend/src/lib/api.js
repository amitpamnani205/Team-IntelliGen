const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`${options?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  return res.json();
}

export function getHealth() {
  return request("/health");
}

export function getForecast() {
  return request("/forecast");
}

export function getRecent(hours = 24) {
  return request(`/recent?hours=${hours}`);
}

export function getRisk() {
  return request("/risk");
}

export function getRecommendations() {
  return request("/recommendations");
}

export function getDashboardData() {
  return request("/dashboard-data");
}

export function getModelInfo() {
  return request("/model-info");
}

export function getDataHealth() {
  return request("/data-health");
}

export function runScenario({ solarChangePercent = 0, batteryChangePercent = 0, exportChangePercent = 0 }) {
  return request("/scenario", {
    method: "POST",
    body: JSON.stringify({
      solar_change_percent: solarChangePercent,
      battery_change_percent: batteryChangePercent,
      export_change_percent: exportChangePercent,
    }),
  });
}

// The dataset is scaled to a 50kW pilot system; MW-scale values are converted
// to kW so the dashboard shows numbers people can actually read.
export function mwToKw(mw) {
  return mw * 1000;
}

export function formatKw(mw, digits = 1) {
  return `${mwToKw(mw).toFixed(digits)} kW`;
}
