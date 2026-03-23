const SavedPlace = require("../models/savedPlace.model");

/* ADD */
const addSavedPlace = async (req, res) => {
  try {
    const { label, address, lat, lng } = req.body;

    if (!label || !address || lat == null || lng == null) {
      return res.status(400).json({ message: "All fields required" });
    }

    const place = await SavedPlace.create({
      user: req.user._id,
      label,
      address,
      lat,
      lng
    });

    res.status(201).json(place);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET */
const getSavedPlaces = async (req, res) => {
  try {
    const places = await SavedPlace.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(places);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
const deleteSavedPlace = async (req, res) => {
  try {
    await SavedPlace.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addSavedPlace,
  getSavedPlaces,
  deleteSavedPlace
};