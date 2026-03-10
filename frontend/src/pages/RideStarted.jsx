import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import LiveTracking from "../components/LiveTracking";

export default function RideStarted(){

const { socket } = useContext(SocketContext);
const location = useLocation();
const navigate = useNavigate();

const { pickup, destination, driver, rideId } = location.state || {};

const [driverLocation,setDriverLocation] = useState(driver?.location);

const [eta,setEta] = useState("--");
const [distance,setDistance] = useState("--");

const [progress,setProgress] = useState(0);
const [navText,setNavText] = useState("Calculating route...");


/* ================= SOCKET EVENTS ================= */

useEffect(()=>{

if(!socket) return;

const handleDriverLocation = (loc)=>{
setDriverLocation(loc);
};

const handleRideEnd = (data)=>{

if(String(data?.rideId) !== String(rideId)) return;

localStorage.removeItem("rideStarted");

alert("Ride Completed");

navigate("/home");

};

socket.on("driver-location",handleDriverLocation);
socket.on("ride-ended",handleRideEnd);

return()=>{
socket.off("driver-location",handleDriverLocation);
socket.off("ride-ended",handleRideEnd);
};

},[socket,rideId,navigate]);


/* ================= ETA + DISTANCE ================= */

useEffect(()=>{

if(!driverLocation || !destination) return;

const R = 6371;

const dLat = (destination.lat-driverLocation.lat) * Math.PI/180;
const dLng = (destination.lng-driverLocation.lng) * Math.PI/180;

const a =
Math.sin(dLat/2)*Math.sin(dLat/2) +
Math.cos(driverLocation.lat*Math.PI/180) *
Math.cos(destination.lat*Math.PI/180) *
Math.sin(dLng/2)*Math.sin(dLng/2);

const c = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

const dist = R * c;

setDistance(dist.toFixed(2));

const time = (dist/35)*60;

setEta(Math.round(time));

/* NAV TEXT */

if(dist > 1){
setNavText("Continue straight");
}
else if(dist > 0.3){
setNavText("Almost there");
}
else{
setNavText("Destination nearby");
}

},[driverLocation,destination]);



/* ================= RIDE PROGRESS ================= */

useEffect(()=>{

if(!driverLocation || !pickup || !destination) return;

const totalDist =
Math.sqrt(
Math.pow(destination.lat-pickup.lat,2) +
Math.pow(destination.lng-pickup.lng,2)
);

const coveredDist =
Math.sqrt(
Math.pow(driverLocation.lat-pickup.lat,2) +
Math.pow(driverLocation.lng-pickup.lng,2)
);

const percent = Math.min((coveredDist/totalDist)*100,100);

setProgress(percent);

},[driverLocation,pickup,destination]);



return(

<div className="fixed inset-0">

{/* ================= MAP ================= */}

<div className="absolute inset-0 z-0">

<LiveTracking
pickup={pickup}
destination={destination}
driverLocation={driverLocation}
/>

</div>



{/* ================= NAVIGATION CARD ================= */}

<div className="absolute top-20 left-4 right-4 z-50">

<div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center">

<div>

<p className="text-xs text-gray-500">
Next step
</p>

<p className="font-semibold text-gray-800">
{navText}
</p>

</div>

<div className="text-right">

<p className="text-green-600 font-semibold">
{eta} min
</p>

<p className="text-xs text-gray-500">
{distance} km left
</p>

</div>

</div>

</div>



{/* ================= FLOATING RIDE CARD ================= */}

<div className="absolute bottom-5 left-0 w-full px-4 z-50">

<div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-5 space-y-4 border border-gray-100">

{/* DRIVER */}

<div className="flex items-center justify-between">

<div className="flex items-center gap-3">

<img
src="https://cdn-icons-png.flaticon.com/512/9131/9131529.png"
className="w-12 h-12 rounded-full"
/>

<div>

<h2 className="text-lg font-semibold text-gray-900">
{driver?.fullname?.firstname || "Driver"}
</h2>

<p className="text-xs text-gray-500">
{driver?.vehicle?.vehicleType || "Vehicle"}
</p>

</div>

</div>

<div className="text-right">

<div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
ETA {eta} min
</div>

<p className="text-xs text-gray-400 mt-1">
{distance} km
</p>

</div>

</div>



{/* ================= RIDE PROGRESS ================= */}

<div>

<p className="text-xs text-gray-400 mb-1">
Ride Progress
</p>

<div className="w-full h-2 bg-gray-200 rounded-full">

<div
className="h-2 bg-green-500 rounded-full transition-all duration-500"
style={{width:`${progress}%`}}
></div>

</div>

</div>



{/* ROUTE DETAILS */}

<div className="border-t border-gray-100 pt-4 space-y-3">

<div className="flex items-start gap-3">

<div className="w-3 h-3 mt-1 bg-green-500 rounded-full"/>

<div>

<p className="text-xs text-gray-400">Pickup</p>

<p className="text-sm font-medium text-gray-800">
{pickup?.address || "Pickup Location"}
</p>

</div>

</div>

<div className="flex items-start gap-3">

<div className="w-3 h-3 mt-1 bg-red-500 rounded-full"/>

<div>

<p className="text-xs text-gray-400">Drop</p>

<p className="text-sm font-medium text-gray-800">
{destination?.address || "Drop Location"}
</p>

</div>

</div>

</div>



<div className="border-t border-gray-100 pt-3">

<p className="text-center text-sm text-gray-600">
🚗 Ride in progress
</p>

</div>

</div>

</div>

</div>

);
}