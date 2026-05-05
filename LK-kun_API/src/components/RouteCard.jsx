import React from "react";

const RouteCard = (props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <h4 className="text-base sm:text-lg font-semibold mb-2">
          {props.routeData[0]?.directionName}
        </h4>
        {props.routeData[0]?.stops.map((item, index) => {
          return (
            <ul
              key={`dir1-${index}`}
              className="mb-3 text-sm sm:text-base text-gray-800"
            >
              <li className="font-medium">
                {item.stopCode} - {item.description}
              </li>
              {item.timing ? (
                <span className="text-xs sm:text-sm text-gray-600">
                  <p>
                    {item.timing.weekdaysFirst &&
                      `Weekday: ${item.timing.weekdaysFirst} to ${item.timing.weekdaysLast}`}
                    {item.timing.saturdayFirst &&
                      ` || Saturday: ${item.timing.saturdayFirst} to ${item.timing.saturdayLast}`}
                    {item.timing.sundayFirst &&
                      ` || Sunday: ${item.timing.sundayFirst} to ${item.timing.sundayLast}`}
                  </p>
                </span>
              ) : (
                "Operating hours information unavailable"
              )}
            </ul>
          );
        })}
      </section>
      <section className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <h4 className="text-base sm:text-lg font-semibold mb-2">
          {props.routeData[1]?.directionName}
        </h4>
        {props.routeData[1]?.stops.map((item, index) => {
          return (
            <ul
              key={`dir2-${index}`}
              className="mb-3 text-sm sm:text-base text-gray-800"
            >
              <li className="font-medium">
                {item.stopCode} - {item.description}
              </li>
              <span className="text-xs sm:text-sm text-gray-600">
                <p>
                  {item.timing.weekdaysFirst &&
                    `Weekday: ${item.timing.weekdaysFirst} to ${item.timing.weekdaysLast}`}
                  {item.timing.saturdayFirst &&
                    ` || Saturday: ${item.timing.saturdayFirst} to ${item.timing.saturdayLast}`}
                  {item.timing.sundayFirst &&
                    ` || Sunday: ${item.timing.sundayFirst} to ${item.timing.sundayLast}`}
                </p>
              </span>
            </ul>
          );
        })}
      </section>
    </div>
  );
};

export default RouteCard;
