import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  getBusStopData,
  getBusStopDetails,
  getUserLocation,
  getAllBusStop,
  getStoredBusStop,
  getStoredBusStopData,
} from "../utils/busApi";
import BusCard from "../components/BusCard";

const DashBoard = () => {
  const [input, setInput] = useState("");

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
  const busStopDetails = getBusStopDetails(input, allBusStopQuery.data);
  const busStopData = busStopQuery.data
    ? {
        code: busStopQuery.data.BusStopCode || input,
        description1:
          busStopDetails?.description1 ||
          busStopQuery.data.BusStopName ||
          "Unknown Stop",
        description2: busStopDetails?.description2 || "",
        latitude: busStopDetails?.latitude,
        longitude: busStopDetails?.longitude,
        distanceKm: busStopDetails?.distanceKm ?? 0,
        services: busStopQuery.data.Services || [],
      }
    : null;

  // ------------------GET STORED BUS STOP FROM AIRTABLE-----------------------------------
  const storedBusStopQuery = useQuery({
    queryKey: ["storedBusStop"],
    queryFn: getStoredBusStop,
    staleTime: 600_000,
    enabled: true,
  });
  const storedBusStopData =
    storedBusStopQuery.data?.records?.map((record) => ({
      id: record.id,
      busCode: record.fields?.BusCodeStored || "N/A",
      type: record.fields?.Type || "unknown",
    })) ?? [];

  const storedStopQuery = useQuery({
    queryKey: [
      "storedBusStopWithServices",
      storedBusStopData.map((item) => item.busCode).join("|"),
    ],
    queryFn: () =>
      getStoredBusStopData(
        storedBusStopData,
        import.meta.env.VITE_ACCKEY,
        allBusStopQuery.data,
        userLocationQuery.data?.latitude ?? 1.3,
        userLocationQuery.data?.longitude ?? 103.84,
      ),
    staleTime: 60_000,
    enabled: storedBusStopData.length > 0 && !!allBusStopQuery.data,
  });

  const storedStopData = storedStopQuery.data
    ? [...storedStopQuery.data].sort((a, b) => a.distanceKm - b.distanceKm)
    : [];

  //---------------------GET BUS STOP FROM INPUT (MODIFIED)---------------------------------

  // check stored id/type when available so BusCard shows correct saved state
  const busStopDataEx = busStopData
    ? (() => {
        const found = storedBusStopData.find(
          (s) => String(s.busCode) === String(busStopData.code),
        );
        return found
          ? { ...busStopData, id: found.id, type: found.type }
          : busStopData;
      })()
    : null;

  //------------------------------------RETURN------------------------------------------------

  return (
    <div>
      <h1>DASHBOARD</h1>
      {` ================================================================= `}
      <br />
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
      {` ================================================================= `}
      <br />
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

      {/* {JSON.stringify(busStopQuery.data)} */}
      <br />
      {` ================================================================= `}
      <br />
      {/* {`storedStopData is: ${JSON.stringify(storedStopData)}`} */}
      <br />
      {` ================================================================= `}
      <br />
      {/* {JSON.stringify(allBusStopQuery.data)} */}
      {busStopQuery.isLoading && <h3>Loading...</h3>}
      {busStopQuery.isError && <h3>{busStopQuery.error?.message}</h3>}
      <br />
      {(busStopQuery.isSuccess || busStopQuery.data) &&
        (busStopDataEx && busStopDataEx.services.length > 0 ? (
          <div>
            <h2>Search Result</h2>
            <BusCard key={busStopDataEx.code} stop={busStopDataEx} />
          </div>
        ) : (
          <p>No bus services available for this stop</p>
        ))}
      <br />
      {` ================================================================= `}
      <br />
      <button onClick={() => storedStopQuery.refetch()}>
        Refresh Stored Bus Stop
      </button>
      <br />
      {/* Stored Bus Stops from Airtable - mapping section */}
      {storedStopQuery.isLoading && <h3>Loading your favourites stops...</h3>}
      {storedStopQuery.isError && <h3>{storedStopQuery.error?.message}</h3>}
      {storedStopData.length > 0 && (
        <div>
          <h2>Stored Bus Stops</h2>
          {storedStopData.map((stop) => (
            <BusCard key={stop.id || stop.code} stop={stop} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashBoard;
