import React, { useState } from "react";
import ReactDOM from "react-dom";
import BusCard from "./BusCard";
import {
  getBusStopData,
  getBusStopDetails,
  getUserLocation,
  getAllBusStop,
  getStoredBusStop,
  getStoredBusStopData,
} from "../utils/busApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const OverLay = (props) => {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
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

  //--------------------------------------RETURN-------------------------------------------------
  return (
    <div className="fixed inset-0 z-40 bg-black/70">
      <div className="fixed inset-0 bg-white overflow-y-auto p-3 sm:p-4 sm:inset-auto sm:top-[8vh] sm:bottom-[8vh] sm:left-1/2 sm:-translate-x-1/2 sm:w-[92%] sm:max-w-4xl sm:rounded-xl">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ADD BUS STOP HERE
          </h1>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-lg">
            <span className="text-blue-600 text-lg">💡</span>
            <p className="my-auto text-sm text-blue-800">
              <span className="font-semibold">Tips:</span> Enter 5-digits bus
              stop number. Example: 08111 - Winsland Hse
            </p>
          </div>
          <input
            type="text"
            name="busStopNo"
            inputMode="numeric"
            pattern="\d"
            maxLength={5}
            value={input}
            placeholder="input bus stop no."
            onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
            className="w-full sm:flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => busStopQuery.refetch()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Search
          </button>
          <button
            onClick={() => {
              setInput("");
              queryClient.removeQueries({ queryKey: ["busstops"] });
              props.setShowModal(false);
            }}
            className="px-3 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400 text-sm"
          >
            Close
          </button>
        </div>
        <br />
        {busStopQuery.isLoading && (
          <h3 className="text-base sm:text-lg font-bold">Loading...</h3>
        )}
        {busStopQuery.isError && (
          <h3 className="text-base sm:text-lg font-bold text-red-600">
            {busStopQuery.error?.message}
          </h3>
        )}
        {(busStopQuery.isSuccess || busStopQuery.data) &&
          (busStopDataEx && busStopDataEx.services.length > 0 ? (
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-2">
                Search Result
              </h3>
              <BusCard
                key={busStopDataEx.id || busStopDataEx.code}
                id={busStopDataEx.id}
                stop={busStopDataEx}
                code={busStopDataEx.code}
                description1={busStopDataEx.description1}
                services={busStopDataEx.services}
                distanceKm={busStopDataEx.distanceKm}
              />
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">
              No bus services available for this stop
            </p>
          ))}
      </div>
    </div>
  );
};

const DashBoardModal = (props) => {
  return (
    <div>
      {" "}
      {ReactDOM.createPortal(
        <OverLay setShowModal={props.setShowModal} />,
        document.querySelector("#modal-root"),
      )}
    </div>
  );
};

export default DashBoardModal;
