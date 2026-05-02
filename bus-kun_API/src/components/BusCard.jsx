import React from "react";
import "./BusCard.css";

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

  return (
    <div className="bus-card">
      <div className="bus-card-header">
        <h4 className="bus-stop-title">{stop.code}</h4>
        <p className="bus-stop-description">{stop.description1}</p>
        <span className="bus-stop-distance">
          {stop.distanceKm.toFixed(2)} km away
        </span>
      </div>

      {stop.services && stop.services.length > 0 ? (
        <div className="bus-services-container">
          <ul className="bus-services-list">
            {stop.services.map((item, index) => {
              const nextBuses = [
                item.NextBus,
                item.NextBus2,
                item.NextBus3,
              ].filter(Boolean);

              return (
                <li
                  key={`${stop.code}-${item.ServiceNo}-${index}`}
                  className="bus-service-item"
                >
                  <span className="service-number">{item.ServiceNo}</span>
                  <div className="service-arrival-stack">
                    {nextBuses.length > 0 ? (
                      nextBuses.map((bus, busIndex) => (
                        <span
                          key={`${stop.code}-${item.ServiceNo}-${busIndex}`}
                          className="service-arrival-line"
                        >
                          Bus {busIndex + 1}: {formatArrival(bus)}
                        </span>
                      ))
                    ) : (
                      <span className="service-arrival-line">
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
        <p className="no-services">No bus services available for this stop</p>
      )}
    </div>
  );
};

export default BusCard;
