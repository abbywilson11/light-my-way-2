import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home/Home.jsx";
import Info from "./pages/Info/Info.jsx";
import SafetyTips from "./pages/SafetyTips/Safetytips.jsx";

import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/info" element={<Info />} />
            <Route path="/safety" element={<SafetyTips />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
