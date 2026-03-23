import React, { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import LiveTracking from "../components/LiveTracking";
import api from "../services/api";

export default function FindingDriver(){

const navigate = useNavigate();
const { socket } = useContext(SocketContext);
const location = useLocation();

/* SAFE STATE */
const rideData = location.state || {};
const otp = rideData.otp || "";
const rideId = rideData.rideId || null;

const [rideStarted,setRideStarted] = useState(false);
const [driver,setDriver] = useState(null);
const [otpState] = useState(rideData.otp || "");
const [rideIdState] = useState(rideData.rideId || null);
const [pickup, setPickup] = useState(rideData.pickup || null);
const [destination, setDestination] = useState(rideData.destination || null);

/* ⭐ NEW: DRIVER BIDS */
const [bids,setBids] = useState([]);


/* ================= JOIN RIDE ROOM ================= */

useEffect(()=>{

if(!socket || !rideIdState) return;

console.log("🔥 Joining ride room:", rideIdState, socket.id);

setTimeout(()=>{
  socket.emit("join-ride-room",{ rideId: rideIdState });
},300);

},[socket,rideIdState]);


/* ================= CANCEL RIDE ================= */

const cancelRide = async () => {

try{

if(!rideId) return;

await api.post("/rides/cancel",{ rideId });

navigate("/home");

}catch(err){

console.log("Cancel ride error:",err);

}

};


/* ================= SELECT BID ================= */

const selectDriver = (captainId)=>{

if(!socket) return;

socket.emit("select-bid",{
rideId,
captainId
})

};


/* ================= SOCKET EVENTS ================= */

useEffect(()=>{

if(!socket) return;

console.log("✅ FindingDriver socket ready:", socket.id);

/* 🔥 NEW RIDE (ADDED FIX) */
const handleNewRide = (data)=>{
  console.log("🚗 NEW RIDE RECEIVED:", data);

  if(data?.pickup){
    setPickup(data.pickup);
  }

  if(data?.destination){
    setDestination(data.destination);
  }
};

/* DRIVER ACCEPTED */
const handleAccepted = (data)=>{
  console.log("Driver accepted:",data);

  if(data?.captain){
    setDriver(data.captain);
  }

  if(data?.ride?.pickup){
    setPickup(data.ride.pickup);
  }

  if(data?.ride?.destination){
    setDestination(data.ride.destination);
  }
};

/* DRIVER ARRIVED */
const handleArrived = (data)=>{
  console.log("Driver arrived:",data);
};

/* BIDS */
const handleBidUpdate = (bidList)=>{
  console.log("Driver bids:",bidList);
  setBids(bidList);
};

/* RIDE STARTED */
const handleStarted = (data)=>{
  console.log("🔥 ride-started:", data);

  setRideStarted(true);

  if(data?.ride?.pickup){
    setPickup(data.ride.pickup);
  }

  if(data?.ride?.destination){
    setDestination(data.ride.destination);
  }

  if(Number.isFinite(data?.pickup?.lat)){
    setPickup(data.pickup);
  }
};

/* DRIVER LOCATION */
const handleDriverLocation = (driverLoc)=>{
  setDriver(prev=>({
    ...(prev || {}),
    location:driverLoc
  }));
};

/* 🔥 ATTACH AFTER DELAY */
const timer = setTimeout(()=>{

  socket.on("new-ride", handleNewRide); // 🔥 ADDED
  socket.on("ride-accepted",handleAccepted);
  socket.on("driver-arrived",handleArrived);
  socket.on("ride-started",handleStarted);
  socket.on("driver-location",handleDriverLocation);
  socket.on("bid-update",handleBidUpdate);

},300);

/* DEBUG */
socket.onAny((event,data)=>{
  console.log("📡 EVENT:",event,data);
});

/* CLEANUP */
return()=>{
  clearTimeout(timer);

  socket.off("new-ride", handleNewRide); // 🔥 ADDED
  socket.off("ride-accepted",handleAccepted);
  socket.off("driver-arrived",handleArrived);
  socket.off("ride-started",handleStarted);
  socket.off("driver-location",handleDriverLocation);
  socket.off("bid-update",handleBidUpdate);
};

},[socket,rideIdState]);


/* ================= UI ================= */

return(

<div className="fixed inset-0 overflow-hidden">

{/* MAP */}

{pickup && destination && (
<div className="absolute inset-0 z-0">

<LiveTracking
pickup={pickup}
destination={destination}
driverLocation={driver?.location}
/>

</div>
)}


/* ================= BEFORE RIDE START ================= */

{!rideStarted &&  (
<>

<div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10"/>

<div className="absolute inset-0 flex items-center justify-center z-20 px-5">

<div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 space-y-6">

<h2 className="text-xl font-semibold text-center">
Finding your driver
</h2>

<p className="text-gray-500 text-sm text-center">
Drivers are bidding for your ride
</p>

<div className="bg-gray-100 rounded-2xl p-4 text-center">

<p className="text-xs text-black-500">
Share OTP with driver
</p>

<h1 className=" text-black text-3xl font-bold tracking-widest">
{otpState}
</h1>

</div>

{bids.length > 0 && (

<div className="space-y-3">

<h3 className="text-sm font-semibold text-gray-700">
Available Drivers
</h3>

{bids
.sort((a,b)=>a.price-b.price)
.map((bid,i)=>(

<div
key={i}
className="flex justify-between items-center bg-gray-100 rounded-xl p-3">

<div>

<p className="text-sm font-semibold">
{bid?.captain?.fullname?.firstname || "Driver"}
</p>

<p className="text-xs text-gray-500">
{bid?.captain?.vehicle?.vehicleType || "Vehicle"}
</p>

</div>

<button
onClick={()=>selectDriver(bid.captainId)}
className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">

₹{bid.price}

</button>

</div>

))}

</div>

)}

<button
onClick={cancelRide}
className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold"
>

Cancel Ride

</button>

</div>

</div>

</>

)}

</div>

);
}