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

const pickup = rideData.pickup || null;
const destination = rideData.destination || null;
const otp = rideData.otp || "";
const rideId = rideData.rideId || null;

const [rideStarted,setRideStarted] = useState(false);
const [driver,setDriver] = useState(null);

/* ⭐ NEW: DRIVER BIDS */
const [bids,setBids] = useState([]);


/* ================= JOIN RIDE ROOM ================= */

useEffect(()=>{

if(socket && rideId){

console.log("Joining ride room:",rideId)

socket.emit("join-ride-room",{ rideId })

}

},[socket,rideId])


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

console.log("FindingDriver socket ready");


/* DRIVER ACCEPTED */

const handleAccepted = (data)=>{

console.log("Driver accepted:",data);

if(data?.captain){
setDriver(data.captain);
}

};


/* DRIVER ARRIVED */

const handleArrived = (data)=>{

console.log("Driver arrived:",data);

};


/* ⭐ RECEIVE BIDS */

const handleBidUpdate = (bidList)=>{

console.log("Driver bids:",bidList);

setBids(bidList);

};


/* RIDE STARTED */

const handleStarted = (data)=>{

console.log("Ride started event received:",data);

if(String(data?.rideId) !== String(rideId)) return;

setRideStarted(true);

navigate("/ride-started",{
state:{
pickup,
destination,
driver:data.captain,
rideId:data.rideId
}
});

};


/* DRIVER LOCATION */

const handleDriverLocation = (driverLoc)=>{

setDriver(prev=>({
...(prev || {}),
location:driverLoc
}));

};


/* REGISTER EVENTS */

socket.on("ride-accepted",handleAccepted);
socket.on("driver-arrived",handleArrived);
socket.on("ride-started",handleStarted);
socket.on("driver-location",handleDriverLocation);

/* ⭐ NEW */
socket.on("bid-update",handleBidUpdate);


/* DEBUG LISTENER */

const debugListener = (event,data)=>{
console.log("SOCKET EVENT:",event,data);
};

socket.onAny(debugListener);


/* CLEANUP */

return()=>{

socket.off("ride-accepted",handleAccepted);
socket.off("driver-arrived",handleArrived);
socket.off("ride-started",handleStarted);
socket.off("driver-location",handleDriverLocation);
socket.off("bid-update",handleBidUpdate);
socket.offAny(debugListener);

};

},[socket,rideId,navigate]);


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

{!rideStarted && (

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

{/* OTP */}

<div className="bg-gray-100 rounded-2xl p-4 text-center">

<p className="text-xs text-gray-500">
Share OTP with driver
</p>

<h1 className="text-3xl font-bold tracking-widest">
{otp}
</h1>

</div>


{/* ================= DRIVER BIDS ================= */}

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