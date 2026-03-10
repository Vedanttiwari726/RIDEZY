import React,{ useEffect, useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import api from "../services/api";

import bikeImg from "../assets/vehicles/bike.png";
import autoImg from "../assets/vehicles/auto.png";
import miniImg from "../assets/vehicles/mini.png";
import sedanImg from "../assets/vehicles/sedan.png";
import suvImg from "../assets/vehicles/suv.png";

export default function ChooseVehicle(){

const navigate = useNavigate();
const { state } = useLocation();

const pickup = state?.pickup;
const destination = state?.destination;

/* VEHICLES */

const vehicles=[

{type:"bike",image:bikeImg},
{type:"auto",image:autoImg},
{type:"mini",image:miniImg},
{type:"sedan",image:sedanImg},
{type:"suv",image:suvImg}

];

/* STATES */

const [fare,setFare]=useState(null);
const [selectedVehicle,setSelectedVehicle]=useState(null);

const [coupon,setCoupon]=useState("");
const [discount,setDiscount]=useState(0);
const [finalFare,setFinalFare]=useState(null);

const [userBid,setUserBid]=useState("");

/* ================= FETCH FARE ================= */

useEffect(()=>{

const fetchFare=async()=>{

try{

const res = await api.get("/rides/get-fare",{
params:{
pickup:pickup?.address,
destination:destination?.address
}
});

setFare(res.data);

}catch(err){
console.log(err);
}

};

fetchFare();

},[]);


/* ================= APPLY COUPON ================= */

const applyCoupon = async()=>{

try{

const baseFare = fare?.[selectedVehicle];

const res = await api.post("/coupon/apply",{
code:coupon,
fare:baseFare
});

setDiscount(res.data.discount);
setFinalFare(res.data.finalFare);

}catch(err){
alert("Invalid coupon");
}

};


/* ================= CREATE RIDE ================= */

const createRide = async()=>{

const basePrice = fare?.[selectedVehicle] || 0;

const rideFare = finalFare ?? basePrice;

const finalBid =
userBid && Number(userBid) > 0
? Number(userBid)
: rideFare;

try{

const res = await api.post("/rides/create",{

pickup:pickup.address,
destination:destination.address,

pickupLat:pickup.lat,
pickupLng:pickup.lng,

destinationLat:destination.lat,
destinationLng:destination.lng,

vehicleType:selectedVehicle,
userBid:finalBid

});

navigate("/finding-driver",{
state:{
pickup,
destination,
otp:res.data.otp,
rideId:res.data._id
}
});

}catch(err){
console.log(err);
}

};


/* UI */

return(

<div className="min-h-screen bg-[#020617] text-white p-6">

{/* HEADER */}

<div className="flex items-center gap-4 mb-6">

<button onClick={()=>navigate(-1)}>
←
</button>

<h1 className="text-2xl font-bold">
Choose Ride
</h1>

</div>


{/* VEHICLE LIST */}

<div className="space-y-4">

{vehicles.map(v=>(

<div
key={v.type}
onClick={()=>setSelectedVehicle(v.type)}
className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer
${selectedVehicle===v.type
? "border-green-400 bg-white/10"
: "border-white/10"}`}
>

<div className="flex items-center gap-4">

<img
src={v.image}
className="w-12"
/>

<span className="capitalize">
{v.type}
</span>

</div>

<span>
₹ {fare?.[v.type] ?? "--"}
</span>

</div>

))}

</div>


{/* COUPON */}

{selectedVehicle && (

<div className="mt-6 space-y-3">

<input
type="text"
placeholder="Enter coupon code"
value={coupon}
onChange={(e)=>setCoupon(e.target.value)}
className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
/>

<button
onClick={applyCoupon}
className="w-full bg-purple-500 py-3 rounded-lg">

Apply Coupon

</button>

</div>

)}


{/* USER BID */}

{selectedVehicle && (

<div className="mt-6">

<input
type="number"
placeholder="Enter your offer price"
value={userBid}
onChange={(e)=>setUserBid(e.target.value)}
className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
/>

</div>

)}


{/* CONFIRM BUTTON */}

{selectedVehicle && (

<button
onClick={createRide}
className="w-full bg-green-500 py-4 rounded-xl font-semibold mt-6">

Confirm Ride

</button>

)}

</div>

);

}