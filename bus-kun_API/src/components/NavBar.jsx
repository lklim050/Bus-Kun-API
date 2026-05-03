import React from "react";
import { Link, useLocation } from "react-router";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className={styles.bottomNavbar}>
      <Link
        to="/"
        className={`${styles.navLink} ${location.pathname === "/" ? styles.active : ""}`}
      >
        <span className={styles.navIcon}>📊</span>
        <span className={styles.navLabel}>Dashboard</span>
      </Link>
      <Link
        to="/nearby"
        className={`${styles.navLink} ${location.pathname === "/nearby" ? styles.active : ""}`}
      >
        <span className={styles.navIcon}>📍</span>
        <span className={styles.navLabel}>Nearby</span>
      </Link>
      <Link
        to="/search"
        className={`${styles.navLink} ${location.pathname === "/search" ? styles.active : ""}`}
      >
        <span className={styles.navIcon}>🔎</span>
        <span className={styles.navLabel}>Search</span>
      </Link>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
      <Link
        to="/test"
        className={`${styles.navLink} ${location.pathname === "/test" ? styles.active : ""}`}
      >
        <span className={styles.navIcon}>📋</span>
        <span className={styles.navLabel}>Test</span>
      </Link>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
    </nav>
  );
};

export default Navbar;
