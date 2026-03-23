const rideService = require('../services/ride.service')
const { validationResult } = require('express-validator')
const { sendMessageToSocketId } = require('../socket')
const rideModel = require('../models/ride.model')
const captainModel = require('../models/captain.model')

/* ⭐ COUPON SERVICE */
const { applyCoupon } = require('../services/coupon.service')

const rideTimers = new Map()

const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString()



/* ================= SURGE CALCULATION ================= */

const calculateSurge = (pendingRides, onlineDrivers) => {

  if (onlineDrivers === 0) return 2

  const ratio = pendingRides / onlineDrivers

  if (ratio > 3) return 2
  if (ratio > 2) return 1.5
  if (ratio > 1.5) return 1.2

  return 1
}



/* ================= DISPATCH ================= */

const dispatchRideSequentially = async (ride, captains, index = 0) => {

  if (index >= captains.length) {
    ride.status = "cancelled"
    await ride.save()

    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId,{
        event:"no-driver-found",
        data:ride
      })
    }

    return
  }

  const captain = captains[index]

  if(!captain.socketId ){
    return await  dispatchRideSequentially(ride,captains,index+1)
  }

  const latestRide = await rideModel
    .findById(ride._id)
    .populate("user")

  if(!latestRide){
    return
  }

  const rideData = latestRide.toObject()

  sendMessageToSocketId(captain.socketId,{
    event:"new-ride",
   data: {
  ...ride.toObject(),

  pickupLat: ride.pickupLat,
  pickupLng: ride.pickupLng,
  destinationLat: ride.destinationLat,
  destinationLng: ride.destinationLng,

  expiresIn: 15
}
  })

  console.log("🚗 NEW RIDE SENT TO DRIVER:",captain._id)

  const timer=setTimeout(async()=>{

    const rideCheck=await rideModel.findById(ride._id)

    if(!rideCheck || rideCheck.status!=="pending")
      return

   await dispatchRideSequentially(ride,captains,index+1)

  },15000)

  rideTimers.set(ride._id.toString(),timer)
}



/* ================= CREATE ================= */

const createRide = async(req,res)=>{

  if(!req.user)
    return res.status(401).json({message:"Unauthorized user"})

  const errors = validationResult(req)

if(!errors.isEmpty()){
  console.log("VALIDATION ERROR:", errors.array())
  return res.status(400).json({errors:errors.array()})
}

  const {
    pickup,
    destination,
    vehicleType,
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng,
    userBid,
    couponCode
  } = req.body

  const pickupText = pickup?.toString() || ""
  const match = pickupText.match(/\b\d{6}\b/)

  if(match && vehicleType==="auto"){
    const pincode=parseInt(match[0])
    if(pincode < 400070){
      return res.status(400).json({
        message:"Auto service is not available in this area"
      })
    }
  }

  try{

    const otp=generateOTP()

    const pendingRides = await rideModel.countDocuments({
      status:"pending"
    })

    const onlineDrivers = await captainModel.countDocuments({
      status:"online"
    })

    const surgeMultiplier = calculateSurge(
      pendingRides,
      onlineDrivers
    )

    let surgeReason = "normal"

    if(surgeMultiplier >= 2){
      surgeReason = "extreme demand"
    }
    else if(surgeMultiplier >= 1.5){
      surgeReason = "high demand"
    }
    else if(surgeMultiplier > 1){
      surgeReason = "moderate demand"
    }

    /* ⭐ COUPON LOGIC */

    let discount = 0

    if(couponCode){

      try{

        const baseFare =
        await rideService
        .getFare(pickup,destination)
        .then(f=>f[vehicleType])

        const result =
        await applyCoupon(couponCode,baseFare)

        discount = result.discount

      }catch(err){

        console.log("Coupon error:",err.message)

      }

    }

    const ride=await rideService.createRide({
      user:req.user._id,
      pickup,
      destination,
      pickupLat,
      pickupLng,
      destinationLat,
      destinationLng,
      vehicleType,
     otp: otp,
      userBid,
      discount,
      status:"pending",
      surgeMultiplier,
      surgeReason
    })

    res.status(201).json(ride)

    /* ⭐ FIXED DRIVER DISPATCH */
const onlineCaptains = await captainModel.find({
  socketId: { $ne: null }
});

if (!onlineCaptains.length) {
  console.log("❌ No drivers online");
  return;
}

onlineCaptains.forEach(driver => {

  if (!driver.socketId) return;

  console.log("🚗 Sending ride to driver:", driver.socketId);

  sendMessageToSocketId(driver.socketId, {
    event: "new-ride",
  data: {
  ...ride.toObject(),

  pickupLat: ride.pickupLat,
  pickupLng: ride.pickupLng,
  destinationLat: ride.destinationLat,
  destinationLng: ride.destinationLng,

  expiresIn: 15
}
  });

});
    }catch(err){
    res.status(500).json({message:err.message})
  }
}



/* ================= CONFIRM ================= */

const confirmRide = async(req,res)=>{
  try{

    const ride=await rideModel.findById(req.body.rideId)

    if(!ride)
      return res.status(404).json({message:"Ride not found"})

    if(ride.status!=="pending")
      return res.status(400).json({message:"Ride already taken"})

    const timer=rideTimers.get(ride._id.toString())
    if(timer){
      clearTimeout(timer)
      rideTimers.delete(ride._id.toString())
    }

    await captainModel.findByIdAndUpdate(
      req.captain._id,
      {currentRide:ride._id}
    )

    ride.captain=req.captain._id
    ride.status="accepted"
    await ride.save()

    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId,{
        event:"ride-accepted",
        data:ride
      })
    }

    res.json(ride)

  }catch(err){
    res.status(500).json({message:err.message})
  }
}



/* ================= START ================= */

const startRide = async (req, res) => {

  try {

    const { rideId, otp } = req.query

    if (!rideId || !otp) {
      return res.status(400).json({
        message: "rideId and otp required"
      })
    }

    const ride = await rideModel
      .findById(rideId)
      .select("+otp")
      .populate("user")

    console.log("========= OTP DEBUG =========");
    console.log("RIDE ID:", rideId);
    console.log("DB OTP:", ride?.otp);
    console.log("USER OTP:", otp);
    console.log("CAPTAIN FROM TOKEN:", req.captain);
    console.log("=============================");

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      })
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({
        message: "Ride not accepted yet"
      })
    }

    // 🔥 IMPORTANT FIX
    if (Number(ride.otp) !== Number(otp)) {
      console.log("❌ OTP NOT MATCHING");
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    ride.otp = null
    ride.status = "ongoing"

    await ride.save()

    if (ride.user?.socketId) {
  sendMessageToSocketId(
    ride.user.socketId,
    {
      event: "ride-started",
     data: {
  rideId: ride._id.toString(),

  // 🔥 FINAL FORMAT
  pickup: {
    lat: ride.pickupLat,
    lng: ride.pickupLng
  },

  destination: {
    lat: ride.destinationLat,
    lng: ride.destinationLng
  }
}
    }
  );
}

    return res.json(ride)

  } catch (err) {

    console.log("START RIDE ERROR:", err)

    return res.status(500).json({
      message: err.message
    })

  }

}

/* ================= END ================= */

const endRide = async(req,res)=>{

  if(!req.captain)
    return res.status(401).json({message:"Unauthorized captain"})

  try{

    const ride=await rideModel.findById(req.body.rideId)

    if(!ride)
      return res.status(404).json({message:"Ride not found"})

    ride.status="completed"
    ride.captain=req.captain._id

    if(!ride.fare){
      ride.fare=await rideService
        .getFare(ride.pickup,ride.destination)
        .then(f=>f[ride.vehicleType])
    }

    const surge = ride.surgeMultiplier || 1

    ride.fare = Math.round(ride.fare * surge)

    ride.driverEarning=Math.round(ride.fare*0.4)

    await ride.save()

    await captainModel.findByIdAndUpdate(
      req.captain._id,
      {currentRide:null}
    )

    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId,{
        event:"ride-ended",
        data:ride
      })
    }

    res.json(ride)

  }catch(err){
    res.status(500).json({message:err.message})
  }
}



/* ================= FARE ================= */

const getFare = async(req,res)=>{
  const fare=await rideService.getFare(
    req.query.pickup,
    req.query.destination
  )
  res.json(fare)
}



/* ================= USER HISTORY ================= */

const getUserRideHistory = async(req,res)=>{
  const rides=await rideModel
    .find({user:req.user._id})
    .sort({createdAt:-1})
  res.json(rides)
}



/* ================= CAPTAIN HISTORY ================= */

const getCaptainRideHistory = async(req,res)=>{
  const rides=await rideModel
    .find({captain:req.captain._id})
    .sort({createdAt:-1})
  res.json(rides)
}



/* ================= CAPTAIN TRIPS ================= */

const getCaptainTrips = async(req,res)=>{
  const rides=await rideModel.find({
    captain:req.captain._id,
    status:"completed"
  })
  .sort({createdAt:-1})
  .select("_id pickup destination driverEarning createdAt status")

  res.json(rides)
}



/* ================= DELETE TRIP ================= */

const deleteCaptainTrip = async(req,res)=>{
  const ride=await rideModel.findOneAndDelete({
    _id:req.params.id,
    captain:req.captain._id
  })

  if(!ride)
    return res.status(404).json({message:"Trip not found"})

  res.json({message:"Trip deleted successfully"})
}



/* ================= CAPTAIN EARNINGS ================= */

const getCaptainEarnings = async(req,res)=>{
  const rides=await rideModel.find({
    captain:req.captain._id,
    status:"completed"
  })

  const total=rides.reduce(
    (s,r)=>s+(r.driverEarning||(r.fare||0)*0.4),
    0
  )

  res.json({total,rides:rides.length})
}



/* ================= LIVE RIDE SHARING ================= */

const getRideById = async (req,res)=>{
  try{

    const ride = await rideModel
      .findById(req.params.id)
      .populate("user","name email")
      .populate("captain","fullname vehicle socketId")

    if(!ride)
      return res.status(404).json({
        message:"Ride not found"
      })

    res.json(ride)

  }catch(err){

    res.status(500).json({
      message:err.message
    })

  }
}



/* ================= CANCEL RIDE ================= */

const cancelRide = async (req,res)=>{

try{

const { rideId } = req.body

const ride = await rideModel.findById(rideId)

if(!ride)
return res.status(404).json({
message:"Ride not found"
})

ride.status = "cancelled"

await ride.save()

res.json({
message:"Ride cancelled"
})

}catch(err){

res.status(500).json({
message:err.message
})

}

}



/* ================= EXPORT ================= */

module.exports={
  createRide,
  confirmRide,
  startRide,
  endRide,
  getFare,
  getUserRideHistory,
  getCaptainRideHistory,
  getCaptainTrips,
  deleteCaptainTrip,
  getCaptainEarnings,
  getRideById,
  cancelRide
}