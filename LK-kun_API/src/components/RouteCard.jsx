import React, { useState } from "react";

const RouteCard = (props) => {
  const [changeRoute, setChangeRoute] = useState(0);

  // render route list here
  const changeDirection = (route) => {
    const data = props.routeData[route];
    if (!data)
      return (
        <p className="text-gray-500 italic p-4">No data for this direction</p>
      );
    return (
      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-bold text-blue-800 border-b pb-2 mb-4">
          {data.directionName}
        </h4>
        {data.stops.map((item, index) => (
          <div
            key={`dir${changeRoute}-${index}`}
            className="text-sm sm:text-base text-gray-800"
          >
            <p className="font-bold">
              {item.stopCode}{" "}
              <span className="font-bold text-gray-600">
                — {item.description}
              </span>
            </p>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
              {item.timing ? (
                <p>
                  {item.timing.weekdaysFirst &&
                    `Wkdy: ${item.timing.weekdaysFirst} - ${item.timing.weekdaysLast}`}
                  {item.timing.saturdayFirst &&
                    ` | Sat: ${item.timing.saturdayFirst} - ${item.timing.saturdayLast}`}
                  {item.timing.sundayFirst &&
                    ` | Sun: ${item.timing.sundayFirst} - ${item.timing.sundayLast}`}
                </p>
              ) : (
                <span className="italic text-gray-400">
                  Operating hours unavailable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* 1. TAB TOGGLE (Only visible on mobile/tablet, hidden on lg screens) */}
      <div className="flex lg:hidden mb-4 bg-gray-200 p-1 rounded-lg w-full">
        <button
          onClick={() => setChangeRoute(0)}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${
            changeRoute === 0
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600"
          }`}
        >
          {props.routeData[0]?.directionName || "Direction 1"}
        </button>
        <button
          onClick={() => setChangeRoute(1)}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${
            changeRoute === 1
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600"
          }`}
        >
          {props.routeData[1]?.directionName || "Direction 2"}
        </button>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Direction 1 Section */}
        <section
          className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
            changeRoute === 0 ? "block" : "hidden lg:block"
          }`}
        >
          {changeDirection(0)}
        </section>

        {/* Direction 2 Section */}
        <section
          className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
            changeRoute === 1 ? "block" : "hidden lg:block"
          }`}
        >
          {changeDirection(1)}
        </section>
        <br />
        <br />
      </div>
    </div>
  );
};

export default RouteCard;
