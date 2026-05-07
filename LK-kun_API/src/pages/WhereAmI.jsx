import React from "react";
import { useState, useEffect } from "react";
import {
  findNearbyStops,
  formatArrival,
  getAllBusStop,
  getBusStopData,
  getNearbyBusStopData,
  getUserLocation,
  nowSGTime,
  haversineDistance,
} from "../utils/busApi";

// below are packages from leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useQuery } from "@tanstack/react-query";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map when location is found
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], 25);
  }, [coords, map]);
  return null;
}

const WhereAmI = () => {
  const [myPos, setMyPos] = useState({ lat: 1.3, lng: 103.84 });

  //--------------------- This finds user location-------------------------------
  //   useEffect(() => {
  //     // Ask browser for permission
  //     navigator.geolocation.getCurrentPosition(
  //       (pos) => {
  //         setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  //       },
  //       (err) => console.error("User denied location", err),
  //     );
  //   }, []);

  if (!myPos)
    return (
      <p className="p-4 bg-gray-100 animate-pulse">Finding your location...</p>
    );
  //----------------------------GET USER LOCATION-------------------------------------
  const userLocationQuery = useQuery({
    queryKey: ["userLocation"],
    queryFn: getUserLocation,
    enabled: false, // false to stop query
    staleTime: 60_000, // refresh every 60s
  });

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
  //-----------------------------------RETURN---------------------------------------------
  return (
    <div>
      <h1 className="text-2xl mt-3 sm:text-3xl font-bold tracking-tight">
        WHERE AM I??
      </h1>
      <hr className="border-gray-300" />
      <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-blue-500">
        <MapContainer
          center={[myPos.lat, myPos.lng]}
          zoom={25} // you need to set zoom at helper component too
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Your current location marker */}
          <Marker position={[myPos.lat, myPos.lng]}>
            <Popup>You are here! </Popup>
          </Marker>
          <Circle
            center={[myPos.lat, myPos.lng]}
            radius={500}
            pathOptions={{
              fillColor: "#3b82f6", // blue-500
              fillOpacity: 0.2,
              color: "#3b82f6",
              weight: 1,
              dashArray: "5, 10", // Optional: creates a dashed border
              className: "animate-pulse", // Tailwind animation
            }}
          />
          {/* Map Nearby Bus Stops */}
          {nearbyBusStopQuery.isLoading && (
            <h3 className="text-base sm:text-lg font-semibold">Loading...</h3>
          )}
          {nearbyBusStopQuery.isError && (
            <h3 className="text-base sm:text-lg font-semibold text-red-600">
              {nearbyBusStopQuery.error?.message}
            </h3>
          )}
          {(nearbyBusStopQuery.isSuccess || nearbyBusStopQuery.data) &&
            (nearbyBusData.length > 0 ? (
              <div>
                {nearbyBusData.map((busStop, index) => (
                  <div key={index}>
                    <Marker position={[busStop.latitude, busStop.longitude]}>
                      <Popup>
                        Bus Stop Number:{busStop.code} -{" "}
                        {busStop.distanceKm.toFixed(2)}km away
                      </Popup>
                    </Marker>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm sm:text-base text-gray-700">
                No nearby bus stops found
              </p>
            ))}

          <RecenterMap coords={myPos} />
        </MapContainer>
      </div>
      <br />
      <br />
      <button
        onClick={() => userLocationQuery.refetch()}
        className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm sm:text-base hover:bg-slate-800"
      >
        Fetch user Location
      </button>
      <button
        onClick={() => nearbyBusStopQuery.refetch()}
        className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm sm:text-base hover:bg-slate-800"
      >
        Fetch Nearby Bus Info
      </button>
      <br />
      <br />
    </div>
  );
};

export default WhereAmI;
