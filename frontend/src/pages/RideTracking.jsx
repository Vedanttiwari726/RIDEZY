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

<div className="h-screen w-screen relative">

{/* LIVE MAP */}

<LiveTracking
pickup={pickup}
destination={destination}
driverLocation={driverLocation}
/>

{/* BOTTOM PANEL */}

<div className="
absolute bottom-0
w-full bg-white
rounded-t-3xl
p-6 space-y-4
shadow-xl">

<h2 className="font-semibold text-lg">
Driver Arriving
</h2>

{/* ETA */}

<div className="
bg-black text-white
p-3 rounded-xl text-center">

Arriving in {eta || "5"} mins

</div>

{/* LOCATIONS */}

<div className="space-y-3">

<div className="flex gap-3">
<i className="ri-radio-button-line"/>
<p>{pickup?.address || pickup}</p>
</div>

<div className="flex gap-3">
<i className="ri-map-pin-line"/>
<p>{destination?.address || destination}</p>
</div>

</div>

</div>

</div>

);
}