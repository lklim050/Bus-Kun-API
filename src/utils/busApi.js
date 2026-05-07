export const sampleStatus2 = {
  Status: 3,
  AffectedSegments: [
    {
      Line: "CCL",
      Direction: "Harbourfront",
      Stations: "CC1,CC2,CC3,CC4,CC5",
      FreePublicBus: "CC1,CC2,CC3,CC4,CC5",
      FreeMRTShuttle: "CC1,CC2,CC3,CC4,CC5",
      MRTShuttleDirection: "Harbourfront",
    },
    {
      Line: "EWL",
      Direction: "Pasir Ris",
      Stations: "EW1,EW2,EW3,EW4,EW5",
      FreePublicBus: "EW1,EW2,EW3,EW4,EW5",
      FreeMRTShuttle: "EW1,EW2,EW3,EW4,EW5",
      MRTShuttleDirection: "Pasir Ris",
    },
  ],
  Message: [
    {
      Content:
        "17:15-CCL: Due to a train fault, please allow for 20 minutes additional travel time between Dhoby Ghaut and Paya Lebar.",
      CreatedDate: "2026-05-06 17:20:10",
    },
    {
      Content:
        "17:25-CCL: Free public bus services are available between Dhoby Ghaut and Paya Lebar. Bridging bus services have been activated.",
      CreatedDate: "2026-05-06 17:30:05",
    },
    {
      Content:
        "17:20-EWL: Due to a track fault, please allow for 25 minutes additional travel time between Pasir Ris and Tanah Merah.",
      CreatedDate: "2026-05-06 17:25:00",
    },

    {
      Content:
        "05:00-SK-Planned Service Adjustment. From 19 Apr to 18 Oct 2026, the Sengkang West LRT Inner Loop (i.e. direction of STC Sengkang towards SW1 Cheng Lim) will be closed. Commuters can continue to use the Sengkang West LRT Outer Loop (i.e. direction of STC Sengkang towards SW8 Renjong), peak-hours shuttle bus services, or regular bus services.",
      CreatedDate: "2026-04-18 11:50:27",
    },
    {
      Content:
        "05:00-CCL-Planned Service Adjustment. From 11 Apr to 17 May 2026, Circle Line train services will end earlier at 11.00pm on Saturday nights and commence later at 9.00am on Sunday mornings. Please use alternative MRT lines and bus services.",
      CreatedDate: "2026-04-10 00:15:58",
    },
  ],
};

// --- GET AND FORMAT CURRENT TIME ---
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

// --- GET ARRIVAL DIFFERENCE IN MINUTES ---
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
// --- HAVERSINE DISTANCE FROM LAT/LON ---
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
// --- FETCH ALL SG BUS STOPS FROM STATIC JSON ---
export const getAllBusStop = async () => {
  const res = await fetch("/stops.json");
  if (!res.ok) {
    throw new Error("cannot find local data - stops.json");
  }
  return await res.json();
};
// --- RETURN NEARBY BUS STOPS FOR USER LOCATION ---
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
// --- GET USER COORDINATES WITH GEOLOCATION ---
export const getUserLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // reject does not hard stop like throw
      reject(new Error("Geolocation might not be supported"));
      return;
    }
    // if success, return those resolved
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy, //optional
          timestamp: position.timestamp, //optional
        });
      },
      (error) => reject(error), // error such as permission, coordinate not found or timeout
      { enableHighAccuracy: true, timeout: 10000 }, // options for performance
    );
  });
};
// --- GET BUS STOP ARRIVAL DATA ---
export const getBusStopData = async (busStopCode, accountKey) => {
  const res = await fetch(
    `${import.meta.env.VITE_BUSARRIVAL_URL}${busStopCode}`,
    {
      headers: { AccountKey: accountKey },
    },
  );

  if (!res.ok) {
    throw new Error("cannot fetch, check url or connection");
  }

  return await res.json();
};
// --- BUILD BUS STOP DETAILS WITH DISTANCE ---
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
// --- GET AND ATTACH ARRIVAL DATA FOR NEARBY STOPS ---
export const getNearbyBusStopData = async (nearbyStops, accountKey) => {
  // Create an array of Promises immediately
  const stopRequests = nearbyStops.map(async (stop) => {
    const res = await fetch(
      `${import.meta.env.VITE_BUSARRIVAL_URL}${stop.code}`,
      {
        headers: { AccountKey: accountKey },
      },
    );

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

  // Ensure only when all fetches to be resolved before return
  return Promise.all(stopRequests);
};

// --- GET STORED BUS STOPS FROM AIRTABLE ---
export const getStoredBusStop = async () => {
  const res = await fetch(import.meta.env.VITE_AIRTABLE_URL, {
    headers: {
      // The word "Bearer" must be followed by a single space
      Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return await res.json();
};
// --- GET STORED BUS STOPS WITH ARRIVAL DETAILS ---
export const getStoredBusStopData = async (
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

    const res = await fetch(`${import.meta.env.VITE_BUSARRIVAL_URL}${code}`, {
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
// --- FETCH AND PARSE LTA BUS ROUTE XML ---
export const fetchLtaData = async (busCode) => {
  const res = await fetch(`/map/busService/bus_route_xml/${busCode}.xml`);

  if (!res.ok) {
    throw new Error("no data or invalid input");
  }

  const convertXMLtoText = await res.text(); //from raw data (even though it is xml) to string,
  const parser = new DOMParser(); // create a Parser Engine from class
  const xmlDoc = parser.parseFromString(convertXMLtoText, "text/xml"); // convert back to DOM

  // Target the <direction> tags first
  const directions = xmlDoc.getElementsByTagName("direction");

  // Array.from(directions) create an array of DOM element
  return Array.from(directions).map((dir) => {
    // 2. Inside each direction, find all its child <busstop> tags
    const stops = dir.getElementsByTagName("busstop");
    return {
      directionName: dir.getAttribute("name"), // "From Punggol Int to Yishun Int"

      // 3. Nest the array of stops inside this direction object
      stops: Array.from(stops).map((stop) => ({
        stopCode: stop.getAttribute("name"),
        description: stop.getElementsByTagName("details")[0]?.textContent,
        // Reach into operating hours for each stop
        timing: {
          weekdaysFirst: stop
            .getElementsByTagName("weekdays")[0]
            ?.getElementsByTagName("first")[0]?.textContent,
          weekdaysLast: stop
            .getElementsByTagName("weekdays")[0]
            ?.getElementsByTagName("last")[0]?.textContent,

          saturdayFirst: stop
            .getElementsByTagName("saturdays")[0]
            ?.getElementsByTagName("first")[0]?.textContent,
          saturdayLast: stop
            .getElementsByTagName("saturdays")[0]
            ?.getElementsByTagName("last")[0]?.textContent,

          sundayFirst: stop
            .getElementsByTagName("sundays")[0]
            ?.getElementsByTagName("first")[0]?.textContent,
          sundayLast: stop
            .getElementsByTagName("sundays")[0]
            ?.getElementsByTagName("last")[0]?.textContent,
        },
      })),
    };
  });
};
// --- GET TRAIN ALERT ---

export const getLtaAlert = async () => {
  const res = await fetch(import.meta.env.VITE_ALERT_URL, {
    headers: { AccountKey: import.meta.env.VITE_ACCKEY },
  });

  if (!res.ok) {
    throw new Error("cannot get alert, check url or connection");
  }
  return res.json();
};

// --- GET LOCATION NAME ---
export const getLocationName = async (lat, lng) => {
  const res = await fetch(
    `${import.meta.env.VITE_LOCATION_URL}&lat=${lat}&lon=${lng}&accept-language=en`,
  );

  if (!res.ok) {
    throw new Error("cannot get location name");
  }

  return res.json();
};
