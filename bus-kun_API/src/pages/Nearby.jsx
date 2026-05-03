import React from "react";
import {
  findNearbyStops as getNearbyStops,
  formatArrival,
  getAllBusStop,
  getBusStopData,
  getNearbyBusStopData,
  getUserLocation,
  nowSGTime,
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

  const allBusStopQuery = useQuery({
    queryKey: ["allBusStop"],
    queryFn: getAllBusStop,
  });

  function findNearbyStops(lat = 1.3, lon = 103.84, radiusKm = 0.4) {
    return getNearbyStops(allBusStopQuery.data, lat, lon, radiusKm);
  }

  //----------------GET/MAP NEARBY BUS STOP INFORMATION-------------------------------
  const nearbyBusStopArray = findNearbyStops(
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

  //--------------------------------RETURN--------------------------------------------
  return (
    <div>
      <button onClick={() => userLocationQuery.refetch()}>
        Fetch user Location
      </button>
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
        (nearbyBusData.length > 0 ? (
          <div>
            {nearbyBusData.map((stop) => (
              <BusCard key={stop.code} stop={stop} />
            ))}
          </div>
        ) : (
          <p>No nearby bus stops found</p>
        ))}
    </div>
  );
};

export default Nearby;
