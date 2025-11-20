import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-left">
        <button onClick={() => navigate("/Home")}>Home</button>
      </div>

      <div className="footer-center">
        <button onClick={() => navigate("/info")}>Info</button>
      </div>

      <div className="footer-right">
        <button onClick={() => navigate("/safety")}>Safety Tips</button>
      </div>
    </footer>

  );
}
