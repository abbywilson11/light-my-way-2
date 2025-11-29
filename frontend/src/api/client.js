// frontend/src/api/client.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

// Petite fonction utilitaire pour gérer les erreurs HTTP
async function handleJsonResponse(response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `HTTP ${response.status} – ${response.statusText} – ${text || "No body"}`
    );
  }
  return response.json();
}

/**
 * Routes API – utilisée dans Home.jsx
 */
export async function fetchRoutes(start, end) {
  const url = new URL("/api/routes", API_BASE_URL);
  url.searchParams.set("start", start);
  url.searchParams.set("end", end);

  const response = await fetch(url.toString());
  return handleJsonResponse(response);
}

/**
 * Safety tips – utilisée dans SafetyTips.jsx
 */
export async function fetchSafetyTips() {
  const response = await fetch(`${API_BASE_URL}/api/safety-tips`);
  return handleJsonResponse(response);
}

/**
 * Info page – utilisée dans Info.jsx
 */
export async function fetchInfo() {
  const response = await fetch(`${API_BASE_URL}/api/info`);
  return handleJsonResponse(response);
}

/**
 * Feedback – utilisée dans SafetyTips.jsx
 * payload: { rating, comment, flags, routeId }
 */
export async function sendFeedback(payload) {
  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(response);
}
