import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  findNearbyStops as getNearbyStops,
  formatArrival,
  getAllBusStop,
  getBusStopData,
  getNearbyBusStopData,
  getUserLocation,
  nowSGTime,
  getStoredBusStop,
  fetchLtaData,
  getLtaAlert,
} from "../utils/busApi";

// const urltest = "/ltaodataservice/v3/BusArrival?BusStopCode=83139&ServiceNo=15";

const TestAPI = () => {
  const [input, setInput] = useState("");
  const url = "/ltaodataservice/v3/BusArrival?BusStopCode=";
  const selectBusStopNo = "64029";
  //------------------GET STORED BUS STOP DATA (AIRTABLE)---------------------------
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

  //-------------------GET BUS DATA--------------------------------------------
  const busStopQuery = useQuery({
    queryKey: ["busstops"],
    queryFn: () => getBusStopData(selectBusStopNo, import.meta.env.VITE_ACCKEY),
    enabled: false, // false to stop query
    staleTime: 60_000, // auto refresh for 60s
    //   refetchOnWindowFocus: false,  // don't refetch when tab is focused
  });

  // return an empty array if return data is undefined to prevent runtime clash
  const busData = busStopQuery.data?.Services ?? busStopQuery.data ?? [];

  //----------------------------GET LOCATION----------------------------------------

  const userLocationQuery = useQuery({
    queryKey: ["userLocation"],
    queryFn: getUserLocation,
    enabled: false, // false to stop query
    staleTime: 60_000, // refresh every 60s
  });

  //----------------------------HAVERSINE DISTANCE CALCULATION-----------------------------------
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

  //-------------------GET/MAP NEARBY BUS STOP INFORMATION-------------------------------
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

  //-----------------------GET FROM LTA.GOV.SG----------------------------------------

  const ltaDataQuery = useQuery({
    queryKey: ["ltadata"],
    queryFn: () => fetchLtaData(input),
    enabled: false,
  });

  //----------------------------GET ALERT ------------------------------------------------

  const ltaAlertQuery = useQuery({
    queryKey: ["alerts"],
    queryFn: () => getLtaAlert(import.meta.env.VITE_ACCKEY),
    enabled: false,
  });

  const ltaAlert = ltaAlertQuery.data?.value ?? [];

  //--------------------------------RETURN--------------------------------------------
  return (
    <div>
      {` -------------------------return SGT------------------------------------------- `}
      <br />
      {nowSGTime()}
      <br />

      {`------------ get user location with navigator.geolocation------------------------ `}
      <br />
      <button
        className="px-5 py-2.5 bg-lime-500 text-white font-semibold rounded-lg 
                   hover:bg-green-600 active:scale-95 transition-all shadow-sm"
        onClick={() => userLocationQuery.refetch()}
      >
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
            userLocationQuery.data?.latitude,
            userLocationQuery.data?.longitude,
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
      {userLocationQuery.isError && (
        <p>Note: Using fallback location (location permission denied)</p>
      )}
      <br />
      {`----------- get bus stop information with GET from ltaodataservice------------- `}
      <br />
      <button
        className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg 
                   hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        onClick={() => busStopQuery.refetch()}
      >
        Fetch Bus Info
      </button>
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
                  {nextBuses
                    .map((bus, idx) => `${formatArrival(bus)} (${bus.Load})`)
                    .join(" | ")}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No data available</p>
        ))}
      {`-------- get nearby bus stop information with GET from ltaodataservice---------- `}
      <br />
      <button
        className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg 
                   hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        onClick={() => nearbyBusStopQuery.refetch()}
      >
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
                          {nextBuses
                            .map(
                              (bus, idx) =>
                                `${formatArrival(bus)} (${bus.Load})`,
                            )
                            .join(" | ")}
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
      {`-------- get stored bus stop number with GET from airtable---------- `}

      {/* {JSON.stringify(storedBusStopQuery.data.records[2])} */}
      <br />
      {JSON.stringify(storedBusStopData)}
      <br />
      {/* {storedBusStopQuery.isSuccess && } */}
      {`-------- get formated data of xml file from LTA.gov.sg---------- `}
      <br />
      <input
        type="text"
        name="busNo"
        inputMode="numeric"
        pattern="\d"
        value={input}
        placeholder="input bus no."
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg 
                   hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        type="button"
        onClick={() => ltaDataQuery.refetch()}
      >
        SUBMIT
      </button>
      <br />
      {ltaDataQuery.isLoading && <p>Fetching LTA DATA...</p>}
      {ltaDataQuery.isError && <p>{ltaDataQuery.error.message}</p>}
      <br />
      {ltaDataQuery.isSuccess && JSON.stringify(ltaDataQuery.data)}
      <br />
      <br />
      <button
        className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg 
                   hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        type="button"
        onClick={() => ltaAlertQuery.refetch()}
      >
        Fetch Alerts
      </button>
      <div className="break-all">
        {ltaAlertQuery.isLoading && <p>Fetching LTA DATA...</p>}
        {ltaAlertQuery.isError && <p>{ltaAlertQuery.error.message}</p>}
        {JSON.stringify(ltaAlert)}
      </div>
      <br />
      <br />

      <br />
      <br />

      <br />
    </div>
  );
};

export default TestAPI;
