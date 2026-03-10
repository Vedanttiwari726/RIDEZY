import React,
{ useEffect, useState, useContext } from "react";

import {
useNavigate,
useLocation
} from "react-router-dom";

import api from "../services/api";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";

import RideTracking from "./RideTracking";

import "remixicon/fonts/remixicon.css";

export default function Home(){

const navigate = useNavigate();
const routerLocation = useLocation();

const { socket } = useContext(SocketContext);
const { user } = useContext(UserDataContext);

/* STATES */

const [pickup,setPickup]=useState("");
const [destination,setDestination]=useState("");

const [showVehicles,setShowVehicles]=useState(false);
const [selectedVehicle,setSelectedVehicle]=useState(null);
const [fare,setFare]=useState(null);

const [userBid,setUserBid]=useState("");

const [coupon,setCoupon] = useState("");
const [discount,setDiscount] = useState(0);
const [finalFare,setFinalFare] = useState(null);

const [rideStatus,setRideStatus]=useState("idle");
const [driverData,setDriverData]=useState(null);

const [promoIndex,setPromoIndex]=useState(0);

/* ⭐ LOCATION FIX */
const [currentLocation,setCurrentLocation]=useState(null);


/* VEHICLES */

const vehicles=[
{type:"bike",icon:"🏍️"},
{type:"auto",icon:"🛺"},
{type:"mini",icon:"🚗"},
{type:"sedan",icon:"🚙"},
{type:"suv",icon:"🚐"}
];

/* PROMOTIONS */

const promotions=[
{
title:"Get 20% OFF",
subtitle:"On your next ride",
bg:"bg-black text-white"
},
{
title:"Weekend Cashback",
subtitle:"Flat ₹100 OFF",
bg:"bg-yellow-400 text-black"
}
];

/* ⭐ GET USER GPS LOCATION */

useEffect(()=>{

if(!navigator.geolocation) return;

navigator.geolocation.getCurrentPosition(

(pos)=>{

setCurrentLocation({
lat:pos.coords.latitude,
lng:pos.coords.longitude
});

},

(err)=>{
console.log("GPS error:",err);
}

);

},[]);


/* SOCKET */

useEffect(()=>{

if(!socket || !user?._id) return;

socket.emit("join",{userType:"user",userId:user._id});

const handleAccept=(data)=>{
setDriverData(data);
setRideStatus("matched");
};

socket.on("ride-accepted",handleAccept);

return()=>socket.off("ride-accepted",handleAccept);

},[socket,user]);

/* RECEIVE SEARCH */

useEffect(()=>{

if(!routerLocation.state) return;

const { pickup: pick, destination: drop, openVehicle } = routerLocation.state;

if(pick) setPickup(pick);
if(drop) setDestination(drop);

if(openVehicle && pick && drop){
fetchFareAndOpen(pick,drop);
}

navigate(routerLocation.pathname,{replace:true});

},[routerLocation.state]);

/* FETCH FARE */

const fetchFareAndOpen = async(pick,drop)=>{

try{

const res = await api.get("/rides/get-fare",{
params:{
pickup:pick?.address || pick,
destination:drop?.address || drop
}
});

setFare(res.data);
setShowVehicles(true);

}catch(err){
console.log(err);
}

};

/* APPLY COUPON */

const applyCoupon = async () => {

try{

const baseFare = fare?.[selectedVehicle];

const res = await api.post("/coupon/apply",{
code:coupon,
fare:baseFare
});

setDiscount(res.data.discount);
setFinalFare(res.data.finalFare);

}catch(err){
alert(err.response?.data?.message || "Invalid coupon");
}

};

/* CREATE RIDE */

const createRide = async () => {

const basePrice = fare?.[selectedVehicle] || 0;

const rideFare = finalFare ?? basePrice;

const finalBid =
userBid && Number(userBid) > 0
? Number(userBid)
: rideFare;


/* ⭐ LOCATION FIX */

const pickupLat =
pickup?.lat ||
currentLocation?.lat;

const pickupLng =
pickup?.lng ||
currentLocation?.lng;

const destinationLat =
destination?.lat;

const destinationLng =
destination?.lng;


const res = await api.post("/rides/create",{

pickup:pickup?.address || pickup,
destination:destination?.address || destination,

pickupLat,
pickupLng,

destinationLat,
destinationLng,

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

socket.emit("request-driver",res.data._id);

};

/* PROMO AUTO */

useEffect(()=>{
const id=setInterval(()=>{
setPromoIndex(p=>(p+1)%promotions.length);
},4000);
return()=>clearInterval(id);
},[]);

/* UI */

return(

<div className="min-h-screen bg-gray-100 flex flex-col">

{/* HEADER */}

<div className="p-5 bg-white shadow">

<h1 className="text-3xl font-bold mb-3">
Ridezy
</h1>

<div
onClick={()=>navigate("/search")}
className="flex items-center bg-gray-100 rounded-full px-4 py-3 cursor-pointer">

<i className="ri-search-line mr-3"></i>

<input
value={destination?.address || destination || ""}
readOnly
placeholder="Where to?"
className="flex-1 bg-transparent outline-none"
/>

</div>

</div>

{/* PROMOTIONS */}

<div className="p-5">

<div className={`rounded-2xl p-5 ${promotions[promoIndex].bg}`}>

<h2 className="text-xl font-bold">
{promotions[promoIndex].title}
</h2>

<p className="text-sm">
{promotions[promoIndex].subtitle}
</p>

</div>

</div>

{/* VEHICLES QUICK */}

<div className="px-5 grid grid-cols-5 gap-4">

{vehicles.map(v=>(
<div
key={v.type}
className="flex flex-col items-center cursor-pointer"
onClick={()=>navigate("/search",{state:{vehicle:v.type}})}
>

<div className="bg-white shadow rounded-full w-14 h-14 flex items-center justify-center text-2xl">

{v.icon}

</div>

<p className="text-xs mt-1 capitalize">
{v.type}
</p>

</div>
))}

</div>

{/* VEHICLE PANEL */}

{showVehicles && (
<div className="fixed inset-0 bg-white z-[9999] flex flex-col">

<div className="p-5 border-b flex justify-between">
<h2>Choose Ride</h2>
<button onClick={()=>setShowVehicles(false)}>✕</button>
</div>

{/* VEHICLE LIST */}

<div className="p-5 space-y-3 flex-1 overflow-y-auto">

{vehicles.map((v)=>(

<div
key={v.type}
onClick={()=>setSelectedVehicle(v.type)}
className={`border p-4 rounded-xl flex justify-between cursor-pointer
${selectedVehicle===v.type?"border-black bg-gray-100":""}`}>

<span>{v.icon} {v.type}</span>
₹ {fare?.[v.type] ?? "--"}

</div>

))}

</div>

{/* COUPON + BID + CONFIRM */}

{selectedVehicle && (

<div className="p-5 border-t space-y-4">

<div className="bg-gray-100 rounded-xl p-4">

<p className="text-sm text-gray-500 mb-2">
Apply Coupon
</p>

<div className="flex gap-2">

<input
type="text"
placeholder="Enter coupon"
value={coupon}
onChange={(e)=>setCoupon(e.target.value)}
className="flex-1 border p-2 rounded-lg"
/>

<button
onClick={applyCoupon}
className="bg-black text-white px-4 rounded-lg">
Apply
</button>

</div>

</div>

<div className="bg-gray-100 rounded-xl p-4">

<p className="text-sm text-gray-500 mb-2">
Your Offer Price (optional)
</p>

<div className="flex items-center border rounded-xl bg-white overflow-hidden">

<span className="px-4 text-gray-500 text-lg">₹</span>

<input
type="number"
placeholder={`Suggested ₹${fare?.[selectedVehicle] || ""}`}
value={userBid}
onChange={(e)=>setUserBid(e.target.value)}
className="flex-1 p-3 outline-none"
/>

</div>

</div>

<button
onClick={createRide}
className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold">

Confirm Ride

</button>

</div>

)}

</div>
)}

{/* DRIVER MATCHED */}

{rideStatus==="matched" && (
<RideTracking
pickup={pickup}
destination={destination}
eta={driverData?.eta}
/>
)}

</div>
);
}