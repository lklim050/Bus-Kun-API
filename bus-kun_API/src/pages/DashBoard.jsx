import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  getBusStopData,
  getBusStopDetails,
  getUserLocation,
  getAllBusStop,
} from "../utils/busApi";
import BusCard from "../components/BusCard";

const DashBoard = () => {
  const [input, setInput] = useState("");
  const [storedStops, setStoredStops] = useState([]); // Will be fetched from Airtable later

  //----------------------------GET USER LOCATION-------------------------------------
  const userLocationQuery = useQuery({
    queryKey: ["userLocation"],
    queryFn: getUserLocation,
    enabled: false, // false to stop query
    staleTime: 60_000, // refresh every 60s
  });

  //------------------GET ALL BUS STOPS DATA-------------------------------------------
  const allBusStopQuery = useQuery({
    queryKey: ["allBusStop"],
    queryFn: getAllBusStop,
  });

  //---------------------GET BUS STOP FROM INPUT----------------------------------------
  const busStopQuery = useQuery({
    queryKey: ["busstops"],
    queryFn: () => getBusStopData(input, import.meta.env.VITE_ACCKEY),
    enabled: false, // false to stop query
    staleTime: 60_000, // auto refresh for 60s
    //   refetchOnWindowFocus: false,  // don't refetch when tab is focused
  });

  // Wrap single query result into proper stop object with details from stops.json
  const stopDetails = getBusStopDetails(input, allBusStopQuery.data);
  const stopData = busStopQuery.data
    ? {
        code: busStopQuery.data.BusStopCode || input,
        description1:
          stopDetails?.description1 ||
          busStopQuery.data.BusStopName ||
          "Unknown Stop",
        description2: stopDetails?.description2 || "",
        latitude: stopDetails?.latitude,
        longitude: stopDetails?.longitude,
        distanceKm: stopDetails?.distanceKm ?? 0,
        services: busStopQuery.data.Services || [],
      }
    : null;

  // const getBusStopDes = (code) =>{
  //   for (const stop of allBusStopQuery){
  //   if (code === stop.code )
  //   }
  // }

  //---------------------------------RETURN-------------------------------------------

  return (
    <div>
      <h1>Dashboard</h1>
      <input
        type="text"
        name="busStopNo"
        inputMode="numeric"
        pattern="\d"
        maxLength={5}
        value={input}
        placeholder="input bus stop no."
        onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
      />
      <button type="button" onClick={() => busStopQuery.refetch()}>
        Search
      </button>
      <br />
      {JSON.stringify(input)}
      <br />

      {/* {JSON.stringify(busStopQuery.data)} */}
      <br />
      {` ================================================================= `}
      <br />
      {/* {JSON.stringify(stopData)} */}
      <br />
      {` ================================================================= `}
      <br />
      {/* {JSON.stringify(allBusStopQuery.data)} */}
      {busStopQuery.isLoading && <h3>Loading...</h3>}
      {busStopQuery.isError && <h3>{busStopQuery.error?.message}</h3>}
      <br />
      {(busStopQuery.isSuccess || busStopQuery.data) &&
        (stopData && stopData.services.length > 0 ? (
          <div>
            <h2>Search Result</h2>
            <BusCard key={stopData.code} stop={stopData} />
          </div>
        ) : (
          <p>No bus services available for this stop</p>
        ))}

      {/* Stored Bus Stops from Airtable - mapping section */}
      {storedStops.length > 0 && (
        <div>
          <h2>Stored Bus Stops</h2>
          {storedStops.map((stop) => (
            <BusCard key={stop.code} stop={stop} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashBoard;
