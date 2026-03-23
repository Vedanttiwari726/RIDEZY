import React,{ useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../services/api";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";

import RideTracking from "./RideTracking";

import "remixicon/fonts/remixicon.css";

/* vehicle images */

import bikeImg from "../assets/vehicles/bike.png";
import autoImg from "../assets/vehicles/auto.png";
import miniImg from "../assets/vehicles/mini.png";
import sedanImg from "../assets/vehicles/sedan.png";
import suvImg from "../assets/vehicles/suv.png";

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

const [vehicleIndex,setVehicleIndex]=useState(0);

/* ⭐ LOCATION */

const [currentLocation,setCurrentLocation]=useState(null);


/* VEHICLES */

const vehicles=[

{type:"bike",image:bikeImg},
{type:"auto",image:autoImg},
{type:"mini",image:miniImg},
{type:"sedan",image:sedanImg},
{type:"suv",image:suvImg}

];


/* ⭐ COUPON SLIDER */

const promotions=[

{
code:"RIDE20",
title:"20% OFF Ride",
subtitle:"Save up to ₹80",
color:"from-green-500 to-emerald-600"
},

{
code:"WELCOME50",
title:"₹50 OFF First Ride",
subtitle:"New user special",
color:"from-purple-500 to-indigo-600"
},

{
code:"NIGHT30",
title:"30% OFF Night Ride",
subtitle:"Valid 10PM-5AM",
color:"from-blue-500 to-cyan-500"
},

{
code:"SAVE100",
title:"Flat ₹100 OFF",
subtitle:"On rides above ₹300",
color:"from-orange-500 to-red-500"
}

]

const [promoIndex,setPromoIndex]=useState(0)

/* AUTO SLIDE */

useEffect(()=>{

const interval=setInterval(()=>{

setPromoIndex(prev=>(prev+1)%promotions.length)

},3500)

return()=>clearInterval(interval)

},[])


/* GPS */

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

const handleRideStarted = (ride)=>{
  console.log("🔥 RIDE STARTED RECEIVED:", ride);

  navigate("/ride-tracking",{
    state:{ ride }
  });
};

const handleRideEnd = (data) => {

  console.log("🚨 Ride ended (user side):", data);

  // 🔥 redirect to home
  navigate("/home");

};
socket.on("ride-ended", handleRideEnd);
socket.on("ride-accepted",handleAccept);
socket.on("ride-started", handleRideStarted);

return ()=>{
  socket.off("ride-ended", handleRideEnd);
  socket.off("ride-accepted",handleAccept);
  socket.off("ride-started", handleRideStarted); // 🔥 IMPORTANT
};

},[socket,user,navigate]);
/* RECEIVE SEARCH */

useEffect(()=>{

if(!routerLocation.state) return;

const { pickup: pick, destination: drop, openVehicle } = routerLocation.state;

if(pick) setPickup(pick);
if(drop) setDestination(drop);

if(openVehicle && pick && drop){
setShowVehicles(true);
fetchFareAndOpen(pick,drop);
}

window.history.replaceState({}, document.title);

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

}catch(err){
console.log(err);
}

};


/* CREATE RIDE */

const createRide = async () => {

const basePrice = fare?.[selectedVehicle] || 0;

const finalBid =
userBid && Number(userBid) > 0
? Number(userBid)
: basePrice;

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


/* CAROUSEL */

const nextVehicle = ()=>{
setVehicleIndex(prev=>(prev+1)%vehicles.length)
}

const prevVehicle = ()=>{
setVehicleIndex(prev=> prev===0 ? vehicles.length-1 : prev-1)
}


/* UI */

return(

<div className="min-h-screen bg-[#020617] text-white flex flex-col">

{/* HEADER */}

<div className="flex justify-between items-center px-6 pt-6">

<h1 className="text-3xl font-bold">
Ridezy
</h1>

<div className="flex gap-4 text-xl">
<i className="ri-notification-3-line"></i>
<i className="ri-user-line"></i>
</div>

</div>


{/* SEARCH */}

<div
onClick={()=>navigate("/search")}
className="mx-6 mt-6 backdrop-blur-md bg-white/10 border border-white/10 rounded-full px-5 py-4 flex items-center cursor-pointer">

<i className="ri-search-line mr-3 text-lg"></i>

<input
value={destination?.address || destination || ""}
readOnly
placeholder="Where to?"
className="flex-1 bg-transparent outline-none text-white"
/>

</div>


{/* COUPON SLIDER */}

<div className="px-6 mt-6">

<div className={`rounded-2xl p-5 bg-gradient-to-r ${promotions[promoIndex].color}`}>

<div className="flex justify-between items-center">

<div>

<h2 className="text-lg font-bold">
{promotions[promoIndex].title}
</h2>

<p className="text-sm opacity-90">
{promotions[promoIndex].subtitle}
</p>

</div>

<div className="bg-white text-black px-3 py-1 rounded-lg text-xs font-semibold">
{promotions[promoIndex].code}
</div>

</div>

</div>

</div>


{/* CAROUSEL */}

<div className="flex items-center justify-center mt-10">

<button
onClick={prevVehicle}
className="text-4xl px-6 text-gray-400 hover:text-white"
>
‹
</button>

<div className="flex flex-col items-center">

<img
src={vehicles[vehicleIndex].image}
className="w-44 drop-shadow-[0_0_25px_rgba(34,197,94,0.5)]"
/>

<p className="mt-3 text-lg capitalize font-semibold">
{vehicles[vehicleIndex].type}
</p>

</div>

<button
onClick={nextVehicle}
className="text-4xl px-6 text-gray-400 hover:text-white"
>
›
</button>

</div>


{/* BOOK BUTTON */}

<div className="px-6 mt-8">

<button
onClick={()=>navigate("/search",{state:{vehicle:vehicles[vehicleIndex].type}})}
className="w-full bg-green-500 py-4 rounded-2xl text-lg font-semibold shadow-lg">

Book {vehicles[vehicleIndex].type}

</button>

</div>


{/* VEHICLE PANEL */}

{showVehicles && (

<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end z-[9999]">

<div className="bg-[#020617] w-full rounded-t-3xl p-6 space-y-4">

<h2 className="text-xl font-semibold mb-3">
Choose Ride
</h2>

{vehicles.map(v=>(

<div
key={v.type}
onClick={()=>setSelectedVehicle(v.type)}
className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer
${selectedVehicle===v.type ? "border-green-400 bg-white/10":"border-white/10"}`}
>

<div className="flex items-center gap-4">

<img src={v.image} className="w-10"/>

<span className="capitalize">
{v.type}
</span>

</div>

<span>
₹ {fare?.[v.type] ?? "--"}
</span>

</div>

))}

{selectedVehicle && (

<button
onClick={createRide}
className="w-full bg-green-500 py-4 rounded-xl font-semibold mt-4">

Confirm Ride

</button>

)}

</div>

</div>

)}

</div>

);
}