import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  getUserLocation,
  getAllBusStop,
  getStoredBusStop,
  getStoredBusStopData,
} from "../utils/busApi";
import BusCard from "../components/BusCard";
import DashBoardModal from "../components/DashBoardModal";

const DashBoard = () => {
  const [showModal, setShowModal] = useState(false);

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

  //------------------------------------RETURN------------------------------------------------

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 py-4 sm:py-6 space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        DASHBOARD
      </h1>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm sm:text-base hover:bg-blue-700"
      >
        ADD BUS STOP
      </button>
      {showModal && <DashBoardModal setShowModal={setShowModal} />}
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
        onClick={() => storedStopQuery.refetch()}
        className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm sm:text-base hover:bg-slate-800"
      >
        Refresh Stored Bus Stop
      </button>
      {storedBusStopQuery.isLoading && (
        <p className="text-sm">Refreshing your favourites</p>
      )}
      {/* Stored Bus Stops from Airtable - mapping section */}
      {storedStopQuery.isLoading && (
        <h3 className="text-base sm:text-lg font-semibold">
          Loading your favourites stops...
        </h3>
      )}
      {storedStopQuery.isError && (
        <h3 className="text-base sm:text-lg font-semibold text-red-600">
          {storedStopQuery.error?.message}
        </h3>
      )}
      {storedStopData.length > 0 && (
        <div className="space-y-3">
          {storedStopData.map((stop) => (
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
      )}
    </div>
  );
};

export default DashBoard;
