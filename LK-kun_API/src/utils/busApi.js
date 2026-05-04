export const BUS_ARRIVAL_URL = "/ltaodataservice/v3/BusArrival?BusStopCode=";
export const AIR_TABLE_URL =
  "https://api.airtable.com/v0/appc49EMnSFyGijl2/Table%201";

export const nowSGTime = () => {
  const now = new Date();
  const datePart = now.toLocaleDateString("sv-SE", {
    timeZone: "Asia/Singapore",
  });
  const timePart = now.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Singapore",
  });

  return `${datePart}T${timePart}+08:00`;
};

export const formatArrival = (bus) => {
  if (!bus) {
    return "N/A";
  }

  const estimatedArrival = bus?.EstimatedArrival ?? "N/A";
  const arrivalMs = new Date(estimatedArrival).getTime();

  if (Number.isNaN(arrivalMs)) {
    return "N/A";
  }

  const differenceInMinutes = Math.max(
    0,
    Math.round((arrivalMs - Date.now()) / 60000),
  );

  if (differenceInMinutes === 0) {
    return "ARR";
  }

  return `${differenceInMinutes} min`;
};

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getAllBusStop = async () => {
  const res = await fetch("/stops.json");
  if (!res.ok) {
    throw new Error("cannot find local data - stops.json");
  }
  return res.json();
};

export const findNearbyStops = (
  allBusStops,
  lat = 1.3,
  lon = 103.84,
  radiusKm = 0.5,
) => {
  if (!lat || !lon || !allBusStops) return [];

  const stopsArray = Object.entries(allBusStops).map(([code, data]) => ({
    code,
    longitude: data[0],
    latitude: data[1],
    description1: data[2],
    description2: data[3],
  }));

  return stopsArray
    .map((stop) => ({
      ...stop,
      distanceKm: haversineDistance(lat, lon, stop.latitude, stop.longitude),
    }))
    .filter((stop) => stop.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

export const getUserLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
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

export const getBusStopData = async (busStopCode, accountKey) => {
  const res = await fetch(`${BUS_ARRIVAL_URL}${busStopCode}`, {
    headers: { AccountKey: accountKey },
  });

  if (!res.ok) {
    throw new Error("cannot fetch, check url or connection");
  }

  return res.json();
};

export const getBusStopDetails = (
  busStopCode,
  allStopsData,
  userLat = 1.3,
  userLon = 103.84,
) => {
  if (!allStopsData || !busStopCode) return null;

  const stopData = allStopsData[busStopCode];
  if (!stopData) return null;

  const [longitude, latitude, description1, description2] = stopData;
  const distance = haversineDistance(userLat, userLon, latitude, longitude);

  return {
    code: busStopCode,
    latitude,
    longitude,
    description1,
    description2,
    distanceKm: distance,
  };
};

// export const getNearbyBusStopData = async (nearbyStops, accountKey) => {
//   const nearbyStopsWithServices = [];

//   for (let i = 0; i < nearbyStops.length; i++) {
//     const res = await fetch(`${BUS_ARRIVAL_URL}${nearbyStops[i].code}`, {
//       headers: { AccountKey: accountKey },
//     });

//     if (!res.ok) {
//       throw new Error("cannot fetch bus data, please check url or location");
//     }

//     const data = await res.json();
//     nearbyStopsWithServices.push({
//       ...nearbyStops[i],
//       services: data?.Services ?? [],
//     });
//   }

//   return nearbyStopsWithServices;
// };

export const getNearbyBusStopData = async (nearbyStops, accountKey) => {
  // 1. Create an array of Promises immediately
  const stopRequests = nearbyStops.map(async (stop) => {
    const res = await fetch(`${BUS_ARRIVAL_URL}${stop.code}`, {
      headers: { AccountKey: accountKey },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch arrival data for stop: " + stop.code);
    }

    const data = await res.json();

    // Return the merged object (the original stop info + the new services)
    return {
      ...stop,
      services: data?.Services ?? [],
    };
  });

  // 2. Wait for all fetches to resolve in parallel
  return Promise.all(stopRequests);
};

export const getStoredBusStop = async () => {
  const res = await fetch(AIR_TABLE_URL, {
    headers: {
      // The word "Bearer" must be followed by a single space
      Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return await res.json();
};

export const getBusStopDataFromStored = async (
  storedBusStop,
  accountKey,
  allStopsData,
  userLat = 1.3,
  userLon = 103.84,
) => {
  if (!Array.isArray(storedBusStop) || storedBusStop.length === 0) {
    return [];
  }
  // was advised to use map with async callback instead of for loop
  const stopRequests = storedBusStop.map(async (storedStop) => {
    const code = storedStop.busCode;
    const details = getBusStopDetails(code, allStopsData, userLat, userLon);

    const res = await fetch(`${BUS_ARRIVAL_URL}${code}`, {
      headers: { AccountKey: accountKey },
    });

    if (!res.ok) {
      throw new Error("cannot fetch bus data, please check url or location");
    }

    const data = await res.json();

    return {
      id: storedStop.id,
      type: storedStop.type,
      code,
      description1:
        details?.description1 || data?.BusStopName || "Unknown Stop",
      description2: details?.description2 || "",
      latitude: details?.latitude,
      longitude: details?.longitude,
      distanceKm: details?.distanceKm ?? 0,
      services: data?.Services ?? [],
    };
  });
  // this ensure all processes in function conclude before return
  return Promise.all(stopRequests);
};

export const putStoredBusStop = async (busCode) => {
  const res = await fetch(AIR_TABLE_URL, {
    method: "POST",
    headers: {
      // The word "Bearer" must be followed by a single space
      Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: busCode.current.value }),
  });
  if (!res.ok) {
    throw new Error("cannot add bus code to Dashboard");
  }
  return await res.json();
};
