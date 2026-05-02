import React from "react";
import { Link, useLocation } from "react-router";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bottom-navbar">
      <Link
        to="/"
        className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Dashboard</span>
      </Link>
      <Link
        to="/nearby"
        className={`nav-link ${location.pathname === "/nearby" ? "active" : ""}`}
      >
        <span className="nav-icon">📍</span>
        <span className="nav-label">Nearby</span>
      </Link>
      <Link
        to="/search"
        className={`nav-link ${location.pathname === "/search" ? "active" : ""}`}
      >
        <span className="nav-icon">🔎</span>
        <span className="nav-label">Search</span>
      </Link>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
      <Link
        to="/test"
        className={`nav-link ${location.pathname === "/test" ? "active" : ""}`}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">Test</span>
      </Link>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
    </nav>
  );
};

export default Navbar;
