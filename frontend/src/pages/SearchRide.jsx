import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "remixicon/fonts/remixicon.css";

export default function SearchRide(){

const navigate = useNavigate();

const [pickup,setPickup]=useState("");
const [destination,setDestination]=useState("");

const [pickupCoords,setPickupCoords]=useState(null);
const [destinationCoords,setDestinationCoords]=useState(null);

const [suggestions,setSuggestions]=useState([]);
const [activeField,setActiveField]=useState("destination");

const debounceRef = useRef(null);

/* ================= FETCH ================= */

const fetchSuggestions = async(value)=>{

if(!value || value.length < 3){
setSuggestions([]);
return;
}

try{

const res = await api.get(
"/maps/get-suggestions",
{ params:{ input:value }}
);

const list =
Array.isArray(res.data)
? res.data
: res.data?.predictions || [];

setSuggestions(list);

}catch(err){
console.log(err);
}
};

/* ================= INPUT ================= */

const handleChange=(value,type)=>{

if(type==="pickup"){
setPickup(value);
}else{
setDestination(value);
}

setActiveField(type);

clearTimeout(debounceRef.current);

debounceRef.current=setTimeout(()=>{
fetchSuggestions(value);
},400);
};

/* ================= SELECT LOCATION ================= */

const selectLocation=(item)=>{

const text = getText(item);

const lat =
item?.lat ||
item?.geometry?.location?.lat ||
item?.latitude ||
null;

const lng =
item?.lng ||
item?.geometry?.location?.lng ||
item?.longitude ||
null;

if(activeField==="pickup"){
setPickup(text);
setPickupCoords({lat,lng});
}else{
setDestination(text);
setDestinationCoords({lat,lng});
}

setSuggestions([]);
};

/* ================= CONFIRM ================= */

const goBackHome = () => {

if(!pickup || !destination) return;

navigate("/choose-vehicle",{
replace:true,
state:{
pickup:{
address:pickup,
lat:pickupCoords?.lat,
lng:pickupCoords?.lng
},
destination:{
address:destination,
lat:destinationCoords?.lat,
lng:destinationCoords?.lng
},
openVehicle:true,
vehicleTrigger:Date.now()
}
});

};

/* ================= TEXT SAFE ================= */

const getText=(item)=>{

if(typeof item==="string") return item;

return(
item?.description ||
item?.place_name ||
item?.display_name ||
""
);
};

/* ================= UI ================= */

return(
<div className="fixed inset-0 bg-[#020617] text-white z-[9999] flex flex-col">

{/* HEADER */}
<div className="p-5 border-b border-white/10 flex items-center gap-4">

<button onClick={()=>navigate(-1)}>
<i className="ri-arrow-left-line text-2xl"/>
</button>

<h2 className="text-xl font-semibold">
Plan your trip
</h2>

</div>

{/* SEARCH BOXES */}
<div className="p-5 space-y-4">

<div className="flex items-center bg-white/5 border-2 border-white/40 backdrop-blur-md p-4 rounded-2xl">

<i className="ri-radio-button-line mr-3 text-lg"/>

<input
value={pickup}
onChange={(e)=>handleChange(e.target.value,"pickup")}
placeholder="Pickup location"
className="bg-transparent outline-none w-full text-white"
/>

</div>

<div className="flex items-center bg-white/5 border-2 border-white/40 backdrop-blur-md p-4 rounded-2xl">

<i className="ri-map-pin-line mr-3 text-lg"/>

<input
value={destination}
onChange={(e)=>handleChange(e.target.value,"destination")}
placeholder="Where to?"
autoFocus
className="bg-transparent outline-none w-full text-white"
/>

</div>

</div>

<div className="flex-1 overflow-y-auto px-5 space-y-3">

{suggestions.map((item,i)=>{

const text=getText(item);

return(
<div
key={i}
onClick={()=>selectLocation(item)}
className="flex gap-4 p-4 bg-white/5 border-2 border-white/40 rounded-xl cursor-pointer"
>

<div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">

<i className="ri-map-pin-line"/>

</div>

<div>
<p className="font-medium text-white">
{text.split(",")[0]}
</p>

<p className="text-sm text-gray-400">
{text}
</p>
</div>

</div>
);
})}

</div>

{pickup && destination && (

<div className="p-5">

<button
onClick={goBackHome}
className="w-full bg-green-500 py-4 rounded-2xl font-semibold text-lg"
>

Confirm Locations

</button>

</div>

)}

</div>
);
}