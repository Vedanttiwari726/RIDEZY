const Coupon = require("../models/coupon.model");

const applyCoupon = async (code,fare)=>{

const coupon = await Coupon.findOne({
code:code.toUpperCase(),
active:true
});

if(!coupon)
throw new Error("Invalid coupon");

if(coupon.expiry && new Date() > coupon.expiry)
throw new Error("Coupon expired");

if(fare < coupon.minFare)
throw new Error(`Minimum fare ₹${coupon.minFare} required`);

let discount = 0;

if(coupon.discountType === "flat"){
discount = coupon.discountValue;
}

if(coupon.discountType === "percent"){

discount = (fare * coupon.discountValue)/100;

if(coupon.maxDiscount)
discount = Math.min(discount,coupon.maxDiscount);

}

const finalFare = Math.max(0,fare - discount);

return {
discount:Math.round(discount),
finalFare:Math.round(finalFare)
};

};

module.exports = { applyCoupon };