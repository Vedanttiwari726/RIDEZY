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
console.log("Captain data:", captain);
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
const [userLiveLocation, setUserLiveLocation] = useState(null);

const locationInterval=useRef(null);
const timerRef=useRef(null);
const audioRef=useRef(null);

const token =
localStorage.getItem("captainToken") ||
localStorage.getItem("token");

if(!captain){
return(
<div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
Loading driver panel...
</div>
);
}

const handleOtpChange = (value, index) => {

  if (!/^[0-9]?$/.test(value)) return;

  let otpArray = otp.padEnd(4, " ").split("");

  otpArray[index] = value;

  const finalOtp = otpArray.join("").trim();

  setOtp(finalOtp);

};

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
userId:captain?._id,
userType:"captain"
});

if(localStorage.getItem("driverOnline")==="true"){
socket.emit("captain-online",{captainId:captain?._id});
setIsOnline(true);
}

};

if(socket.connected) registerDriver();

socket.on("connect",registerDriver);

return()=>socket.off("connect",registerDriver);

},[socket,captain]);


/* 🔥 DEBUG FORCE JOIN (ADD EXACTLY HERE) */

useEffect(() => {

  if (!socket) return;

  const captainData = localStorage.getItem("captain");

  if (!captainData) {
    console.log("❌ captain not in localStorage");
    return;
  }

  const parsed = JSON.parse(captainData);

  console.log("🔥 TRY JOIN WITH:", parsed.captain?._id);

  socket.emit("join", {
    userId: parsed.captain?._id,
    userType: "captain"
  });

}, [socket]);

useEffect(()=>{

if(!socket) return;

const handler = (data)=>{
  if(!data?.lat || !data?.lng) return;

  setUserLiveLocation({
    lat: data.lat,
    lng: data.lng
  });
};

socket.on("update-user-location", handler);

return ()=>socket.off("update-user-location", handler);

},[socket]);

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

// 🔥 ADD THIS LINE
localStorage.setItem("currentRideId", rideRequest._id);

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

/* 🔥 RIDE FLOW SOCKET EVENTS (ADD THIS) */

useEffect(()=>{

if(!socket) return;

/* DRIVER ARRIVED */
socket.on("driver-arrived", ()=>{
  console.log("Driver arrived event");
  setRideStage("otp");
});

/* RIDE STARTED */
socket.on("ride-started", ()=>{
  console.log("Ride started event");
  setRideStage("ongoing");
});

/* RIDE ENDED */
socket.on("ride-ended", ()=>{
  console.log("Ride ended event");
  setRideRequest(null);
  setRideStage("idle");
});

return ()=>{
  socket.off("driver-arrived");
  socket.off("ride-started");
  socket.off("ride-ended");
};

},[socket]);

/* ================= LOCATION ================= */

const startLocationUpdates=()=>{

if(locationInterval.current || !navigator.geolocation) return;

locationInterval.current=setInterval(()=>{

navigator.geolocation.getCurrentPosition(

pos=>{

socket?.emit("update-location-captain",{
captainId:captain?._id,
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
{captainId:captain?._id}
);

};


/* ================= RIDE FLOW ================= */

const acceptRide=()=>{

if(!rideRequest || !rideRequest._id) return;
localStorage.setItem("currentRideId", rideRequest._id);

clearInterval(timerRef.current);

socket.emit("ride-accepted",{
rideId:rideRequest._id,
captainId:captain?._id
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

const verifyOTP = async () => {

  console.log("🚀 VERIFY OTP CLICKED");

   const cleanOtp = otp.trim();

  if (!otp || otp.length !== 4) {
    return alert("Enter valid 4 digit OTP");
  }

  try {

    // 🔥 FINAL FIX: always latest ride use karo
    const rideId = rideRequest?._id;

    console.log("📦 SENDING:", {
      rideId,
      otp
    });

    if (!rideId) {
      return alert("Ride not found");
    }

    await api.get(`/rides/start?rideId=${rideId}&otp=${otp}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("✅ RIDE STARTED");

    setRideStage("ongoing");
    setOtp("");

  } catch (err) {

    console.log("❌ ERROR:", err.response?.data);

    alert(
      err?.response?.data?.message ||
      "Invalid OTP"
    );

  }

};


const endRide = async () => {

try{

if(!rideRequest?._id) return;
localStorage.removeItem("currentRideId");

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
pickupLat != null &&
pickupLng != null &&
destinationLat != null &&
destinationLng != null;

/* ================= UI ================= */

return(

<div className="h-screen w-screen relative overflow-hidden
bg-gray-100 dark:bg-gradient-to-br dark:from-black dark:via-neutral-900 dark:to-black
text-gray-900 dark:text-white">

 <div className="absolute top-0 left-0 w-full h-full z-0">
    <LiveTracking />
  </div>
   
   <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">

  <div className="flex items-center gap-8 px-6 py-3
  rounded-full
  backdrop-blur-2xl
  bg-black/30
  border border-white/20
  shadow-[0_8px_30px_rgba(0,0,0,0.6)]">

    <button onClick={()=>setActiveTab("home")}>
      <Home size={26}
        className={`transition duration-300 
        ${activeTab==="home"
          ? "text-white scale-125 drop-shadow-[0_0_15px_white]"
          : "text-white/70"}`} />
    </button>

    <button onClick={()=>setActiveTab("trips")}>
      <ClipboardList size={26}
        className={`transition duration-300 
        ${activeTab==="trips"
          ? "text-white scale-125 drop-shadow-[0_0_15px_white]"
          : "text-white/70"}`} />
    </button>

    <button onClick={()=>setActiveTab("earnings")}>
      <Wallet size={26}
        className={`transition duration-300 
        ${activeTab==="earnings"
          ? "text-white scale-125 drop-shadow-[0_0_15px_white]"
          : "text-white/70"}`} />
    </button>

    <button onClick={()=>setActiveTab("profile")}>
      <User size={26}
        className={`transition duration-300 
        ${activeTab==="profile"
          ? "text-white scale-125 drop-shadow-[0_0_15px_white]"
          : "text-white/70"}`} />
    </button>

  </div>

</div>

<audio ref={audioRef}
src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
/>

{/* HEADER */}

<div className="fixed top-0 left-0 right-0 z-50
bg-white/80 dark:bg-white/80 dark:bg-black/70 backdrop-blur-xl
px-6 py-4 flex justify-between items-center
border-b border-gray-200 dark:border-white/10">

<h1 className="font-semibold text-lg tracking-wide">    
{t.driverPanel}
</h1>

<button
onClick={toggleOnline}
className={`px-4 py-1.5 rounded-full text-white text-sm transition-all ${
isOnline
?"bg-blue-600 shadow-lg shadow-blue-500/30"
:"bg-gray-600"
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
  userLiveLocation={userLiveLocation}
/>

)}

</div>
)}

{rideRequest && rideStage === "idle" && (
  <RideRequestCard
    ride={rideRequest}
    onAccept={acceptRide}
    onReject={rejectRide}
    timer={timer}
  />
)}
{/* 🔥 DRIVER ACTION UI */}

{rideStage === "accepted" && (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
    <button
      onClick={markArrived}
      className="w-full bg-blue-500 hover:bg-blue-400 text-black font-semibold py-3 rounded-xl shadow-lg transition"
    >
      Arrived at Pickup
    </button>
  </div>
)}

{rideStage === "otp" && (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 space-y-3">

   <div className="flex justify-center gap-3">

  {[0,1,2,3].map((index) => (
    <input
      key={index}
      type="text"
      maxLength={1}
      value={otp[index] || ""}
      onChange={(e) => {
  handleOtpChange(e.target.value, index);

  // auto focus next
  if (e.target.value && e.target.nextSibling) {
    e.target.nextSibling.focus();
  }
}}
      onKeyDown={(e)=>{
        if(e.key === "Backspace" && !otp[index] && e.target.previousSibling){
          e.target.previousSibling.focus();
        }
      }}
      className="w-12 h-12 text-center text-xl rounded-xl bg-black/70 border border-white/20 text-white outline-none"
    />
  ))}

</div>

    <button
      onClick={verifyOTP}   
      disabled={verifyOTP.loading}
      className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl shadow-lg transition"
    >
      Start Ride
    </button>

  </div>
)}

{rideStage === "ongoing" && (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
    <button
      onClick={endRide}
      className="w-full bg-red-500 hover:bg-red-400 text-black font-semibold py-3 rounded-xl shadow-lg transition"
    >
      End Ride
    </button>
  </div>
)}

{/* EARNINGS TAB */}

{activeTab==="earnings" && (

<div className="absolute inset-x-0 top-16 bottom-24 z-10 overflow-y-auto
bg-gray-100 dark:bg-gradient-to-b dark:from-black dark:via-neutral-900 dark:to-black
p-4 space-y-4">

<div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10
rounded-2xl p-5 shadow-xl">

<p className="text-gray-400 text-sm">Today's Earnings</p>
<h2 className="text-3xl font-bold text-green-400 mt-1">₹0</h2>

</div>

<div className="bg-white/5 backdrop-blur-xl border border-white/10
rounded-2xl p-4 shadow-xl">

<EarningsTab />

</div>

</div>

)}

{activeTab==="trips" && (

<div className="absolute inset-x-0 top-16 bottom-24 z-10 overflow-y-auto
bg-gray-100 dark:bg-gradient-to-b dark:from-black dark:via-neutral-900 dark:to-black p-4 space-y-4">

{/* HEADER CARD */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10
rounded-2xl p-5 shadow-lg">

<div className="flex justify-between items-center">

<div>
<h2 className="text-lg font-semibold text-white">
Trip History
</h2>

<p className="text-xs text-gray-400">
Your completed rides
</p>
</div>

<div className="text-blue-400 text-sm font-medium">
Driver Logs
</div>

</div>

</div>

{/* TRIPS LIST AREA */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10
rounded-2xl p-4 shadow-lg">

<div className="text-sm text-gray-400 mb-3">
Recent Trips
</div>

<div className="space-y-4">

<Trips />

</div>

</div>

</div>

)}

{/* PROFILE TAB */}

{activeTab==="profile" && (

<div className="absolute inset-x-0 top-16 bottom-24 z-10 overflow-y-auto
 p-4 space-y-4">

{/* HEADER */}

<div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10
rounded-2xl p-5 shadow-lg">

<h2 className="text-lg font-semibold text-white">
Driver Profile
</h2>

<p className="text-xs text-gray-400 mt-1">
Manage your account and driver details
</p>

</div>


{/* PROFILE COMPONENT */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10
rounded-2xl p-4 shadow-lg">

<Profile />

</div>

</div>

)}

{/* BOTTOM NAV */}

<div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-50
bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-gray-200 dark:border-white/10
rounded-2xl flex justify-between px-6 py-3 shadow-2xl">

<button onClick={()=>setActiveTab("home")}
className={`flex flex-col items-center gap-1 transition ${
activeTab==="home" ? "text-blue-400 scale-105" : "text-gray-400"
}`}>
<Home size={22}/>
<span className="text-xs">Home</span>
</button>

<button onClick={()=>setActiveTab("earnings")}
className={`flex flex-col items-center gap-1 transition ${
activeTab==="earnings" ? "text-blue-400 scale-105" : "text-gray-400"
}`}>
<Wallet size={22}/>
<span className="text-xs">Earnings</span>
</button>

<button onClick={()=>setActiveTab("trips")}
className={`flex flex-col items-center gap-1 transition ${
activeTab==="trips" ? "text-blue-400 scale-105" : "text-gray-400"
}`}>
<ClipboardList size={22}/>
<span className="text-xs">Trips</span>
</button>

<button onClick={()=>setActiveTab("profile")}
className={`flex flex-col items-center gap-1 transition ${
activeTab==="profile" ? "text-blue-400 scale-105" : "text-gray-400"
}`}>
<User size={22}/>
<span className="text-xs">Profile</span>
</button>

</div>

</div>
);

};

export default CaptainHome;