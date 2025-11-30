// backend/streetLights.js
import fs from "fs";
import path from "path";
import url from "url";

// Pour reconstruire __dirname en ES modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache en mémoire
let cachedStreetLights = [];

/**
 * Charge le fichier GeoJSON de lampadaires au démarrage.
 */
export function loadStreetLights(relativePath = "./data/street_lights.geojson") {
  try {
    const absolutePath = path.resolve(__dirname, relativePath);
    console.log("📥 Loading street lights from:", absolutePath);

    const raw = fs.readFileSync(absolutePath, "utf8");
    const geojson = JSON.parse(raw);

    if (!geojson.features || !Array.isArray(geojson.features)) {
      console.warn("⚠️ street_lights.geojson has no 'features' array.");
      cachedStreetLights = [];
      return cachedStreetLights;
    }

    // Keep only lat/lng coordinates
    cachedStreetLights = geojson.features
      .map((f) => {
        const coords = f.geometry?.coordinates;
        if (!coords || coords.length < 2) return null;
        // GeoJSON = [lng, lat]
        return {
          lat: coords[1],
          lng: coords[0],
        };
      })
      .filter(Boolean);

    console.log(`✅ Loaded ${cachedStreetLights.length} street lights.`);
    return cachedStreetLights;
  } catch (err) {
    console.error("❌ Failed to load street lights:", err);
    cachedStreetLights = [];
    return cachedStreetLights;
  }
}

export function getStreetLights() {
  return cachedStreetLights;
}

// ----------------------------------------------------
// Helpers pour distance & comptage des lampadaires
// ----------------------------------------------------

// Distance Haversine en mètres
function haversineDistanceMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

/**
 * Compte les lampadaires dans un rayon autour d'un point.
 */
function countLightsNearPoint(point, lights, radiusMeters = 30) {
  let count = 0;

  for (const light of lights) {
    if (haversineDistanceMeters(point, light) <= radiusMeters) {
      count++;
    }
  }

  return count;
}

/**
 * Trouve la distance au lampadaire le plus proche.
 */
function distanceToNearestLight(point, lights) {
  let minDist = Infinity;
  for (const light of lights) {
    const d = haversineDistanceMeters(point, light);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// ----------------------------------------------------
// ADVANCED LIGHT SCORE 2.0
// ----------------------------------------------------
/**
 * Calcule un score de luminosité réaliste (0–10)
 * en combinant plusieurs facteurs:
 *  - densité de lampadaires
 *  - distance moyenne au lampadaire le plus proche
 *  - zones "dark" (>80m sans lampadaire)
 *  - intersections éclairées
 *  - pénalités de routes rapides
 */
export function computeLightScoreForRoute(route, lights) {
  if (!route?.path || route.path.length === 0) return 5;
  if (!lights || lights.length === 0) return 5;

  const path = route.path;
  const distanceKm = route.distanceKm || 1;

  // -----------------------------
  // 1. Light density (0–40 pts)
  // -----------------------------
  let totalLights = 0;
  for (const p of path) {
    totalLights += countLightsNearPoint(p, lights, 30);
  }

  const lightsPerKm = totalLights / distanceKm;
  const densityScore = Math.min(lightsPerKm / 10, 1) * 40;

  // -----------------------------
  // 2. Average distance to nearest light (0–25 pts)
  // -----------------------------
  let totalNearestDist = 0;
  for (const p of path) {
    totalNearestDist += distanceToNearestLight(p, lights);
  }

  const avgDist = totalNearestDist / path.length;
  const closenessScore = Math.max(0, (100 - avgDist) / 100) * 25;

  // -----------------------------
  // 3. Dark zone penalty (max -20)
  // -----------------------------
  let darkPenalty = 0;
  for (const p of path) {
    if (distanceToNearestLight(p, lights) > 80) {
      darkPenalty += 2;
    }
  }
  darkPenalty = Math.min(darkPenalty, 20);

  // -----------------------------
  // 4. Intersection bonus (0–10)
  // -----------------------------
  let intersectionLights = 0;
  if (route.intersections) {
    for (const inter of route.intersections) {
      if (distanceToNearestLight(inter, lights) < 30) {
        intersectionLights++;
      }
    }
  }
  const intersectionScore = Math.min(intersectionLights * 2, 10);

  // -----------------------------
  // 5. Speed / unsafe road penalty (0–5)
  // -----------------------------
  const speedPenalty = route.maxSpeed > 50 ? 5 : 0;

  // -----------------------------
  // Final score
  // -----------------------------
  const final =
    densityScore +
    closenessScore +
    intersectionScore -
    darkPenalty -
    speedPenalty;

  // Convert to 0–10 range
  return Math.max(0, Math.min(final / 10, 10));
}
