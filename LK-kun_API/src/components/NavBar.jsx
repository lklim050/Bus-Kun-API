import React from "react";
import { NavLink } from "react-router";

const Navbar = () => {
  const getLinkClass = ({ isActive }) =>
    `flex-1 flex flex-col items-center justify-center px-2 py-2 sm:px-3 sm:py-3 text-gray-600 no-underline transition-all duration-300 rounded-t-lg ${
      isActive
        ? "text-blue-700 bg-sky-200"
        : "hover:bg-blue-100 hover:text-gray-900"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg p-1.5 sm:p-2 z-50">
      <NavLink to="/" className={getLinkClass}>
        {({ isActive }) => (
          <>
            <span
              className={`text-xl sm:text-2xl mb-0.5 sm:mb-1 transition-transform duration-300 ${
                isActive ? "transform -translate-y-0.5 scale-110" : ""
              }`}
            >
              📊
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-center">
              Dashboard
            </span>
          </>
        )}
      </NavLink>
      <NavLink to="/nearby" className={getLinkClass}>
        {({ isActive }) => (
          <>
            <span
              className={`text-xl sm:text-2xl mb-0.5 sm:mb-1 transition-transform duration-300 ${
                isActive ? "transform -translate-y-0.5 scale-110" : ""
              }`}
            >
              📍
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-center">
              Nearby
            </span>
          </>
        )}
      </NavLink>
      <NavLink to="/search" className={getLinkClass}>
        {({ isActive }) => (
          <>
            <span
              className={`text-xl sm:text-2xl mb-0.5 sm:mb-1 transition-transform duration-300 ${
                isActive ? "transform -translate-y-0.5 scale-110" : ""
              }`}
            >
              🔎
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-center">
              Search
            </span>
          </>
        )}
      </NavLink>
      {/*---------------------TEST NEW FEATURE-----------------------------------*/}
      <NavLink to="/where" className={getLinkClass}>
        {({ isActive }) => (
          <>
            <span
              className={`text-xl sm:text-2xl mb-0.5 sm:mb-1 transition-transform duration-300 ${
                isActive ? "transform -translate-y-0.5 scale-110" : ""
              }`}
            >
              📡
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-center">
              Map
            </span>
          </>
        )}
      </NavLink>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
      <NavLink to="/test" className={getLinkClass}>
        {({ isActive }) => (
          <>
            <span
              className={`text-xl sm:text-2xl mb-0.5 sm:mb-1 transition-transform duration-300 ${
                isActive ? "transform -translate-y-0.5 scale-110" : ""
              }`}
            >
              📋
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-center">
              Test
            </span>
          </>
        )}
      </NavLink>
      {/*---------------------TO DELETE BEFORE SUBMISSION-----------------------------------*/}
    </nav>
  );
};

export default Navbar;
