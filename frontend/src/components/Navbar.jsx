import React from "react";
import "./Navbar.css";
import logo from "../assets/LMW2.png"; // path to your logo image

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Light My Way Logo" className="logo" />
        <div className="logo-text">
          <strong>Light My Way</strong>
          <span>Safe Navigation</span>
        </div>
      </div>
    </nav>
  );
}
