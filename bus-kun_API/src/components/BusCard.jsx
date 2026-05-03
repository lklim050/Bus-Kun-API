import React from "react";
import styles from "./BusCard.module.css";

const BusCard = ({ stop }) => {
  if (!stop) return null;

  const formatArrival = (bus) => {
    const estimatedArrival = bus?.EstimatedArrival ?? "N/A";
    const arrivalMs = new Date(estimatedArrival).getTime();

    if (Number.isNaN(arrivalMs)) {
      return "N/A";
    }

    const differenceInMinutes = Math.max(
      0,
      Math.round((arrivalMs - Date.now()) / 60000),
    );

    if (differenceInMinutes === 0) {
      return "ARR";
    }

    return `${differenceInMinutes} min`;
  };

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
