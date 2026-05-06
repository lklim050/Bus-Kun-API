import React from "react";

const AlertCard = (props) => {
  return (
    <div className="list-none p-0 m-0 flex flex-wrap gap-3">
      {props.affected &&
        props.affected.length > 0 &&
        props.affected.map((item, index) => (
          <div key={`affected-${index}`} className="text-red-black font-bold">
            <p className="text-sm text-gray-800 leading-relaxed">{item.Line}</p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.Direction}
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.Stations}
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.FreePublicBus}
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.FreeMRTShuttle}
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.MRTShuttleDirection}
            </p>
          </div>
        ))}
      {props.message &&
        props.message.map((item, index) => (
          <div key={`message-${index}`}>
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.Content}
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.CreatedDate}
            </p>
          </div>
        ))}
    </div>
  );
};

export default AlertCard;
