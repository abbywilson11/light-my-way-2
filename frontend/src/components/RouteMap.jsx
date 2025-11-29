// frontend/src/components/RouteMap.jsx
import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";

const DEFAULT_CENTER = [45.4215, -75.6972]; // Ottawa
const DEFAULT_ZOOM = 13;

const routeColors = {
  fastest: "#1d7cf2",   // bleu
  balanced: "#c49c2f",  // doré
  "most-lit": "#12263c" // bleu foncé
};

function FitBounds({ routes }) {
  const map = useMap();

  React.useEffect(() => {
    if (!routes || routes.length === 0) return;

    const allPoints = [];
    routes.forEach((route) => {
      if (route.path && route.path.length > 0) {
        route.path.forEach((p) => {
          allPoints.push([p.lat, p.lng]);
        });
      }
    });

    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [20, 20] });
    }
  }, [routes, map]);

  return null;
}

export default function RouteMap({ routes, selectedRouteId }) {
  const hasRoutes = routes && routes.length > 0;
  const selectedRoute = hasRoutes
    ? routes.find((r) => r.id === selectedRouteId) || routes[0]
    : null;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: "260px", width: "100%" }}
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hasRoutes && <FitBounds routes={routes} />}

      {/* Tracés pour chaque route */}
      {hasRoutes &&
        routes.map((route) => {
          if (!route.path || route.path.length === 0) return null;
          const latlngs = route.path.map((p) => [p.lat, p.lng]);

          const color = routeColors[route.id] || "#ffffff";
          const weight = route.id === selectedRouteId ? 7 : 4;
          const opacity = route.id === selectedRouteId ? 0.95 : 0.7;

          return (
            <Polyline
              key={route.id}
              positions={latlngs}
              pathOptions={{ color, weight, opacity }}
            />
          );
        })}

      {/* Marqueur départ / arrivée de la route sélectionnée */}
      {selectedRoute && selectedRoute.path && selectedRoute.path.length > 0 && (
        <>
          <Marker position={[selectedRoute.path[0].lat, selectedRoute.path[0].lng]}>
            <Popup>Start</Popup>
          </Marker>
          <Marker
            position={[
              selectedRoute.path[selectedRoute.path.length - 1].lat,
              selectedRoute.path[selectedRoute.path.length - 1].lng,
            ]}
          >
            <Popup>End</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
