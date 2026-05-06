import React from "react";

const AlertCard = (props) => {
  return (
    <div>
      {props.affected &&
        props.affected.map((item, index) => (
          <div key={props.id}>
            <p>{item.Line}</p>
            <p>{item.Direction}</p>
            <p>{item.Stations}</p>
            <p>{item.FreePublicBus}</p>
            <p>{item.FreeMRTShuttle}</p>
            <p>{item.MRTShuttleDirection}</p>
          </div>
        ))}
      {props.message &&
        props.message.map((item, index) => (
          <div key={props.id}>
            <p>{item.Content}</p>
            <p>{item.CreatedDate}</p>
          </div>
        ))}
    </div>
  );
};

export default AlertCard;
