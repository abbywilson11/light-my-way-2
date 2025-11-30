import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaInfoCircle, FaShieldAlt } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <button className="footer-btn" onClick={() => navigate("/Home")}>
        <FaHome className="footer-icon" />
        <span>Home</span>
      </button>

      <button className="footer-btn" onClick={() => navigate("/info")}>
        <FaInfoCircle className="footer-icon" />
        <span>Info</span>
      </button>

      <button className="footer-btn" onClick={() => navigate("/safety")}>
        <FaShieldAlt className="footer-icon" />
        <span>Safety</span>
      </button>
    </footer>
  );
}
