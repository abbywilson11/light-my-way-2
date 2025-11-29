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
 * relativePath est en général "./data/street_lights.geojson"
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

    // On garde juste lat/lng
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

/**
 * Permet à d'autres fichiers (index.js) de récupérer le cache.
 */
export function getStreetLights() {
  return cachedStreetLights;
}

// ----------------------------------------------------
// Helpers pour distance & comptage des lampadaires
// ----------------------------------------------------

// Distance en mètres entre deux points lat/lng (haversine)
function haversineDistanceMeters(a, b) {
  const R = 6371000; // rayon de la Terre
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
 * Compte le nombre de lampadaires dans un rayon donné autour d'un point.
 */
function countLightsNearPoint(point, lights, radiusMeters = 30) {
  let count = 0;

  for (const light of lights) {
    const d = haversineDistanceMeters(point, light);
    if (d <= radiusMeters) {
      count++;
    }
  }

  return count;
}

/**
 * Calcule un lightScore sur 10 pour une route donnée.
 * route.path = tableau de { lat, lng }
 */
export function computeLightScoreForRoute(route, lights) {
  if (!route?.path || route.path.length === 0) {
    return 5; // score neutre
  }
  if (!lights || lights.length === 0) {
    // pas de données → on reste neutre aussi
    return 5;
  }

  let totalLights = 0;

  for (const point of route.path) {
    totalLights += countLightsNearPoint(point, lights, 30);
  }

  const avgLightsPerPoint = totalLights / route.path.length;

  // Normalisation : 0 lampadaires → 2/10, 10+ lampadaires → 10/10
  const score = Math.max(
    2,
    Math.min(10, (avgLightsPerPoint / 10) * 8 + 2)
  );

  return score;
}
