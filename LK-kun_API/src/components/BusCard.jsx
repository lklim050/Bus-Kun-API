import React, { useState } from "react";
import styles from "./BusCard.module.css";
import { formatArrival, AIR_TABLE_URL } from "../utils/busApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const BusCard = (props) => {
  if (!props.stop) return null;

  const queryClient = useQueryClient();

  const [isFavorited, setIsFavorited] = useState(Boolean(props.stop.id));
  const [storedId, setStoredId] = useState(props.stop.id || null);
  const [toast, setToast] = useState(null);

  const addDeleteFavourite = async ({ targetID, busStopCode }) => {
    const isDeleting = !!targetID;
    const url = isDeleting ? `${AIR_TABLE_URL}/${targetID}` : AIR_TABLE_URL;

    const res = await fetch(url, {
      method: isDeleting ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: isDeleting
        ? null
        : JSON.stringify({ fields: { BusCodeStored: busStopCode, Type: "Favorite" } }),
    });

    if (!res.ok) {
      throw new Error("Airtable sync failed");
    }
    return await res.json();
  };

  const addDeleteMutation = useMutation({
    mutationFn: addDeleteFavourite,
    onMutate: (variables) => {
      setToast({ type: "pending", message: variables?.targetID ? "Removing..." : "Saving..." });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["storedBusStop"] });
      if (variables?.targetID) {
        setIsFavorited(false);
        setStoredId(null);
        setToast({ type: "success", message: "Removed from favorites" });
      } else {
        setIsFavorited(true);
        if (data?.id) setStoredId(data.id);
        setToast({ type: "success", message: "Saved to favorites" });
      }
      window.setTimeout(() => setToast(null), 3000);
    },
    onError: (err) => {
      setToast({ type: "error", message: err?.message || "Operation failed" });
      window.setTimeout(() => setToast(null), 4000);
    },
  });

  const handleToggleFavorite = () => {
    if (isFavorited) {
      addDeleteMutation.mutate({ targetID: storedId, busStopCode: props.stop.code });
    } else {
      addDeleteMutation.mutate({ targetID: null, busStopCode: props.stop.code });
    }
  };

  const distanceText = (() => {
    const d = Number(props.stop.distanceKm);
    // this check if distance is passed properly
    return Number.isFinite(d) ? `${d.toFixed(2)} km away` : "Distance unknown";
  })();

  return (
    <div className={styles.busCard}>
      <div className={styles.busCardHeader}>
        <h4 className={styles.busStopTitle}>{props.stop.code}</h4>
        <p className={styles.busStopDescription}>{props.stop.description1}</p>
        <span className={styles.busStopDistance}>{distanceText}</span>
        <button onClick={handleToggleFavorite} disabled={addDeleteMutation.isLoading}>
          {addDeleteMutation.isLoading
            ? "..."
            : isFavorited
            ? "❤️ Saved"
            : "🤍 Not Saved"}
        </button>
        {toast && (
          <div className={toast.type === "error" ? styles.toastError : styles.toast}>{toast.message}</div>
        )}
      </div>

      {props.stop.services && props.stop.services.length > 0 ? (
        <div className={styles.busServicesContainer}>
          <ul className={styles.busServicesList}>
            {props.stop.services.map((item, index) => {
              const nextBuses = [
                item.NextBus,
                item.NextBus2,
                item.NextBus3,
              ].filter(Boolean);

              return (
                <li
                  key={`${props.stop.code}-${item.ServiceNo}-${index}`}
                  className={styles.busServiceItem}
                >
                  <span className={styles.serviceNumber}>{item.ServiceNo}</span>
                  <div className={styles.serviceArrivalStack}>
                    {nextBuses.length > 0 ? (
                      nextBuses.map((bus, busIndex) => (
                        <span
                          key={`${props.stop.code}-${item.ServiceNo}-${busIndex}`}
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
