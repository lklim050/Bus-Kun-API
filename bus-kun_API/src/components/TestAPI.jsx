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
    enabled: false, // false to stop query
    staleTime: 60_000, // refresh every 60s
  });

  //----------------------------HAVERSINE DISTANCE CALCULATOR-----------------------------------
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

  const getAllBusStop = async () => {
    const res = await fetch("/stops.json");
    if (!res.ok) {
      throw new Error("cannot find local data - stops.json");
    }
    return res.json();
  };

  const allBusStopQuery = useQuery({
    queryKey: ["allBusStop"],
    queryFn: getAllBusStop,
  });

  function findNearbyStops(lat = 1.3, lon = 103.84, radiusKm = 0.5) {
    if (!lat || !lon || !allBusStopQuery.data) return [];
    const stopsArray = Object.entries(allBusStopQuery.data).map(
      ([code, data]) => ({
        code,
        longitude: data[0],
        latitude: data[1],
        description1: data[2],
        description2: data[3],
      }),
    );
    return stopsArray
      .map((stop) => ({
        ...stop,
        distanceKm: haversineDistance(lat, lon, stop.latitude, stop.longitude),
      }))
      .filter((s) => s.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
  //-------------------GET/MAP NEARBY BUS STOP INFORMATION-------------------------------
  const nearbyBusStopArray = findNearbyStops(
    locationQuery.data?.latitude,
    locationQuery.data?.longitude,
  ).map((stop) => ({ ...stop }));

  const getNearbyBusStopData = async () => {
    const nearbyStopsWithServices = [];

    for (let i = 0; i < nearbyBusStopArray.length; i++) {
      const res = await fetch(url + nearbyBusStopArray[i].code, {
        headers: { AccountKey: import.meta.env.VITE_ACCKEY },
      });
      if (!res.ok) {
        throw new Error("cannot fetch bus data, please check url or location");
      }

      const data = await res.json();
      const services = data?.Services ?? [];

      nearbyStopsWithServices.push({
        ...nearbyBusStopArray[i],
        services,
      });
    }

    return nearbyStopsWithServices;
  };

  const nearbyBusStopQuery = useQuery({
    queryKey: ["nearbyBusStop"],
    queryFn: getNearbyBusStopData,
    staleTime: 60_000,
    enabled: false, // true to fetch url
  });

  // return an empty array if return data is undefined to prevent runtime clash
  const nearbyBusData = nearbyBusStopQuery.data ?? [];

  //--------------------------------RETURN--------------------------------------------
  return (
    <div>
      {` -------------------------return SGT------------------------------------------- `}
      <br />
      {nowSGTime()}
      <br />

      {`------------ get user location with navigator.geolocation------------------------ `}
      <br />
      <button onClick={() => locationQuery.refetch()}>
        Fetch user Location
      </button>
      <br />
      {`This is Your Location:`}
      <br />
      {locationQuery.isSuccess && locationQuery.data ? (
        <p>{`Lat: ${locationQuery.data.latitude}, Long: ${locationQuery.data.longitude}`}</p>
      ) : (
        <p>
          location not ON, using fallback location Plaza Singapura (lat:1.3,
          lon=103.84)
        </p>
      )}
      <br />
      {`----------- get nearby bus based on user location or fallback--------------- `}
      <br />

      {`Here are the bus stop near you:`}
      <br />
      {allBusStopQuery.isLoading && <p>Loading bus stops...</p>}
      {allBusStopQuery.isError && (
        <p>Error loading bus stops: {allBusStopQuery.error?.message}</p>
      )}
      {allBusStopQuery.isSuccess && allBusStopQuery.data ? (
        <ul>
          {findNearbyStops(
            locationQuery.data?.latitude,
            locationQuery.data?.longitude,
          ).map((stop) => (
            <li key={stop.code}>
              {stop.code} - {stop.description1} ({stop.distanceKm.toFixed(2)}{" "}
              km)
            </li>
          ))}
        </ul>
      ) : (
        <p>Waiting for bus stop data...</p>
      )}
      {locationQuery.isError && (
        <p>Note: Using fallback location (location permission denied)</p>
      )}
      <br />
      {`----------- get bus stop information with GET from ltaodataservice------------- `}
      <br />
      <button onClick={() => busStopQuery.refetch()}>Fetch Bus Info</button>
      <br />
      {busStopQuery.isLoading && <h3>Loading...</h3>}
      {busStopQuery.isError && <h3>{busStopQuery.error?.message}</h3>}
      <br />
      {(busStopQuery.isSuccess || busStopQuery.data) &&
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
      {`----------- get bus stop information with GET from ltaodataservice------------- `}
      <br />
      <button onClick={() => nearbyBusStopQuery.refetch()}>
        Fetch Nearby Bus Info
      </button>
      <br />
      {nearbyBusStopQuery.isLoading && <h3>Loading...</h3>}
      {nearbyBusStopQuery.isError && (
        <h3>{nearbyBusStopQuery.error?.message}</h3>
      )}
      <br />
      {(nearbyBusStopQuery.isSuccess || nearbyBusStopQuery.data) &&
        (nearbyBusData.length > 0 ? (
          <div>
            {nearbyBusData.map((stop) => (
              <div key={stop.code}>
                <h4>
                  Stop {stop.code} - {stop.description1} (
                  {stop.distanceKm.toFixed(2)} km)
                </h4>
                {stop.services.length > 0 ? (
                  <ul>
                    {stop.services.map((item, index) => {
                      const nextBuses = [
                        item.NextBus,
                        item.NextBus2,
                        item.NextBus3,
                      ].filter(Boolean);

                      return (
                        <li key={`${stop.code}-${item.ServiceNo}-${index}`}>
                          Service {item.ServiceNo} - Next Bus:{" "}
                          {formatNextBusTime(nextBuses)}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>No data available for this stop</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No data available</p>
        ))}
      {/* {JSON.stringify(nearbyBusStopArray)} */}
    </div>
  );
};

export default TestAPI;
