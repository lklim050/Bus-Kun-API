import React, { useState } from "react";
import { formatArrival } from "../utils/busApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const BusCard = (props) => {
  if (!props.stop) return null;

  const queryClient = useQueryClient();

  const [isFavorited, setIsFavorited] = useState(Boolean(props.id));
  const [storedId, setStoredId] = useState(props.id || null);
  const [toast, setToast] = useState(null);

  const addDeleteFavourite = async ({ targetID, busStopCode }) => {
    const isDeleting = !!targetID;
    const url = isDeleting
      ? `${import.meta.env.VITE_AIRTABLE_URL}/${targetID}`
      : import.meta.env.VITE_AIRTABLE_URL;

    const res = await fetch(url, {
      method: isDeleting ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: isDeleting
        ? null
        : JSON.stringify({
            fields: { BusCodeStored: busStopCode, Type: "Favorite" },
          }),
    });

    if (!res.ok) {
      throw new Error("Airtable sync failed");
    }
    return await res.json();
  };

  const addDeleteMutation = useMutation({
    mutationFn: addDeleteFavourite,
    onMutate: (variables) => {
      setToast({
        type: "pending",
        message: variables?.targetID ? "Removing..." : "Saving...",
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["storedBusStop"] });
      if (variables?.targetID) {
        setIsFavorited(false);
        setStoredId(null);
        setToast({ type: "success", message: "Removed done" });
      } else {
        setIsFavorited(true);
        if (data?.id) setStoredId(data.id);
        setToast({ type: "success", message: "Saved done" });
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
      addDeleteMutation.mutate({
        targetID: storedId,
        busStopCode: props.code,
      });
    } else {
      addDeleteMutation.mutate({
        targetID: null,
        busStopCode: props.code,
      });
    }
  };

  const distanceText = (() => {
    const d = Number(props.distanceKm);
    return Number.isFinite(d) ? `${d.toFixed(2)} km away` : "Distance unknown";
  })();

  const sortedServices = props.services
    ? [...props.services].sort(
        (a, b) => Number(a.ServiceNo) - Number(b.ServiceNo),
      )
    : [];

  return (
    <div className="mx-auto w-full max-w-2xl border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50 shadow-sm flex flex-col md:flex-row gap-4 box-border overflow-hidden">
      <div className="flex flex-col gap-2 pb-4 md:pb-0 md:pr-4 border-b md:border-b-0 md:border-r border-gray-200 md:w-48 shrink-0">
        <h4 className="m-0 text-lg font-bold text-black uppercase tracking-tight">
          {props.code}
        </h4>
        <p className="m-0 text-sm text-gray-700 leading-snug">
          {props.description1}
        </p>
        <span className="text-xs text-gray-500 font-medium">
          {distanceText}
        </span>

        <button
          onClick={handleToggleFavorite}
          disabled={addDeleteMutation.isLoading}
          className="mt-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 w-full md:w-fit"
        >
          {addDeleteMutation.isLoading
            ? "..."
            : isFavorited
              ? "❤️ Saved"
              : "🤍 Save"}
        </button>

        {toast && (
          <div
            className={`mt-2 text-xs p-2 rounded-md animate-pulse ${
              toast.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>

      {/* RIGHT/BOTTOM SECTION: Bus Services */}
      <div className="flex-1 min-w-0">
        {sortedServices.length > 0 ? (
          /* grid-cols-2 on small tablets, grid-cols-1 on phones */
          <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedServices.map((item, index) => {
              const nextBuses = [
                item.NextBus,
                item.NextBus2,
                item.NextBus3,
              ].filter(Boolean);

              return (
                <li
                  key={`${props.code}-${item.ServiceNo}-${index}`}
                  className="flex flex-col gap-2 p-3 bg-white border border-gray-100 border-l-4 border-l-blue-600 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      {item.ServiceNo}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {nextBuses.length > 0 ? (
                      nextBuses.map((bus, busIndex) => (
                        <div
                          key={busIndex}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-gray-900 font-medium">
                            {formatArrival(bus)}
                          </span>
                          <span
                            className={`font-bold ${
                              bus.Load === "SDA"
                                ? "text-green-600"
                                : bus.Load === "LSD"
                                  ? "text-orange-500"
                                  : "text-red-600"
                            }`}
                          >
                            {bus.Load}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        No data
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm italic py-4">
            No services found.
          </p>
        )}
      </div>
    </div>
  );
};

export default BusCard;
