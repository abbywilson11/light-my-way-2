// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loadStreetLights, computeLightScoreForRoute } from "./streetLights.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// -----------------------------------------------------
// LOAD STREETLIGHTS
// -----------------------------------------------------
let streetLights = [];
try {
  streetLights = loadStreetLights();
  console.log(`💡 Loaded ${streetLights.length} street lights`);
} catch (err) {
  console.error("❌ Streetlight load failed:", err);
  streetLights = [];
}

// -----------------------------------------------------
// Fetch Google Directions routes
// -----------------------------------------------------
async function fetchRoutesFromGoogle(start, end) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    start
  )}&destination=${encodeURIComponent(
    end
  )}&mode=walking&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.status !== "OK") {
    throw new Error(`Google Directions error: ${data.status}`);
  }

  return data.routes || [];
}

// -----------------------------------------------------
// Convert Google route → internal format
// -----------------------------------------------------
function mapGoogleRouteToInternal(route) {
  const leg = route.legs[0];

  // Build coordinate path
  const path = leg.steps.map((s) => ({
    lat: s.start_location.lat,
    lng: s.start_location.lng,
  }));
  path.push({
    lat: leg.end_location.lat,
    lng: leg.end_location.lng,
  });

  return {
    distanceKm: leg.distance.value / 1000,
    durationMinutes: leg.duration.value / 60,
    path,
    raw: route,
  };
}

// -----------------------------------------------------
// Pick fastest / balanced / most-lit
// -----------------------------------------------------
function pickRouteVariants(routes) {
  const byDuration = [...routes].sort((a, b) => a.durationMinutes - b.durationMinutes);
  const byLight = [...routes].sort((a, b) => b.lightScore - a.lightScore);

  const fastest = byDuration[0];
  const mostLit = byLight[0];
  const balanced = routes.find((r) => r !== fastest && r !== mostLit) || fastest;

  return [
    { id: "fastest", label: "Fastest route", ...fastest },
    { id: "balanced", label: "Balanced route", ...balanced },
    { id: "most-lit", label: "Most Well Lit route", ...mostLit }
  ];
}

// -----------------------------------------------------
// API: /api/routes
// -----------------------------------------------------
app.get("/api/routes", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing query params: start, end" });
    }

    // 1) Fetch Google routes
    const googleRoutes = await fetchRoutesFromGoogle(start, end);
    const internalRoutes = googleRoutes.map(mapGoogleRouteToInternal);

    // 2) Enrich with lighting data
    const enrichedRoutes = internalRoutes.map((route) => {
      const intersections = route.raw.legs[0].steps.map((s) => ({
        lat: s.end_location.lat,
        lng: s.end_location.lng,
      }));

      const maxSpeed = Math.max(
        ...route.raw.legs[0].steps.map(
          (s) => s.speed_limit_kph || s.speed_limit_mph || 0
        )
      );

      const fullRoute = {
        ...route,
        intersections,
        maxSpeed,
      };

      const score = computeLightScoreForRoute(fullRoute, streetLights);

      return {
        ...fullRoute,
        lightScore: score,
      };
    });

    // 3) Pick variants
    const variants = pickRouteVariants(enrichedRoutes);

    res.json({
      start,
      end,
      routes: variants,
    });
  } catch (err) {
    console.error("❌ /api/routes error:", err);
    res.status(500).json({ error: "Failed to compute routes" });
  }
});

// -----------------------------------------------------
// Start the server
// -----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
