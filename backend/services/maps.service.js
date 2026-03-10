const axios = require("axios");

/* ==========================
   CONSTANTS
========================== */

// Mumbai Metropolitan Region Bounding Box
// [minLon, minLat, maxLon, maxLat]
const MMR_BBOX = "72.65,18.80,73.20,19.50";

// Hard bounding box values
const MIN_LAT = 18.80;
const MAX_LAT = 19.50;
const MIN_LNG = 72.65;
const MAX_LNG = 73.20;

// Auto allowed north of Bandra
const AUTO_ALLOWED_NORTH_LAT = 19.06;


/* ==========================
   VALID MMR CITIES
========================== */

const VALID_CITIES = [
  "mumbai",
  "mumbai suburban",
  "thane",
  "navi mumbai",
  "kalyan",
  "dombivli",
  "dombivali",
  "mira bhayandar",
  "mira road",
  "vasai",
  "virar",
  "nalasopara",
  "nallasopara",
  "panvel",
  "ulhasnagar"
];


/* ==========================
   AUTOCOMPLETE SUGGESTIONS
   (MMR ONLY)
========================== */

const getAutoCompleteSuggestions = async (input) => {

  if (!input || input.length < 3) return [];

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(input)}` +
    `&format=json` +
    `&addressdetails=1` +
    `&limit=8` +
    `&countrycodes=in` +
    `&bounded=1` +
    `&viewbox=${MMR_BBOX}`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "ride-booking-app"
    }
  });

  return res.data
    .filter(place => {

      const lat = Number(place.lat);
      const lng = Number(place.lon);

      /* ================= HARD BOUNDING BOX ================= */

      const insideMMR =
        lat >= MIN_LAT &&
        lat <= MAX_LAT &&
        lng >= MIN_LNG &&
        lng <= MAX_LNG;

      if (!insideMMR) return false;

      /* ================= CITY VALIDATION ================= */

      const addr = place.address || {};

      const locationText = `
        ${addr.city || ""}
        ${addr.town || ""}
        ${addr.municipality || ""}
        ${addr.county || ""}
        ${addr.state_district || ""}
        ${addr.suburb || ""}
      `.toLowerCase();

      return VALID_CITIES.some(city =>
        locationText.includes(city)
      );

    })
    .map(place => ({

      display_name: place.display_name,

      lat: Number(place.lat),

      lng: Number(place.lon)

    }));

};


/* ==========================
   ADDRESS → COORDINATES
========================== */

const getAddressCoordinate = async (address) => {

  try {

    if (!address || address.length < 3)
      throw new Error("Address too short");

    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(address)}` +
      `&format=json` +
      `&limit=1` +
      `&countrycodes=in`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "ride-booking-app"
      }
    });

    if (!res.data || res.data.length === 0)
      throw new Error("No results from Nominatim");

    return {
      lat: Number(res.data[0].lat),
      lng: Number(res.data[0].lon)
    };

  } catch (err) {

    console.error("GEOCODE FAILED:", address);

    throw err;

  }

};


/* ==========================
   DISTANCE + TIME (OSRM)
========================== */

const getDistanceTime = async (origin, destination) => {

  const originCoords =
    await getAddressCoordinate(origin);

  const destCoords =
    await getAddressCoordinate(destination);

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${originCoords.lng},${originCoords.lat};` +
    `${destCoords.lng},${destCoords.lat}?overview=false`;

  const res = await axios.get(url);

  if (!res.data.routes || res.data.routes.length === 0)
    throw new Error("No route found");

  return {
    distance: res.data.routes[0].distance,
    duration: res.data.routes[0].duration
  };

};


/* ==========================
   DISTANCE ONLY (FARE)
========================== */

const getDistance = async (origin, destination) => {

  const { distance } =
    await getDistanceTime(origin, destination);

  return distance;

};


/* ==========================
   AUTO PERMIT LOGIC
========================== */

const isAutoAllowed = (pickupCoords, dropCoords) => {

  return (
    pickupCoords.lat >= AUTO_ALLOWED_NORTH_LAT &&
    dropCoords.lat >= AUTO_ALLOWED_NORTH_LAT
  );

};


/* ==========================
   EXPORTS
========================== */

module.exports = {
  getAutoCompleteSuggestions,
  getAddressCoordinate,
  getDistanceTime,
  getDistance,
  isAutoAllowed
};