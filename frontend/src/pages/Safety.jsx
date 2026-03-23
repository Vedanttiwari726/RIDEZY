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

alert("🚨 Emergency Alert Sent");

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

alert("📍 Live ride link copied");

};

/* ================= UI ================= */

return(

<div className="fixed inset-0 z-[9999] text-white">

{/* BACKGROUND */}
<div className="absolute inset-0 bg-black/80 backdrop-blur-md"/>

{/* FLOATING CARD */}
<div className="
absolute bottom-0 left-0 right-0
bg-gradient-to-br from-gray-900 via-black to-gray-800
rounded-t-3xl
p-6
space-y-5
border border-white/10
">

{/* HEADER */}
<div className="flex justify-between items-center">

<h2 className="text-xl font-semibold tracking-wide">
Safety Toolkit
</h2>

<button onClick={()=>navigate(-1)}>
<i className="ri-close-line text-2xl text-gray-400"/>
</button>

</div>

{/* 🔥 SOS BUTTON (highlighted) */}
<button
onClick={triggerSOS}
className="
w-full
bg-red-600 hover:bg-red-700
text-white
py-4
rounded-2xl
font-semibold
flex items-center justify-center gap-2
shadow-lg shadow-red-500/20
transition
"
>
<i className="ri-alarm-warning-line text-lg"/>
Emergency SOS
</button>

{/* 🔥 OPTIONS */}

<Option
icon="ri-share-forward-line"
label="Share Live Ride"
onClick={shareRide}
/>

<Option
icon="ri-flag-line"
label="Report Driver"
/>

<Option
icon="ri-phone-line"
label="Call Support"
/>

</div>

</div>

);

}

/* 🔥 OPTION COMPONENT */
const Option = ({ icon, label, onClick }) => (
<div
onClick={onClick}
className="
bg-white/5 backdrop-blur-xl
border border-white/10
p-4
rounded-xl
flex justify-between items-center
cursor-pointer
hover:bg-white/10
transition
"
>
<div className="flex items-center gap-3">
<i className={`${icon} text-lg text-gray-300`}/>
<span className="font-medium">{label}</span>
</div>

<i className="ri-arrow-right-s-line text-gray-500 text-xl"/>

</div>
);