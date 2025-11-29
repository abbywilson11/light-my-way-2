// frontend/src/pages/Info/Info.jsx
import React, { useEffect, useState } from "react";
import { fetchInfo } from "../../api/client"; // ✅ garde ça

export default function Info() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInfo() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchInfo();
        setInfo(data);
      } catch (err) {
        console.error(err);
        setError("Could not load info. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadInfo();
  }, []);

  if (loading) {
    return (
      <div className="info-container">
        <h1>Info</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info-container">
        <h1>Info</h1>
        <p style={{ color: "salmon" }}>{error}</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="info-container">
        <h1>Info</h1>
        <p>No info available.</p>
      </div>
    );
  }

  return (
    <div className="info-container">
      <h1>{info.title || "How we calculate lighting"}</h1>

      {info.description && <p>{info.description}</p>}

      {Array.isArray(info.steps) && info.steps.length > 0 && (
        <>
          <h2>How it works</h2>
          <ul>
            {info.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </>
      )}

      {Array.isArray(info.limitations) && info.limitations.length > 0 && (
        <>
          <h2>Limitations</h2>
          <ul>
            {info.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
