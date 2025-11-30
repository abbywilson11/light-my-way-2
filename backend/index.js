// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loadStreetLights, computeLightScoreForRoute } from "./streetLights.js";

dotenv.config();

const app = express();

// ---------- Middlewares ----------
app.use(cors());          // autorise le frontend à appeler l'API
app.use(express.json());  // permet de lire le JSON dans req.body

// ---------- Config ----------
const PORT = process.env.PORT || 5000;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || null;

// ---------- Street lights (Ottawa) chargés au démarrage ----------
let streetLights = [];
try {
  streetLights = loadStreetLights();
  console.log(`💡 Loaded ${streetLights.length} street lights from GeoJSON`);
} catch (err) {
  console.error("❌ Failed to load street lights:", err);
  streetLights = [];
}

// ---------- Stockage en mémoire (feedbacks) ----------
const feedbackStore = [];

// ===================================================
// Helpers pour Google Maps + routes
// ===================================================

/**
 * Appelle Google Directions API pour obtenir des routes entre start et end.
 * Mode: walking, alternatives: true (plusieurs routes possibles).
 */
async function fetchRoutesFromGoogle(start, end) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set in backend/.env");
  }

  const baseUrl = "https://maps.googleapis.com/maps/api/directions/json";

  const url = `${baseUrl}?origin=${encodeURIComponent(
    start
  )}&destination=${encodeURIComponent(
    end
  )}&mode=walking&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Directions HTTP error ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(
      `Google Directions status ${data.status}: ${data.error_message || ""}`
    );
  }

  return data.routes || [];
}

/**
 * Transforme une route Google en format simple pour ton app.
 */
/**
 * Transforme une route Google en format simple pour ton app.
 */
function mapGoogleRouteToInternal(googleRoute) {
  const leg = googleRoute.legs[0];

  // valeurs numériques pour la logique (tri, calculs…)
  const distanceKm = leg.distance.value / 1000;      // m -> km
  const durationMinutes = leg.duration.value / 60;   // s -> min

  // valeurs “humaines” exactement comme Google
  const distanceText = leg.distance.text;   // ex: "0.8 km"
  const durationText = leg.duration.text;   // ex: "12 min"

  // on construit un chemin (path) avec les points du trajet
  const path = leg.steps.map((step) => ({
    lat: step.start_location.lat,
    lng: step.start_location.lng,
  }));

  // ajouter la fin
  path.push({
    lat: leg.end_location.lat,
    lng: leg.end_location.lng,
  });

  return {
    distanceKm,
    durationMinutes,
    distanceText,
    durationText,
    path,
    raw: googleRoute, // on garde l’original si un jour tu veux plus de détails
  };
}


/**
 * Choisit les 3 variantes : fastest / balanced / most-lit.
 */
function pickRouteVariants(enrichedRoutes) {
  if (enrichedRoutes.length === 0) return [];

  const byDuration = [...enrichedRoutes].sort(
    (a, b) => a.durationMinutes - b.durationMinutes
  );
  const byLight = [...enrichedRoutes].sort(
    (a, b) => b.lightScore - a.lightScore
  );

  const fastest = byDuration[0];
  const mostLit = byLight[0];

  // balanced = une route qui n’est ni la plus rapide ni la plus éclairée
  let balanced =
    enrichedRoutes.find((r) => r !== fastest && r !== mostLit) || fastest;

  const result = [
    {
      id: "fastest",
      label: "Fastest route",
      ...fastest,
    },
    {
      id: "balanced",
      label: "Balanced route",
      ...balanced,
    },
    {
      id: "most-lit",
      label: "Most Well Lit route",
      ...mostLit,
    },
  ];
      console.log("DEBUG BACKEND VARIANTS:", result);

  // enlever raw avant d’envoyer au frontend
  return result.map(({ raw, ...clean }) => clean);
}

// ===================================================
// 1) GET /api/routes?start=...&end=...
// ===================================================
app.get("/api/routes", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Missing query params: start, end" });
    }

    // 1) Routes depuis Google
    const googleRoutes = await fetchRoutesFromGoogle(start, end);
    if (googleRoutes.length === 0) {
      return res.status(404).json({ error: "No routes found" });
    }

    // 2) Format interne
    const internalRoutes = googleRoutes.map(mapGoogleRouteToInternal);

    // 3) Calcul du lightScore basé sur les lampadaires réels
    const enrichedRoutes = internalRoutes.map((route) => {
      const lightScore = computeLightScoreForRoute(route.path, streetLights);
      return {
        ...route,
        lightScore,
      };
    });

    // 4) Choisir fastest / balanced / most-lit
    const variants = pickRouteVariants(enrichedRoutes);

    return res.json({
      start,
      end,
      routes: variants,
    });
  } catch (err) {
    console.error("Error in /api/routes:", err);
    return res.status(500).json({
      error: "Failed to compute routes",
      details: err.message,
    });
  }
});

// ===================================================
// 2) GET /api/safety-tips
// ===================================================
app.get("/api/safety-tips", (req, res) => {
  const tips = [
    {
      id: 1,
      category: "Before you go",
      text: "Share your route with a trusted contact and let them know your ETA.",
    },
    {
      id: 2,
      category: "On the way",
      text: "Stay on main roads and walk on well-lit sidewalks whenever possible.",
    },
    {
      id: 3,
      category: "Awareness",
      text: "Keep your headphones volume low so you remain aware of your surroundings.",
    },
    {
      id: 4,
      category: "Emergency",
      text: "If you feel unsafe, move toward a busy area or an open business and call for help.",
    },
  ];

  return res.json({ tips });
});

// ===================================================
// 3) GET /api/info
// ===================================================
app.get("/api/info", (req, res) => {
  const info = {
    title: "How we calculate lighting",
    description:
      "Light My Way estimates how well-lit a route is by combining map directions with public data about streetlights. For each segment of the route, we look at the density and type of nearby streetlights and compute a light score.",
    steps: [
      "We retrieve candidate walking routes between the start and end points using a map API (Google Directions).",
      "For each route, we look up streetlight locations in public open data (e.g., City of Ottawa).",
      "We estimate the lighting level for each segment based on distance to lights, number of lights and type of fixtures.",
      "We aggregate these values into a single light score and compare routes by both time and lighting.",
    ],
    limitations: [
      "We do not use crime data or personal information.",
      "Open data about infrastructure can be incomplete or outdated.",
      "Weather, temporary outages or construction are not reflected in real time.",
      "This tool is a decision-support tool and does not guarantee safety.",
    ],
  };

  return res.json(info);
});

// ===================================================
// 4) POST /api/feedback
// ===================================================
app.post("/api/feedback", (req, res) => {
  const { rating, flags, comment, routeId } = req.body;

  if (rating == null) {
    return res.status(400).json({ error: "rating is required (0–5)" });
  }

  const feedback = {
    id: Date.now().toString(),
    rating,
    flags: Array.isArray(flags) ? flags : [],
    comment: comment || "",
    routeId: routeId || null,
    createdAt: new Date().toISOString(),
  };

  feedbackStore.push(feedback);

  return res.status(201).json({
    message: "Feedback received",
    feedback,
  });
});

// ===================================================
// 5) GET /api/feedback (bonus)
// ===================================================
app.get("/api/feedback", (req, res) => {
  return res.json({
    count: feedbackStore.length,
    feedback: feedbackStore,
  });
});

// ===================================================
// Démarrage du serveur
// ===================================================
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
