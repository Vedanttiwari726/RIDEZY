const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator');
const axios = require("axios");


/* =========================
   GET COORDINATES
========================= */
module.exports.getCoordinates = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { address } = req.query;

    try {

        const coordinates =
        await mapService.getAddressCoordinate(address);

        res.status(200).json(coordinates);

    } catch (error) {

        console.error("COORDINATE ERROR:", error.message);

        res.status(404).json({
            message: "Coordinates not found"
        });

    }

};


/* =========================
   DISTANCE + TIME
========================= */
module.exports.getDistanceTime = async (req, res) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { origin, destination } = req.query;

        const distanceTime =
        await mapService.getDistanceTime(origin, destination);

        res.status(200).json(distanceTime);

    } catch (err) {

        console.error("DISTANCE ERROR:", err.message);

        res.status(500).json({
            message: "Internal server error"
        });

    }

};


/* =========================
   AUTOCOMPLETE (FIXED)
========================= */
module.exports.getAutoCompleteSuggestions = async (req, res) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { input } = req.query;

        if (!input) {
            return res.json([]);
        }

        /* ⭐ IMPORTANT FIX */
        const suggestions =
        await mapService.getAutoCompleteSuggestions(input);

        res.json(suggestions);

    } catch (err) {

        console.error("AUTOCOMPLETE ERROR:", err.message);

        res.status(500).json({
            message: "Location suggestions failed"
        });

    }

};


/* =========================
   REVERSE GEOCODE
========================= */
module.exports.reverseGeocode = async (req, res) => {

    try {

        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                message: "Latitude and longitude required"
            });
        }

        const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
                params: {
                    lat,
                    lon: lng,
                    format: "json"
                },
                headers: {
                    "User-Agent": "ride-app"
                }
            }
        );

        res.json({
            address: response.data.display_name
        });

    } catch (err) {

        console.error(
            "REVERSE GEOCODE ERROR:",
            err.message
        );

        res.status(500).json({
            message: "Reverse geocoding failed"
        });

    }

};