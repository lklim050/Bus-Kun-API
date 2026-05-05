import React from "react";
import {
  findNearbyStops,
  formatArrival,
  getAllBusStop,
  getBusStopData,
  getNearbyBusStopData,
  getUserLocation,
  nowSGTime,
  getStoredBusStop,
} from "../utils/busApi";
import BusCard from "../components/BusCard";
import { useQuery } from "@tanstack/react-query";

const Nearby = () => {
  //----------------------------GET USER LOCATION-------------------------------------
  const userLocationQuery = useQuery({
    queryKey: ["userLocation"],
    queryFn: getUserLocation,
    enabled: false, // false to stop query
    staleTime: 60_000, // refresh every 60s
  });
  //------------------------HAVERSINE DISTANCE CALCULATION-----------------------------
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
  };

  //----------------------------CHECK NEARBY BUS-----------------------------------

  //get from static file
  const allBusStopQuery = useQuery({
    queryKey: ["allBusStop"],
    queryFn: getAllBusStop,
  });

  function getNearbyStops(lat = 1.3, lon = 103.84, radiusKm = 0.4) {
    return findNearbyStops(allBusStopQuery.data, lat, lon, radiusKm);
  }

  //----------------GET/MAP NEARBY BUS STOP INFORMATION-------------------------------
  const nearbyBusStopArray = getNearbyStops(
    userLocationQuery.data?.latitude,
    userLocationQuery.data?.longitude,
  ).map((stop) => ({ ...stop }));

  const nearbyBusStopQuery = useQuery({
    queryKey: ["nearbyBusStop"],
    queryFn: () =>
      getNearbyBusStopData(nearbyBusStopArray, import.meta.env.VITE_ACCKEY),
    staleTime: 60_000,
    enabled: false, // true to fetch url
  });

  // return an empty array if return data is undefined to prevent runtime clash
  const nearbyBusData = nearbyBusStopQuery.data ?? [];

  // fetch stored favourites so we can mark nearby stops that are already saved
  const storedBusStopQuery = useQuery({
    queryKey: ["storedBusStop"],
    queryFn: getStoredBusStop,
    staleTime: 600_000,
    enabled: true,
  });

  const storedBusStopData =
    storedBusStopQuery.data?.records?.map((record) => ({
      id: record.id,
      busCode: record.fields?.BusCodeStored || "",
      type: record.fields?.Type || "unknown",
    })) ?? [];

  // attach stored id to nearby stops when codes match so BusCard can render correct toggle
  const nearbyBusDataEx = nearbyBusData.map((stop) => {
    const saved = storedBusStopData.find(
      (s) => s.busCode === String(stop.code),
    );
    return saved ? { ...stop, id: saved.id, type: saved.type } : stop;
  });

  //--------------------------------RETURN--------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 py-4 sm:py-6 space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NEARBY</h1>
      <hr className="border-gray-300" />
      <button
        onClick={() => userLocationQuery.refetch()}
        className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm sm:text-base hover:bg-slate-800"
      >
        Fetch user Location
      </button>
      {userLocationQuery.isLoading && (
        <p className="text-sm">Getting user Location</p>
      )}
      <p className="text-sm sm:text-base font-medium">This is Your Location:</p>
      {userLocationQuery.isSuccess && userLocationQuery.data ? (
        <p className="text-sm sm:text-base">{`Lat: ${userLocationQuery.data.latitude}, Long: ${userLocationQuery.data.longitude}`}</p>
      ) : (
        <p className="text-sm sm:text-base text-gray-700">
          location not ON, using fallback location Plaza Singapura (lat:1.3,
          lon=103.84)
        </p>
      )}
      <hr className="border-gray-300" />
      <button
        onClick={() => nearbyBusStopQuery.refetch()}
        className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm sm:text-base hover:bg-slate-800"
      >
        Fetch Nearby Bus Info
      </button>
      {/* {JSON.stringify(nearbyBusStopQuery.data)} */}
      {nearbyBusStopQuery.isLoading && (
        <h3 className="text-base sm:text-lg font-semibold">Loading...</h3>
      )}
      {nearbyBusStopQuery.isError && (
        <h3 className="text-base sm:text-lg font-semibold text-red-600">
          {nearbyBusStopQuery.error?.message}
        </h3>
      )}
      {(nearbyBusStopQuery.isSuccess || nearbyBusStopQuery.data) &&
        (nearbyBusDataEx.length > 0 ? (
          <div className="space-y-3">
            {nearbyBusDataEx.map((stop) => (
              <BusCard
                key={stop.id || stop.code}
                id={stop.id}
                stop={stop}
                code={stop.code}
                description1={stop.description1}
                services={stop.services}
                distanceKm={stop.distanceKm}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-700">
            No nearby bus stops found
          </p>
        ))}
      <br />
      {JSON.stringify(nearbyBusDataEx)}
    </div>
  );
};

export default Nearby;
