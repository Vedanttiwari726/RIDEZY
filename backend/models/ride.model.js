const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },
    pickup: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },

    /* ⭐ VEHICLE TYPE (FIX) */

    vehicleType:{
        type:String,
        enum:["bike","auto","mini","sedan","suv"],
        required:true
    },

    /* ⭐ USER BID (NEW) */

    userBid:{
        type:Number,
        default:0
    },

    /* ⭐ DRIVER EARNING */

    driverEarning:{
        type:Number,
        default:0
    },

    /* ⭐ SURGE MULTIPLIER */

    surgeMultiplier:{
        type:Number,
        default:1
    },

    /* ⭐ SURGE REASON */

    surgeReason:{
        type:String,
        default:"normal"
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'arrived','ongoing', 'completed', 'cancelled'],
        default: 'pending',
    },

    duration: {
        type: Number,
    },

    distance: {
        type: Number,
    },

    paymentID: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },

    otp: {
        type: String,
    },

}, { timestamps: true });



/* ==========================
   AUTO OTP + BID + EARNING
========================== */

rideSchema.pre('save', function (next) {

    if (!this.otp) {
        this.otp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    /* ⭐ DEFAULT USER BID */

    if(!this.userBid){

        if(this.vehicleType === "bike"){
            this.userBid = 20
        }

        else if(
            this.vehicleType === "auto" ||
            this.vehicleType === "mini" ||
            this.vehicleType === "sedan"
        ){
            this.userBid = 30
        }

    }

    /* ⭐ DRIVER 40% EARNING */

    if(this.fare && this.status==="completed" && !this.driverEarning){
        this.driverEarning = Math.round(this.fare * 0.40);
    }

    next();
});



/* ==========================
   MODEL
========================== */

const Ride = mongoose.model('ride', rideSchema);



/* ================= DASHBOARD ================= */

const getCaptainDashboard = async (req,res)=>{

  if(!req.captain)
    return res.status(401).json({message:"Unauthorized"})

  try{

    const captainId = req.captain._id

    const now = new Date()

    const todayStart = new Date(now.setHours(0,0,0,0))
    const weekStart = new Date(Date.now() - 7*24*60*60*1000)
    const monthStart = new Date(Date.now() - 30*24*60*60*1000)

    const rides = await Ride.find({
      captain:captainId,
      status:"completed"
    })

    let total = 0
    let today = 0
    let week = 0
    let month = 0

    const dailyMap = {}

    rides.forEach(r=>{

      const fare = r.driverEarning || 0
      total += fare

      const date = new Date(r.createdAt)

      if(date >= todayStart) today += fare
      if(date >= weekStart) week += fare
      if(date >= monthStart) month += fare

      const day = date.toISOString().split("T")[0]

      if(!dailyMap[day]) dailyMap[day]=0
      dailyMap[day]+=fare

    })

    const totalTrips = rides.length

    const cancelled = await Ride.countDocuments({
      captain:captainId,
      status:"cancelled"
    })

    const avgRide = totalTrips ? Math.round(total/totalTrips) : 0

    return res.json({
      earnings:{
        today,
        week,
        month,
        total
      },
      trips:{
        total: totalTrips,
        completed: totalTrips,
        cancelled
      },
      averageRideValue: avgRide,
      chart:Object.entries(dailyMap).map(([date,value])=>({
        date,
        earnings:value
      }))
    })

  }catch(err){
    console.log(err)
    res.status(500).json({message:"Dashboard error"})
  }

}



/* ==========================
   EXPORTS
========================== */

module.exports = Ride;
module.exports.getCaptainDashboard = getCaptainDashboard;