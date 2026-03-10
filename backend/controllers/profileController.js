const SavedPlace = require("../models/SavePlace");

exports.getSavedPlaces = async (req,res)=>{
const places = await SavedPlace.find({ userId: req.user.id });
res.json(places);
};

exports.addSavedPlace = async (req,res)=>{
const { label, address } = req.body;

const newPlace = await SavedPlace.create({
userId: req.user.id,
label,
address
});

res.json(newPlace);
};

exports.deleteSavedPlace = async (req,res)=>{
await SavedPlace.findByIdAndDelete(req.params.id);
res.json({ message:"Deleted" });
};