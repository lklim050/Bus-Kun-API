import React from "react";
import styles from "./RouteCard.module.css";

const RouteCard = (props) => {
  return (
    <div className={styles.routeCard}>
      <section className="route-left">
        <h4>{props.routeData[0]?.directionName}</h4>
        {props.routeData[0]?.stops.map((item, index) => {
          return (
            <ul key={`dir1-${index}`}>
              <li>
                {item.stopCode} - {item.description}
              </li>
              {item.timing ? (
                <span>
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
        <br />
      </section>
      <section className="route-right">
        <h4>{props.routeData[1]?.directionName}</h4>
        {props.routeData[1]?.stops.map((item, index) => {
          return (
            <ul key={`dir2-${index}`}>
              <li>
                {item.stopCode} - {item.description}
              </li>
              <span>
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
        <br />
      </section>
    </div>
  );
};

export default RouteCard;
