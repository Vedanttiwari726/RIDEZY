const Emergency = require("../models/emergency.model");

exports.triggerSOS = async (req,res) => {

try{

const { rideId, location } = req.body;

const emergency = await Emergency.create({
user:req.user._id,
ride:rideId,
location
});

res.status(200).json({
message:"SOS triggered",
emergency
});

}catch(err){

console.log(err);
res.status(500).json({message:"SOS failed"});

}

};