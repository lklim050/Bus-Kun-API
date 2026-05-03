import React from "react";
import styles from "./BusCard.module.css";
import { formatArrival } from "../utils/busApi";

const BusCard = ({ stop }) => {
  if (!stop) return null;

  const distanceText = (() => {
    const d = Number(stop.distanceKm);
    // this check if distance is passed properly
    return Number.isFinite(d) ? `${d.toFixed(2)} km away` : "Distance unknown";
  })();

  return (
    <div className={styles.busCard}>
      <div className={styles.busCardHeader}>
        <h4 className={styles.busStopTitle}>{stop.code}</h4>
        <p className={styles.busStopDescription}>{stop.description1}</p>
        <span className={styles.busStopDistance}>{distanceText}</span>
        <button type="add">Fav</button>
      </div>

      {stop.services && stop.services.length > 0 ? (
        <div className={styles.busServicesContainer}>
          <ul className={styles.busServicesList}>
            {stop.services.map((item, index) => {
              const nextBuses = [
                item.NextBus,
                item.NextBus2,
                item.NextBus3,
              ].filter(Boolean);

              return (
                <li
                  key={`${stop.code}-${item.ServiceNo}-${index}`}
                  className={styles.busServiceItem}
                >
                  <span className={styles.serviceNumber}>{item.ServiceNo}</span>
                  <div className={styles.serviceArrivalStack}>
                    {nextBuses.length > 0 ? (
                      nextBuses.map((bus, busIndex) => (
                        <span
                          key={`${stop.code}-${item.ServiceNo}-${busIndex}`}
                          className={styles.serviceArrivalLine}
                        >
                          {formatArrival(bus)} ({bus.Load})
                        </span>
                      ))
                    ) : (
                      <span className={styles.serviceArrivalLine}>
                        No next bus data
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className={styles.noServices}>
          No bus services available for this stop
        </p>
      )}
    </div>
  );
};

export default BusCard;
