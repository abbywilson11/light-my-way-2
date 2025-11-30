import React, { useState } from "react";
import "./Home.css";
import { fetchRoutes } from "../../api/client";
import RouteMap from "../../components/RouteMap.jsx";

export default function Home() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRoute =
    routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  // ===========================
  // FETCH ROUTES
  // ===========================
  const handleSearch = async () => {
    if (!fromLocation.trim() || !toLocation.trim()) return;

    try {
      setLoading(true);
      setError("");

    console.log("DEBUG FRONTEND:", {
    fromLocation,
    toLocation,
    fetchRoutesFunction: fetchRoutes.toString(),
    });


      const data = await fetchRoutes(fromLocation, toLocation);

      if (!data.routes || data.routes.length === 0) {
        setRoutes([]);
        setSelectedRouteId(null);
        setError("No routes found. Try another destination.");
        return;
      }

      setRoutes(data.routes);
      setSelectedRouteId(data.routes[0].id);
    } catch (err) {
      console.error(err);
      setError("Could not fetch routes. Please try again.");
      setRoutes([]);
      setSelectedRouteId(null);
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes) => {
    const total = Math.round(minutes);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h <= 0) return `${m} min`;
    return `${h} h ${m} min`;
  };

  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
  };

  return (
    <div className="home-page">

      {/* ===========================
          MAP + BADGES + BANNER
      =========================== */}
      <div className="map-wrapper">
        <div className="map-container">

          {/* MAP ITSELF */}
          <RouteMap routes={routes} selectedRouteId={selectedRouteId} />

          {/* BADGES — only show after directions exist */}
          {routes.length > 0 && (
            <>
              <div className="map-badge map-badge--fastest">Fastest</div>
              <div className="map-badge map-badge--balanced">Balanced</div>
              <div className="map-badge map-badge--mostlit">Most Well Lit</div>
            </>
          )}

          {/* SELECTED ROUTE BANNER — also inside the map only */}
          {selectedRoute && (
            <div className="map-selected-banner">
              <span className="map-selected-label">Selected route:</span>
              <span className="map-selected-value">
                {selectedRoute.label || selectedRoute.id}
              </span>
              <span className="map-selected-extra">
                • {formatMinutes(selectedRoute.durationMinutes)} •{" "}
                {selectedRoute.distanceKm.toFixed(2)} km
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===========================
          SEARCH BAR (FROM/TO)
      =========================== */}
      <div className="search-bar">
        <div className="search-row">
          <span className="search-label">From</span>
          <input
            type="text"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            placeholder="Enter Start Location"
          />
        </div>

        <div className="search-row">
          <span className="search-label">To</span>
          <input
            type="text"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            placeholder="Enter Destination"
          />
        </div>

        <button
          className="go-button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Loading..." : "Go"}
        </button>
      </div>

      {/* ===========================
          DIRECTIONS LIST
      =========================== */}
      <div className="directions-section">
        <h2 className="directions-title">Directions</h2>

        {error && <div className="route-error">{error}</div>}

        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const eta = new Date(Date.now() + route.durationMinutes * 60000)
            .toTimeString()
            .slice(0, 5);

          let cardClass = "route-card";
          if (route.id === "balanced") cardClass += " route-card--balanced";
          if (route.id === "fastest") cardClass += " route-card--fastest";
          if (route.id === "most-lit") cardClass += " route-card--most-lit";
          if (isSelected) cardClass += " route-card--selected";

          return (
            <div key={route.id} className={cardClass}>
              <div className="route-card-header">
                <div>
                  <div className="route-name">{route.label}</div>
                  <div className="route-subtitle">
                    {formatMinutes(route.durationMinutes)} •{" "}
                    {route.distanceKm.toFixed(2)} km
                  </div>
                </div>
                <button
                  className="route-go-btn"
                  onClick={() => handleSelectRoute(route.id)}
                >
                  GO
                </button>
              </div>

              <div className="route-details">
                <p><strong>ETA:</strong> {eta}</p>
                <p><strong>Light score:</strong> {route.lightScore.toFixed(1)} / 10</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
