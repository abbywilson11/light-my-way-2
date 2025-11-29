import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home/Home.jsx";
import Info from "./pages/Info/Info.jsx";
import SafetyTips from "./pages/SafetyTips/Safetytips.jsx";

import "./App.css";

export default function App() {
  return (
    <Router>
      {/* Fond global gris + centrage du téléphone */}
      <div className="app-root">
        <div className="app-frame">
          {/* BANDEAU DU HAUT (menu + logo) */}
          <header className="app-header">
            <button className="menu-button" aria-label="Menu">
              {/* trois lignes comme dans le Figma */}
              <span className="menu-line" />
              <span className="menu-line" />
              <span className="menu-line" />
            </button>

            <div className="app-logo-wrapper">
              {/* ⚠️ Mets ton vrai fichier logo dans /public et ajuste src au besoin */}
              <img
                src="/light-my-way-logo.png"
                alt="Light My Way"
                className="app-logo-img"
              />
              <div className="app-logo-text">
                <div className="app-title">Light My Way</div>
                <div className="app-subtitle">Safe Navigation</div>
              </div>
            </div>
          </header>

          {/* CONTENU (Home / Info / Safety) */}
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/info" element={<Info />} />
              <Route path="/safety" element={<SafetyTips />} />
            </Routes>
          </main>

          {/* BARRE DE NAVIGATION BASSE */}
          <nav className="app-bottom-nav">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                "nav-item" + (isActive ? " nav-item-active" : "")
              }
            >
              <span className="nav-icon">📍</span>
              <span className="nav-label">Home</span>
            </NavLink>

            <NavLink
              to="/info"
              className={({ isActive }) =>
                "nav-item" + (isActive ? " nav-item-active" : "")
              }
            >
              <span className="nav-icon">ℹ️</span>
              <span className="nav-label">Info</span>
            </NavLink>

            <NavLink
              to="/safety"
              className={({ isActive }) =>
                "nav-item" + (isActive ? " nav-item-active" : "")
              }
            >
              <span className="nav-icon">🔔</span>
              <span className="nav-label">Safety</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </Router>
  );
}
