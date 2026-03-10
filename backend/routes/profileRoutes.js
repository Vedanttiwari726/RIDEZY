const express = require("express");
const router = express.Router();

const {
  getSavedPlaces,
  addSavedPlace,
  deleteSavedPlace
} = require("../controllers/profileController");

const { authUser } = require("../middlewares/auth.middleware");

/* SAVED PLACES ROUTES */

router.get("/saved-places", authUser, getSavedPlaces);
router.post("/saved-places", authUser, addSavedPlace);
router.delete("/saved-places/:id", authUser, deleteSavedPlace);

module.exports = router;