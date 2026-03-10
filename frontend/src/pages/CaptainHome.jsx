import React, { useContext, useEffect, useState, useRef } from "react";
import { CaptainDataContext } from "../context/CaptainContext";
import { SocketContext } from "../context/SocketContext";
import { useAppSettings } from "../context/AppSettingContext";
import { translations } from "../utils/translations";

import LiveTracking from "../components/LiveTracking";
import DriverMap from "../components/DriverMap";

import api from "../services/api";

import { Home, Wallet, User, ClipboardList } from "lucide-react";

import RideRequestCard from "../components/RideRequestCard";
import EarningsTab from "../components/EarningsTab";
import Trips from "../pages/Trips";
import Profile from "../pages/CaptainProfile";

const CaptainHome = () => {

const { captain } = useContext(CaptainDataContext);
const { socket } = useContext(SocketContext);

const { language } = useAppSettings();
const t = translations[language] || translations.english;

const [activeTab,setActiveTab]=useState("home");

const [isOnline,setIsOnline]=useState(
localStorage.getItem("driverOnline")==="true"
);

const [rideRequest,setRideRequest]=useState(null);
const [rideStage,setRideStage]=useState("idle");
const [otp,setOtp]=useState("");
const [timer,setTimer]=useState(0);

const [heatZones,setHeatZones]=useState([]);

const locationInterval=useRef(null);
const timerRef=useRef(null);
const audioRef=useRef(null);

const token =
localStorage.getItem("captainToken") ||
localStorage.getItem("token");

if(!captain){
return(
<div className="flex items-center justify-center h-screen">
Loading driver panel...
</div>
);
}

/* ================= RESTORE RIDE AFTER REFRESH ================= */

useEffect(()=>{

const savedRide = localStorage.getItem("activeRide");

if(savedRide){

const ride = JSON.parse(savedRide);

setRideRequest(ride);
setRideStage("ongoing");

}

},[]);

/* ================= SOCKET ================= */

useEffect(()=>{

if(!socket || !captain?._id) return;

const registerDriver=()=>{

socket.emit("join",{
userId:captain._id,
userType:"captain"
});

if(localStorage.getItem("driverOnline")==="true"){
socket.emit("captain-online",{captainId:captain._id});
setIsOnline(true);
}

};

if(socket.connected) registerDriver();

socket.on("connect",registerDriver);

return()=>socket.off("connect",registerDriver);

},[socket,captain]);

/* ================= DEMAND HEATMAP ================= */

useEffect(()=>{

if(!socket) return;

const demandHandler=(zones)=>{
setHeatZones(zones);
};

socket.on("demand-zones",demandHandler);

return()=>socket.off("demand-zones",demandHandler);

},[socket]);

/* ================= NEW RIDE ================= */

useEffect(()=>{

if(!socket) return;

const handler=(ride)=>{

if(!ride) return;

setRideRequest(ride);
setRideStage("idle");
setTimer(ride.expiresIn || 15);

audioRef.current?.play().catch(()=>{});

clearInterval(timerRef.current);

timerRef.current=setInterval(()=>{

setTimer(t=>{

if(t<=1){
clearInterval(timerRef.current);
setRideRequest(null);
return 0;
}

return t-1;

});

},1000);

};

socket.on("new-ride",handler);

return()=>socket.off("new-ride",handler);

},[socket]);

/* ================= LOCATION ================= */

const startLocationUpdates=()=>{

if(locationInterval.current || !navigator.geolocation) return;

locationInterval.current=setInterval(()=>{

navigator.geolocation.getCurrentPosition(

pos=>{

socket?.emit("update-location-captain",{
captainId:captain._id,
rideId:rideRequest?._id,
location:{
lat:pos.coords.latitude,
lng:pos.coords.longitude
}
});

},

err=>console.log("GPS ERROR:",err)

);

},3000);

};

const stopLocationUpdates=()=>{
clearInterval(locationInterval.current);
locationInterval.current=null;
};

/* ================= ONLINE ================= */

const toggleOnline=async()=>{

const newStatus=!isOnline;

await api.patch(
"/captains/online-status",
{isOnline:newStatus},
{headers:{Authorization:`Bearer ${token}`}}
);

setIsOnline(newStatus);

localStorage.setItem("driverOnline",newStatus);

socket.emit(
newStatus?"captain-online":"captain-offline",
{captainId:captain._id}
);

};

/* ================= RIDE FLOW ================= */

const acceptRide=()=>{

if(!rideRequest || !rideRequest._id) return;

clearInterval(timerRef.current);

socket.emit("ride-accepted",{
rideId:rideRequest._id,
captainId:captain._id
});

setRideStage("accepted");

startLocationUpdates();

};

const rejectRide=()=>{

clearInterval(timerRef.current);

socket.emit("ride-rejected",{rideId:rideRequest?._id});

setRideRequest(null);

};

const markArrived=()=>{

socket.emit("driver-arrived",{rideId:rideRequest?._id});

setRideStage("otp");

};

const verifyOTP=async()=>{

try{

if(!rideRequest || !rideRequest._id) return;

await api.get(
"/rides/start",
{
params:{rideId:rideRequest._id,otp:otp.trim()},
headers:{Authorization:`Bearer ${token}`}
}
);

socket.emit("ride-started",{rideId:rideRequest._id});

setRideStage("ongoing");

/* SAVE ACTIVE RIDE */

localStorage.setItem(
"activeRide",
JSON.stringify({
_id: rideRequest._id,
pickup: rideRequest.pickup,
destination: rideRequest.destination,
pickupLat: rideRequest.pickupLat,
pickupLng: rideRequest.pickupLng,
destinationLat: rideRequest.destinationLat,
destinationLng: rideRequest.destinationLng
})
);

setOtp("");

}catch(err){

alert(
err?.response?.data?.message ||
"Invalid OTP"
);

}

};

const endRide = async () => {

try{

if(!rideRequest?._id) return;

await api.post("/rides/end",{rideId:rideRequest._id});

socket.emit("ride-ended",{rideId:rideRequest._id});

setRideRequest(null);
setRideStage("idle");

localStorage.removeItem("activeRide");

stopLocationUpdates();

}catch(err){
console.log("End ride error:",err);
}

};

useEffect(()=>()=>stopLocationUpdates(),[]);

/* ================= COORDINATES ================= */

const pickupLat = rideRequest?.pickupLat || rideRequest?.pickup?.lat;
const pickupLng = rideRequest?.pickupLng || rideRequest?.pickup?.lng;
const destinationLat = rideRequest?.destinationLat || rideRequest?.destination?.lat;
const destinationLng = rideRequest?.destinationLng || rideRequest?.destination?.lng;

const hasCoordinates =
pickupLat && pickupLng && destinationLat && destinationLng;

/* ================= UI ================= */

return(

<div className="h-screen w-screen relative overflow-hidden
bg-gray-100 dark:bg-black text-gray-900 dark:text-white">

<audio ref={audioRef}
src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
/>

{/* HEADER */}

<div className="fixed top-0 left-0 right-0 z-50
bg-white dark:bg-neutral-900
px-6 py-4 flex justify-between items-center
border-b shadow-sm">

<h1 className="font-semibold">
{t.driverPanel}
</h1>

<button
onClick={toggleOnline}
className={`px-4 py-1 rounded-full text-white ${
isOnline?"bg-green-500":"bg-gray-400"
}`}>
{isOnline?t.online:t.offline}
</button>

</div>

{/* MAP AREA */}

{activeTab==="home"&&(
<div className="fixed inset-x-0 top-16 bottom-24 z-0">

{(rideStage==="accepted" || rideStage==="otp" || rideStage==="ongoing") && hasCoordinates ? (

<DriverMap
pickupLat={pickupLat}
pickupLng={pickupLng}
destinationLat={destinationLat}
destinationLng={destinationLng}
phase={rideStage==="ongoing" ? "destination" : "pickup"}
/>

):( 

<LiveTracking
pickup={rideRequest?.pickup}
destination={rideRequest?.destination}
heatZones={heatZones}
/>

)}

</div>
)}

{/* RIDE REQUEST */}

{rideRequest && rideStage==="idle" && (
<RideRequestCard
ride={{...rideRequest,captain: captain?._id}}
timer={timer}
onAccept={acceptRide}
onReject={rejectRide}
/>
)}

{/* ACTIVE RIDE PANEL */}

{rideStage!=="idle"&&(
<div className="fixed bottom-28 inset-x-0 z-40
bg-white dark:bg-neutral-900
rounded-t-3xl p-6 shadow-2xl">

{rideStage==="accepted"&&(
<button
onClick={markArrived}
className="w-full bg-yellow-500 py-3 rounded-xl text-white">
{t.arrivedPickup}
</button>
)}

{rideStage==="otp"&&(
<>
<p className="text-center mb-2">
{t.enterOtp}
</p>

<input
value={otp}
maxLength={6}
onChange={e=>setOtp(e.target.value)}
className="w-full border p-4 text-center text-2xl rounded-xl mb-4"
/>

<button
onClick={verifyOTP}
className="w-full bg-green-600 py-3 text-white rounded-xl">
{t.startRide}
</button>
</>
)}

{rideStage==="ongoing"&&(
<>
<div className="bg-gray-100 p-4 rounded-xl mb-4 space-y-3">

<div className="flex gap-3 items-start">
<i className="ri-map-pin-2-fill text-green-600 text-lg"></i>
<p className="text-sm">
{rideRequest?.pickup?.address || rideRequest?.pickup}
</p>
</div>

<div className="flex gap-3 items-start">
<i className="ri-flag-fill text-red-500 text-lg"></i>
<p className="text-sm">
{rideRequest?.destination?.address || rideRequest?.destination}
</p>
</div>

</div>

<button
onClick={endRide}
className="w-full bg-red-600 py-3 text-white rounded-xl">
{t.endRide}
</button>
</>
)}

</div>
)}

{/* BOTTOM TABS */}

<div className="fixed bottom-0 left-0 right-0 z-50
bg-white dark:bg-neutral-900
border-t flex justify-around py-3">

<button onClick={()=>setActiveTab("home")}><Home/></button>
<button onClick={()=>setActiveTab("earnings")}><Wallet/></button>
<button onClick={()=>setActiveTab("trips")}><ClipboardList/></button>
<button onClick={()=>setActiveTab("profile")}><User/></button>

</div>

</div>
);
};

export default CaptainHome;