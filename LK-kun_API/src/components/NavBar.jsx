import React from "react";
import { NavLink } from "react-router";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.bottomNavbar}>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.active : ""}`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`${styles.navIcon} ${isActive ? styles.activeIcon : ""}`}
            >
              📊
            </span>
            <span className={styles.navLabel}>Dashboard</span>
          </>
        )}
      </NavLink>
      <NavLink
        to="/nearby"
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.active : ""}`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`${styles.navIcon} ${isActive ? styles.activeIcon : ""}`}
            >
              📍
            </span>
            <span className={styles.navLabel}>Nearby</span>
          </>
        )}
      </NavLink>
      <NavLink
        to="/search"
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.active : ""}`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`${styles.navIcon} ${isActive ? styles.activeIcon : ""}`}
            >
              🔎
            </span>
            <span className={styles.navLabel}>Search</span>
          </>
        )}
      </NavLink>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
      <NavLink
        to="/test"
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.active : ""}`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`${styles.navIcon} ${isActive ? styles.activeIcon : ""}`}
            >
              📋
            </span>
            <span className={styles.navLabel}>Test</span>
          </>
        )}
      </NavLink>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
    </nav>
  );
};

export default Navbar;
