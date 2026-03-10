const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

code:{
type:String,
required:true,
unique:true,
uppercase:true
},

discountType:{
type:String,
enum:["flat","percent"],
required:true
},

discountValue:{
type:Number,
required:true
},

maxDiscount:{
type:Number,
default:0
},

minFare:{
type:Number,
default:0
},

expiry:{
type:Date
},

active:{
type:Boolean,
default:true
}

},{timestamps:true});

module.exports = mongoose.model("Coupon",couponSchema);