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
  getLocationName,
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
import { useNavigate } from "react-router";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [29, 51],
  iconAnchor: [18, 51],
});
L.Marker.prototype.options.icon = DefaultIcon;

let BusIcon = L.icon({
  iconUrl: "/bus-icon.png",
  shadowUrl: "/bus-shadow-icon.png",
  iconSize: [33, 51],
  iconAnchor: [18, 51],
  shadowSize: [33, 51],
  shadowAnchor: [17, 51],
});

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
  const navigate = useNavigate();

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

  useEffect(() => {
    if (userLocationQuery.data) {
      setMyPos({
        lat: userLocationQuery.data.latitude,
        lng: userLocationQuery.data.longitude,
      });
    }
  }, [userLocationQuery.data]);

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

  //-----------------------NAVIGATE TO NEARBY PAGE-------------------------------------

  const clickBusStop = () => {
    navigate("/nearby");
  };

  //----------------------------GET LOCATION NAME-----------------------------------------

  const locationNameQuery = useQuery({
    queryKey: ["locationName"],
    queryFn: () =>
      getLocationName(
        userLocationQuery.data?.latitude,
        userLocationQuery.data?.longitude,
      ),
    enabled:
      !!userLocationQuery.data?.latitude && !!userLocationQuery.data?.longitude,
  });

  //-----------------------------------RETURN---------------------------------------------
  return (
    <div>
      <h1 className="text-2xl mt-3 ml-5 sm:text-3xl font-bold tracking-tight">
        MAP
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
                    <Marker
                      position={[busStop.latitude, busStop.longitude]}
                      icon={BusIcon}
                    >
                      <Popup>
                        <button onClick={clickBusStop}>
                          <span className="font-bold">{busStop.code}</span>{" "}
                          <br />
                          {busStop.distanceKm.toFixed(2)}km away
                        </button>
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
      {userLocationQuery.isLoading && (
        <p className="text-sm">Getting user Location</p>
      )}
      {userLocationQuery.isSuccess && userLocationQuery.data ? (
        <p className="text-sm sm:text-base">
          {`Lat: ${userLocationQuery.data.latitude}, Long: ${userLocationQuery.data.longitude}, you should be around `}
          <span className="font-bold">
            {locationNameQuery.data?.display_name}
          </span>
        </p>
      ) : (
        <p className="text-sm sm:text-base text-gray-700">
          location not ON, using fallback location Plaza Singapura (lat:1.3,
          lon=103.84)
        </p>
      )}
      <br />
      {JSON.stringify(locationNameQuery.data.display_name)}
      <br />
    </div>
  );
};

export default WhereAmI;
