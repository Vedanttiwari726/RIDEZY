const express = require("express");
const router = express.Router();

/* CONTROLLER */
const {
  addSavedPlace,
  getSavedPlaces,
  deleteSavedPlace
} = require("../controllers/savedPlace.controller");

/* AUTH */
const { authUser } = require("../middlewares/auth.middleware");

/* ROUTES */
router.post("/saved-places", authUser, addSavedPlace);
router.get("/saved-places", authUser, getSavedPlaces);
router.delete("/saved-places/:id", authUser, deleteSavedPlace);

module.exports = router;