import React, { useEffect, useState, useContext } from "react";
import LiveTracking from "../components/LiveTracking";
import { SocketContext } from "../context/SocketContext";

export default function RideTracking({
pickup,
destination,
eta
}){

const { socket } = useContext(SocketContext);

const [driverLocation,setDriverLocation] = useState(null);

/* =========================
   DRIVER LOCATION SOCKET
========================= */

useEffect(()=>{

if(!socket) return;

const handler = (data)=>{

if(!data?.location) return;

setDriverLocation({
lat:data.location.lat,
lng:data.location.lng
});

};

socket.on("driver-location-update",handler);

return ()=>{
socket.off("driver-location-update",handler);
};

},[socket]);


/* =========================
   UI
========================= */

return(

<div className="h-screen w-screen relative bg-black text-white">

{/* LIVE MAP */}

<LiveTracking
pickup={pickup}
destination={destination}
driverLocation={driverLocation}
/>

{/* TOP STATUS BAR */}

<div className="absolute top-6 left-1/2 -translate-x-1/2
backdrop-blur-md bg-white/10 border border-white/10
px-6 py-3 rounded-full text-sm shadow-lg">

🚗 Driver on the way

</div>


{/* BOTTOM PANEL */}

<div className="
absolute bottom-0
w-full
bg-[#020617]/95
backdrop-blur-xl
border-t border-white/10
rounded-t-3xl
p-6 space-y-6
shadow-2xl
">

<h2 className="font-semibold text-xl tracking-wide">
Driver Arriving
</h2>


{/* ETA CARD */}

<div className="
bg-gradient-to-r
from-green-500
to-emerald-600
p-4
rounded-2xl
text-center
shadow-lg
">

<p className="text-sm opacity-90">
Estimated Arrival
</p>

<p className="text-2xl font-bold">
{eta || "5"} mins
</p>

</div>


{/* LOCATION INFO */}

<div className="space-y-4">

<div className="flex items-start gap-4">

<div className="
w-10 h-10
rounded-full
bg-green-500/20
flex items-center justify-center
">

<i className="ri-radio-button-line text-green-400"/>

</div>

<p className="text-sm text-gray-300">
{pickup?.address || pickup}
</p>

</div>


<div className="flex items-start gap-4">

<div className="
w-10 h-10
rounded-full
bg-blue-500/20
flex items-center justify-center
">

<i className="ri-map-pin-line text-blue-400"/>

</div>

<p className="text-sm text-gray-300">
{destination?.address || destination}
</p>

</div>

</div>


{/* ACTION BUTTONS */}

<div className="flex gap-4 pt-2">

<button className="
flex-1
bg-white/10
border border-white/10
rounded-xl
py-3
text-sm
">

Call Driver

</button>


<button className="
flex-1
bg-red-500
rounded-xl
py-3
text-sm
font-semibold
">

Cancel Ride

</button>

</div>

</div>

</div>

);
}