import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Safety(){

const navigate = useNavigate();
const location = useLocation();

/* rideId Riding page se aayega */
const rideId = location.state?.rideId;

const triggerSOS = async () => {

try{

navigator.geolocation.getCurrentPosition(async(pos)=>{

const { latitude, longitude } = pos.coords;

await api.post("/safety/sos",{
location:{
lat:latitude,
lng:longitude
}
});

alert("Emergency Alert Sent");

});

}catch(err){
console.log(err);
}

};

/* ================= SHARE RIDE ================= */

const shareRide = () => {

if(!rideId){
alert("Ride not found");
return;
}

const link = `${window.location.origin}/track/${rideId}`;

navigator.clipboard.writeText(link);

alert("Live ride link copied");

};

/* ================= UI ================= */

return(

<div className="fixed inset-0 z-[9999]">

{/* BACKGROUND BLUR */}
<div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>

{/* FLOATING CARD */}
<div className="
absolute bottom-0 left-0 right-0
bg-white
rounded-t-3xl
p-6
space-y-5
shadow-2xl
">

{/* HEADER */}
<div className="flex justify-between items-center">

<h2 className="text-xl font-semibold">
Safety Toolkit
</h2>

<button onClick={()=>navigate(-1)}>
<i className="ri-close-line text-2xl"/>
</button>

</div>

{/* SOS BUTTON */}
<button
onClick={triggerSOS}
className="
w-full
bg-red-500
text-white
py-4
rounded-2xl
font-semibold
flex items-center justify-center gap-2
shadow-lg
">
<i className="ri-alarm-warning-line"/>
Emergency SOS
</button>

{/* SHARE RIDE */}
<div
onClick={shareRide}
className="
bg-gray-100
p-4
rounded-xl
flex justify-between items-center
cursor-pointer
">

<div className="flex items-center gap-3">
<i className="ri-share-forward-line text-xl"/>
Share Live Ride
</div>

<i className="ri-arrow-right-s-line text-xl"/>

</div>

{/* REPORT DRIVER */}
<div className="
bg-gray-100
p-4
rounded-xl
flex justify-between items-center
cursor-pointer
">

<div className="flex items-center gap-3">
<i className="ri-flag-line text-xl"/>
Report Driver
</div>

<i className="ri-arrow-right-s-line text-xl"/>

</div>

{/* CALL SUPPORT */}
<div className="
bg-gray-100
p-4
rounded-xl
flex justify-between items-center
cursor-pointer
">

<div className="flex items-center gap-3">
<i className="ri-phone-line text-xl"/>
Call Support
</div>

<i className="ri-arrow-right-s-line text-xl"/>

</div>

</div>

</div>

);

}