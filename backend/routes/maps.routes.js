const express = require("express");
const router = express.Router();

const { query } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const mapController = require("../controllers/map.controller");


/* =========================
   GET COORDINATES
   (Protected Route)
========================= */

router.get(
"/get-coordinates",

authMiddleware.authUser,

query("address")
.isString()
.isLength({ min: 3 })
.withMessage("Address must be at least 3 characters"),

mapController.getCoordinates

);


/* =========================
   GET DISTANCE + TIME
   (Protected Route)
========================= */

router.get(
"/get-distance-time",

authMiddleware.authUser,

query("origin")
.isString()
.isLength({ min: 3 })
.withMessage("Origin must be at least 3 characters"),

query("destination")
.isString()
.isLength({ min: 3 })
.withMessage("Destination must be at least 3 characters"),

mapController.getDistanceTime

);


/* =========================
   AUTOCOMPLETE SUGGESTIONS
   (Public Route)
========================= */

router.get(
"/get-suggestions",

query("input")
.isString()
.isLength({ min: 3 })
.withMessage("Search input must be at least 3 characters"),

mapController.getAutoCompleteSuggestions

);


/* =========================
   REVERSE GEOCODE
   (Public Route)
========================= */

router.get(
"/reverse-geocode",

query("lat")
.isFloat()
.withMessage("Latitude must be a number"),

query("lng")
.isFloat()
.withMessage("Longitude must be a number"),

mapController.reverseGeocode

);


module.exports = router;