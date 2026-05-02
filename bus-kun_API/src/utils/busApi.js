export const BUS_ARRIVAL_URL = "/ltaodataservice/v3/BusArrival?BusStopCode=";

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

export const formatNextBusTime = (nextBus) => {
  if (!nextBus) {
    return "No next bus data";
  }

  const buses = Array.isArray(nextBus) ? nextBus : [nextBus];

  return buses
    .map((bus, index) => {
      const estimatedArrival = bus?.EstimatedArrival ?? "N/A";
      const arrivalMs = new Date(estimatedArrival).getTime();

      if (Number.isNaN(arrivalMs)) {
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

export const getNearbyBusStopData = async (nearbyStops, accountKey) => {
  const nearbyStopsWithServices = [];

  for (let i = 0; i < nearbyStops.length; i++) {
    const res = await fetch(`${BUS_ARRIVAL_URL}${nearbyStops[i].code}`, {
      headers: { AccountKey: accountKey },
    });

    if (!res.ok) {
      throw new Error("cannot fetch bus data, please check url or location");
    }

    const data = await res.json();
    nearbyStopsWithServices.push({
      ...nearbyStops[i],
      services: data?.Services ?? [],
    });
  }

  return nearbyStopsWithServices;
};
