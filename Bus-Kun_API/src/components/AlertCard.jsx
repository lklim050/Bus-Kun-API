import React from "react";

const AlertCard = (props) => {
  const namedLine = (line) => {
    const lines = {
      CCL: "Circle Line (CCL)",
      EWL: "East West Line (EWL)",
      NEL: "North East Line (NEL)",
      NSL: "North South Line (NSL)",
      DTL: "Downtown Line (DTL)",
      TEL: "Thomson-East Coast Line (TEL)",
    };

    return lines[line] || line; // Returns the full name, or the code if not found
  };

  const getLineColor = (line) => {
    const colors = {
      CCL: "border-yellow-500 border-l-9 text-yellow-600",
      NSL: "border-red-500 border-l-9 text-red-600",
      EWL: "border-green-600 border-l-9 text-green-700",
      NEL: "border-purple-700 border-l-9 text-purple-800",
      TEL: "border-amber-800 border-l-9 text-amber-900", // Brown-ish
      DTL: "border-blue-800 border-l-9 text-blue-900",
    };

    // Default to gray if the line code isn't recognized
    return colors[line] || "border-gray-300 bg-gray-50 text-gray-900";
  };

  return (
    <div className="flex flex-col items-center w-full gap-3 p-0 m-0 list-none">
      {props.affected &&
        props.affected.length > 0 &&
        props.affected.map((item, index) => {
          const lineColor = getLineColor(item.Line);
          return (
            <div
              key={`affected-${index}`}
              className={`w-[80%] p-4 bg-rose-200 rounded-2xl shadow-sm animate-pulse ${lineColor}`}
            >
              <h4 className="text-lg font-thin text-gray-800 leading-relaxed">
                AFFECTED:{"    "}
                <span className="font-bold">
                  {" "}
                  {namedLine(item.Line)} towards {item.Direction}
                </span>
              </h4>
              <p className="text-lg text-gray-800">
                Affected Stations:{" "}
                <span className="font-bold">{item.Stations}</span>
              </p>
              <p className="text-lg text-gray-800">
                Free Public Bus:{" "}
                <span className="font-bold">{item.FreePublicBus}</span>
              </p>
              <p className="text-lg text-gray-800">
                Free MRT Shuttle:
                <span className="font-bold">{item.FreeMRTShuttle}</span>
              </p>
            </div>
          );
        })}

      {props.message &&
        props.message.map((item, index) => (
          <div
            key={`message-${index}`}
            className="w-[80%] p-3 bg-indigo-200 border-sky-400 border-l-9 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <p className="text-base mt-2 font-semibold text-indigo-700 mb-1">
              {item.Content}
            </p>
            <p className="text-xs font-medium text-indigo-900/60 uppercase tracking-wider">
              {item.CreatedDate}
            </p>
          </div>
        ))}
      <br />
      <br />
      <br />
    </div>
  );
};

export default AlertCard;
