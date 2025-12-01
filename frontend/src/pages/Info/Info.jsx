import React from "react";
import "./Info.css"; 

export default function InfoPage() {
  return (
    <div className="info-container">
      <h1 className="info-title">Welcome to the Information Page</h1>

      <div className="info-section">
        <h2 className="section-title">About</h2>
        <p className="section-text">
          Light My Way estimates how well-lit a route is by combining map directions with public 
          data on streetlight locations and brightness levels. The app then suggests routes that maximize streetlight exposure,

        </p>
      </div>

      <div className="info-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-text">
          1. We retrieve potential walking routes between the start and end points using a map API (Google Directions).<br />
          2. For each route, we look up streetlight locations in public open data from the City of Ottawa.<br />
          3. We analyze each route segment to calculate a "light score" based on the density and brightness of nearby streetlights.<br />
          4. Finally, we present route options such as "fastest," "balanced," and "most well-lit" to the user.
        </p>
      </div>

    </div>
  );
}
