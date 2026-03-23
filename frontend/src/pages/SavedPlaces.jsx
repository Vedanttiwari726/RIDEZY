import React, { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import api from "../services/api";
import "remixicon/fonts/remixicon.css";

export default function SavedPlaces(){

const { user } = useContext(UserDataContext);

const [places,setPlaces] = useState([]);
const [showForm,setShowForm] = useState(false);
const [label,setLabel] = useState("");
const [address,setAddress] = useState("");
const [coords,setCoords] = useState(null);

/* ================= FETCH ================= */
useEffect(()=>{
fetchPlaces();
},[]);

const fetchPlaces = async () => {
try{
const res = await api.get("/profile/saved-places");
setPlaces(res.data || []);
}catch(err){
console.log(err);
}
};

/* ================= GET CURRENT LOCATION ================= */

const getCurrentLocation = () => {

navigator.geolocation.getCurrentPosition(async(pos)=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

setCoords({ lat, lng });

try{
const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
);

const data = await res.json();

setAddress(data.display_name);

}catch(err){
console.log("Geocode error:",err);
}

});

};

/* ================= ADD ================= */

const addPlace = async () => {

if(!label || !address || !coords){
alert("Please fill all fields");
return;
}

try{

await api.post("/profile/saved-places",{
label,
address,
lat:coords.lat,
lng:coords.lng
});

setLabel("");
setAddress("");
setCoords(null);
setShowForm(false);

fetchPlaces();

}catch(err){
console.log(err);
}

};

/* ================= DELETE ================= */

const deletePlace = async(id)=>{
try{
await api.delete(`/profile/saved-places/${id}`);
fetchPlaces();
}catch(err){
console.log(err);
}
};

/* ================= UI ================= */

return(
<div className="min-h-screen bg-black text-white p-4">

<h2 className="text-2xl font-semibold mb-6">
Saved Places
</h2>

{/* LIST */}
<div className="space-y-3">

{places.map((place)=>(
<div
key={place._id}
className="
bg-white/5 backdrop-blur-xl
border border-white/10
p-4 rounded-2xl
flex justify-between items-center
"
>

<div>
<p className="font-medium">{place.label}</p>
<p className="text-sm text-gray-400">{place.address}</p>
</div>

<button
onClick={()=>deletePlace(place._id)}
className="text-red-400 hover:text-red-500 transition"
>
<i className="ri-delete-bin-line text-lg"></i>
</button>

</div>
))}

</div>

{/* EMPTY */}
{places.length === 0 && (
<p className="text-gray-500 mt-10 text-center">
No saved places yet
</p>
)}

{/* ADD BUTTON */}
<button
onClick={()=>setShowForm(true)}
className="
fixed bottom-6 right-6
bg-white text-black
w-14 h-14 rounded-full
flex items-center justify-center
shadow-lg
hover:scale-105 transition
"
>
<i className="ri-add-line text-xl"></i>
</button>

{/* FORM */}
{showForm && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">

<div className="
bg-gray-900
border border-white/10
p-6 rounded-2xl
w-[90%] max-w-md
space-y-4
">

<h3 className="text-lg font-semibold">
Add New Place
</h3>

<input
value={label}
onChange={(e)=>setLabel(e.target.value)}
placeholder="Label (Home, Work)"
className="
w-full p-3
bg-white/5
border border-white/10
rounded-xl
outline-none
text-white
placeholder-gray-500
"
/>

<input
value={address}
onChange={(e)=>setAddress(e.target.value)}
placeholder="Full Address"
className="
w-full p-3
bg-white/5
border border-white/10
rounded-xl
outline-none
text-white
placeholder-gray-500
"
/>

{/* 🔥 LOCATION BUTTON */}
<button
onClick={getCurrentLocation}
className="
w-full bg-blue-500 hover:bg-blue-600
py-2 rounded-xl
transition
"
>
Use Current Location
</button>

{/* SHOW COORDS */}
{coords && (
<p className="text-xs text-gray-400">
Lat: {coords.lat} | Lng: {coords.lng}
</p>
)}

<div className="flex justify-end gap-3 pt-2">

<button
onClick={()=>setShowForm(false)}
className="text-gray-400"
>
Cancel
</button>

<button
onClick={addPlace}
className="
bg-white text-black
px-4 py-2 rounded-lg
font-medium
"
>
Save
</button>

</div>

</div>
</div>
)}

</div>
);
}