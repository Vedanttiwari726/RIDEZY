const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

ride:{
type:mongoose.Schema.Types.ObjectId,
ref:"Ride"
},

location:{
lat:Number,
lng:Number
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Emergency", emergencySchema);  