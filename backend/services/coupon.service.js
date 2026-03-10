const coupons = {

RIDE20:{
type:"percent",
value:20,
maxDiscount:80
},

WELCOME50:{
type:"flat",
value:50
},

NIGHT30:{
type:"percent",
value:30,
maxDiscount:100
},

SAVE100:{
type:"flat",
value:100,
minFare:300
}

}


async function applyCoupon(code,fare){

if(!code) throw new Error("Coupon required")

const coupon = coupons[code.toUpperCase()]

if(!coupon) throw new Error("Invalid coupon code")

let discount = 0

/* ===== PERCENT COUPON ===== */

if(coupon.type==="percent"){

discount = fare * (coupon.value/100)

if(coupon.maxDiscount){
discount = Math.min(discount,coupon.maxDiscount)
}

}

/* ===== FLAT COUPON ===== */

if(coupon.type==="flat"){

if(coupon.minFare && fare < coupon.minFare){
throw new Error(`Minimum fare ₹${coupon.minFare} required`)
}

discount = coupon.value

}

/* ===== FINAL FARE ===== */

const finalFare = Math.max(fare - discount,0)

return{

code:code.toUpperCase(),
discount:Math.round(discount),
finalFare:Math.round(finalFare)

}

}

module.exports = { applyCoupon }