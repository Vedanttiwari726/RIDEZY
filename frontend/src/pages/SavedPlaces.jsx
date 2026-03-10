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

/* ================= FETCH SAVED PLACES ================= */

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

/* ================= ADD PLACE ================= */

const addPlace = async () => {

if(!label || !address) return;

try{
await api.post("/profile/saved-places",{
label,
address
});

setLabel("");
setAddress("");
setShowForm(false);

fetchPlaces();

}catch(err){
console.log(err);
}

};

/* ================= DELETE PLACE ================= */

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
<div className="min-h-screen bg-gray-100 p-4">

<h2 className="text-2xl font-bold mb-6">
Saved Places
</h2>

{/* LIST */}
<div className="space-y-3">

{places.map((place)=>(
<div
key={place._id}
className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm"
>

<div>
<p className="font-semibold">{place.label}</p>
<p className="text-sm text-gray-500">{place.address}</p>
</div>

<button
onClick={()=>deletePlace(place._id)}
className="text-red-500"
>
<i className="ri-delete-bin-line"></i>
</button>

</div>
))}

</div>

{/* ADD BUTTON */}
<button
onClick={()=>setShowForm(true)}
className="fixed bottom-6 right-6 bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
>
<i className="ri-add-line text-xl"></i>
</button>

{/* FORM MODAL */}
{showForm && (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white p-6 rounded-2xl w-[90%] max-w-md space-y-4">

<h3 className="text-lg font-semibold">Add New Place</h3>

<input
value={label}
onChange={(e)=>setLabel(e.target.value)}
placeholder="Label (Home, Work, etc)"
className="w-full p-3 bg-gray-100 rounded-xl outline-none"
/>

<input
value={address}
onChange={(e)=>setAddress(e.target.value)}
placeholder="Full Address"
className="w-full p-3 bg-gray-100 rounded-xl outline-none"
/>

<div className="flex justify-end gap-3">
<button
onClick={()=>setShowForm(false)}
className="text-gray-500"
>
Cancel
</button>

<button
onClick={addPlace}
className="bg-black text-white px-4 py-2 rounded-lg"
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