const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');

/* ⭐ COUPON SERVICE */
const { applyCoupon } = require('./coupon.service');


/* ===========================
   FARE CALCULATION
=========================== */
async function getFare(pickup, destination) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    let distanceKm = 5;
    let durationMin = 15;

    try {

        const distanceTime =
            await mapService.getDistanceTime(
                pickup,
                destination
            );

        distanceKm = Math.max(
            1,
            Math.round(distanceTime.distance / 1000)
        );

        durationMin = Math.max(
            5,
            Math.round(distanceTime.duration / 60)
        );

    } catch (err) {

        console.log(
            'FARE FALLBACK USED:',
            err.message
        );

    }

    const baseFare = {
        auto: 30,
        bike: 30,
        mini: 40,
        sedan: 50,
        suv: 80
    };

    const perKmRate = {
        auto: 10,
        bike: 15,
        mini: 13,
        sedan: 15,
        suv: 18
    };

    const perMinuteRate = {
        auto: 2,
        bike: 2,
        mini: 2.5,
        sedan: 3,
        suv: 4
    };

    return {

        auto:
            Math.round(
                baseFare.auto +
                distanceKm * perKmRate.auto +
                durationMin * perMinuteRate.auto
            ),

        bike:
            Math.round(
                baseFare.bike +
                distanceKm * perKmRate.bike +
                durationMin * perMinuteRate.bike
            ),

        mini:
            Math.round(
                baseFare.mini +
                distanceKm * perKmRate.mini +
                durationMin * perMinuteRate.mini
            ),

        sedan:
            Math.round(
                baseFare.sedan +
                distanceKm * perKmRate.sedan +
                durationMin * perMinuteRate.sedan
            ),

        suv:
            Math.round(
                baseFare.suv +
                distanceKm * perKmRate.suv +
                durationMin * perMinuteRate.suv
            ),

        distanceKm,
        durationMin

    };
}

module.exports.getFare = getFare;


/* ===========================
   OTP GENERATOR
=========================== */
function getOtp(num) {

    return crypto
        .randomInt(
            Math.pow(10, num - 1),
            Math.pow(10, num)
        )
        .toString();

}


/* ===========================
   SURGE PRICING LOGIC
=========================== */

function calculateSurge(){

    let surge = 1;
    let reason = [];

    const hour = new Date().getHours();

    /* NIGHT SURGE */

    if(hour >= 22 || hour <= 5){
        surge += 0.3;
        reason.push("night");
    }

    /* DEMAND SURGE */

    const demandRandom = Math.random();

    if(demandRandom > 0.7){
        surge += 0.5;
        reason.push("high-demand");
    }

    /* RAIN SURGE */

    const rainRandom = Math.random();

    if(rainRandom > 0.75){
        surge += 0.4;
        reason.push("rain");
    }

    return {
        surge: Number(surge.toFixed(2)),
        reason: reason.join(", ")
    };
}



/* ===========================
   CREATE RIDE
=========================== */
module.exports.createRide = async ({
    user,
    pickup,
    destination,
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng,
    vehicleType,
    otp,
    userBid,
    couponCode
}) => {

    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(
        pickup,
        destination
    );

    /* SURGE CALCULATION */

    const surgeData = calculateSurge();

    const surgeMultiplier = surgeData.surge;

    const baseFare = fare[vehicleType];

    let finalFare =
        Math.round(baseFare * surgeMultiplier);


    /* ⭐ COORDINATE FIX (ADDED ONLY) */

    pickupLat = Number(pickupLat);
    pickupLng = Number(pickupLng);
    destinationLat = Number(destinationLat);
    destinationLng = Number(destinationLng);


    /* ===========================
       COUPON APPLY
    =========================== */

    let discount = 0;

    if(couponCode){

        try{

            const couponResult =
                await applyCoupon(
                    couponCode,
                    finalFare
                );

            discount = couponResult.discount;

            finalFare =
                couponResult.finalFare;

            console.log(
                "COUPON APPLIED:",
                couponCode,
                discount
            );

        }catch(err){

            console.log(
                "COUPON FAILED:",
                err.message
            );

        }

    }


    /* ===========================
       USER BID FIX
    =========================== */

    let finalBid = Number(userBid);

    if(!finalBid){

        if(vehicleType === "bike"){
            finalBid = 20;
        }

        else if(
            vehicleType === "auto" ||
            vehicleType === "mini" ||
            vehicleType === "sedan"
        ){
            finalBid = 30;
        }

        else{
            finalBid = finalFare;
        }

    }


    const finalOtp =
        otp || getOtp(6);

    const ride = await rideModel.create({

        user,

        pickup,
        destination,

        pickupLat,
        pickupLng,

        destinationLat,
        destinationLng,

        vehicleType,

        fare: finalFare,

        /* USER BID */

        userBid: finalBid,

        /* COUPON */

        discount,

        /* SURGE */

        surgeMultiplier,
        surgeReason: surgeData.reason,

        otp: finalOtp,

        status: 'pending'

    });

    console.log(
        'OTP GENERATED:',
        ride._id,
        finalOtp
    );

    console.log(
        'SURGE APPLIED:',
        surgeMultiplier,
        surgeData.reason
    );

    console.log(
        'USER BID:',
        finalBid
    );

    return ride;
};


/* ===========================
   CONFIRM RIDE
=========================== */
module.exports.confirmRide = async ({
    rideId,
    captain
}) => {

    if (!rideId)
        throw new Error('Ride id required');

    const ride =
        await rideModel
            .findByIdAndUpdate(
                rideId,
                {
                    status: 'accepted',
                    captain: captain._id
                },
                { new: true }
            )
            .select('+otp');

    if (!ride)
        throw new Error('Ride not found');

    return ride;
};


/* ===========================
   START RIDE
=========================== */
module.exports.startRide = async ({
    rideId,
    otp,
    captain
}) => {

    const ride =
        await rideModel
            .findById(rideId)
            .select('+otp');

    if (!ride)
        throw new Error('Ride not found');

    if (ride.status !== 'accepted')
        throw new Error('Ride not accepted');

    if (String(ride.otp).trim() !== String(otp).trim())
        throw new Error('Invalid OTP');

    ride.status = 'ongoing';
    ride.otp = undefined;
    ride.captain = captain._id;

    await ride.save();

    return ride;
};


/* ===========================
   END RIDE
=========================== */
module.exports.endRide = async ({
    rideId,
    captain
}) => {

    const ride =
        await rideModel.findOne({
            _id: rideId,
            captain: captain._id
        });

    if (!ride)
        throw new Error('Ride not found');

    if (ride.status !== 'ongoing')
        throw new Error('Ride not ongoing');

    ride.status = 'completed';

    await ride.save();

    return ride;
};