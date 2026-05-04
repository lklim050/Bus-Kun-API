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
    <div>
      <h1>DASHBOARD</h1>
      <br />
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      {showModal && <DashBoardModal setShowModal={setShowModal} />}

      {` ================================================================= `}
      <br />
      <button onClick={() => userLocationQuery.refetch()}>
        Fetch user Location
      </button>
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
      <button onClick={() => storedStopQuery.refetch()}>
        Refresh Stored Bus Stop
      </button>
      {storedBusStopQuery.isLoading && <p>Refreshing your favourites</p>}
      <br />
      {/* Stored Bus Stops from Airtable - mapping section */}
      {storedStopQuery.isLoading && <h3>Loading your favourites stops...</h3>}
      {storedStopQuery.isError && <h3>{storedStopQuery.error?.message}</h3>}
      {storedStopData.length > 0 && (
        <div>
          <h3>Stored Bus Stops</h3>
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
