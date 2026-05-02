import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

// const urltest = "/ltaodataservice/v3/BusArrival?BusStopCode=83139&ServiceNo=15";

const TestAPI = () => {
  //   const queryClient = useQueryClient();
  const url = "/ltaodataservice/v3/BusArrival?BusStopCode=";
  const selectBusStopNo = "64029";

  //------------Format NextBus estimatedArrival-----------------------------

  const nowSGTime = () => {
    const now = new Date();
    const datePart = now.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Singapore",
    });
    const timePart = now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Singapore",
    }); // 24h format

    return `${datePart}T${timePart}+08:00`;
  };

  const formatNextBus = (nextBus) => {
    if (!nextBus) {
      return "No next bus data";
    }

    // ensure result is array, if not, make it an Array
    const buses = Array.isArray(nextBus) ? nextBus : [nextBus];

    return buses
      .map((bus, index) => {
        const estimatedArrival = bus?.EstimatedArrival ?? "N/A";
        const load = bus?.Load ?? "N/A";

        return `Bus ${index + 1}: ${estimatedArrival} (${load})`;
      })
      .join(" | ");
  };

  const formatNextBusTime = (nextBus) => {
    // 2026-05-02T17:53:06+08:00
    if (!nextBus) {
      return "No next bus data";
    }

    // ensure result is array, if not, make it an Array
    const buses = Array.isArray(nextBus) ? nextBus : [nextBus];

    return buses
      .map((bus, index) => {
        const estimatedArrival = bus?.EstimatedArrival ?? "N/A";
        const arrivalMs = new Date(estimatedArrival).getTime();
        if (Number.isNaN(arrivalMs)) {
          // there is no next bus, return N/A
          return `Bus ${index + 1}: N/A`;
        }
        const differenceInMinutes = Math.max(
          0,
          Math.round((arrivalMs - Date.now()) / 60000),
        );
        if (differenceInMinutes === 0) {
          return `Bus ${index + 1}: ARR`;
        }
        return `Bus ${index + 1}: ${differenceInMinutes} min`;
      })
      .join(" | ");
  };

  //-------------------GET BUS DATA--------------------------------------------
  const getBusStopData = async () => {
    const res = await fetch(url + selectBusStopNo, {
      headers: { AccountKey: import.meta.env.VITE_ACCKEY },
    });
    if (!res.ok) {
      throw new Error("cannot fetch, check url or connection");
    }
    return await res.json();
  };
  const busStopQuery = useQuery({
    queryKey: ["busstops"],
    queryFn: getBusStopData,
    enabled: false, // false to stop query
    staleTime: 60_000, // auto refresh for 60s
    //   refetchOnWindowFocus: false,  // don't refetch when tab is focused
  });

  // return an empty array if return data is undefined to prevent runtime clash
  const busData = busStopQuery.data?.Services ?? busStopQuery.data ?? [];

  //----------------------------GET LOCATION----------------------------------------

  const getUserLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  const locationQuery = useQuery({
    queryKey: ["userLocation"],
    queryFn: getUserLocation,
    staleTime: 60_000, // refresh every 60s
  });

  //-----------------------------RETURN--------------------------------------------
  return (
    <div>
      {nowSGTime()}
      <br />
      {`This is Your Location`}
      <br />
      {locationQuery.isSuccess && locationQuery.data ? (
        <p>{`Lat: ${locationQuery.data.latitude}, Long: ${locationQuery.data.longitude}`}</p>
      ) : (
        <p>no location data fetch</p>
      )}
      <br />
      {busStopQuery.isLoading && <h3>Loading...</h3>}
      {busStopQuery.isError && <h3>{busStopQuery.error?.message}</h3>}
      <br />
      {busStopQuery.isSuccess &&
        (busData.length > 0 ? (
          <ul>
            {busData.map((item, index) => {
              // filter remove false (if there are no more next bus)
              const nextBuses = [
                item.NextBus,
                item.NextBus2,
                item.NextBus3,
              ].filter(Boolean);
              return (
                <li key={index}>
                  Service {item.ServiceNo} - Next Bus:{" "}
                  {formatNextBusTime(nextBuses)}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No data available</p>
        ))}
    </div>
  );
};

export default TestAPI;
