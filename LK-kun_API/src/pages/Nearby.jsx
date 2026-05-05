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
    <div>
      <h1>NEARBY</h1>
      {` ================================================================= `}
      <br />
      <button onClick={() => userLocationQuery.refetch()}>
        Fetch user Location
      </button>
      <br />
      {userLocationQuery.isLoading && <p>Getting user Location</p>}
      <br />
      {`This is Your Location:`}
      <br />
      {userLocationQuery.isSuccess && userLocationQuery.data ? (
        <p>{`Lat: ${userLocationQuery.data.latitude}, Long: ${userLocationQuery.data.longitude}`}</p>
      ) : (
        <p>
          location not ON, using fallback location Plaza Singapura (lat:1.3,
          lon=103.84)
        </p>
      )}
      <br />
      {` ================================================================= `}
      <br />
      <button onClick={() => nearbyBusStopQuery.refetch()}>
        Fetch Nearby Bus Info
      </button>
      <br />
      {/* {JSON.stringify(nearbyBusStopQuery.data)} */}
      {nearbyBusStopQuery.isLoading && <h3>Loading...</h3>}
      {nearbyBusStopQuery.isError && (
        <h3>{nearbyBusStopQuery.error?.message}</h3>
      )}
      <br />
      {(nearbyBusStopQuery.isSuccess || nearbyBusStopQuery.data) &&
        (nearbyBusDataEx.length > 0 ? (
          <div>
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
          <p>No nearby bus stops found</p>
        ))}
    </div>
  );
};

export default Nearby;
