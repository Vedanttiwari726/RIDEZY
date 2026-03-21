import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppSettings } from "../context/AppSettingContext";

/* ICON FIX */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
iconRetinaUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
iconUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
shadowUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

/* DRIVER ICON */

const driverIcon = new L.Icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/744/744465.png",
iconSize:[40,40],
iconAnchor:[20,20]
});

/* PICKUP ICON */

const pickupIcon = new L.Icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/684/684908.png",
iconSize:[30,30],
iconAnchor:[15,30]
});

/* DEST ICON */

const dropIcon = new L.Icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
iconSize:[30,30],
iconAnchor:[15,30]
});

/* AUTO FOLLOW */

function FollowDriver({position}){

const map = useMap();

useEffect(()=>{

if(position){
map.setView(position,16,{animate:true});
}

},[position]);

return null;

}

export default function DriverMap({
pickupLat,
pickupLng,
destinationLat,
destinationLng,
phase="pickup"
}){

const { darkMode } = useAppSettings();

const [driverPos,setDriverPos] = useState(null);
const [route,setRoute] = useState([]);

const watchRef = useRef(null);
const routeRef = useRef(null);

/* ================= DRIVER GPS ================= */

useEffect(()=>{

if(!navigator.geolocation) return;

/* fallback first location */

navigator.geolocation.getCurrentPosition(

(pos)=>{

const { latitude, longitude } = pos.coords;
setDriverPos([latitude,longitude]);

},

(err)=>{

console.log("GPS initial error:",err);

}

);

/* continuous tracking */

watchRef.current = navigator.geolocation.watchPosition(

(pos)=>{

const { latitude, longitude } = pos.coords;

setDriverPos([latitude,longitude]);

},

(err)=>{

console.log("GPS ERROR:",err);

},

{
enableHighAccuracy:true,
timeout:30000,
maximumAge:15000
}

);

return ()=>{

if(watchRef.current)
navigator.geolocation.clearWatch(watchRef.current);

};

},[]);


/* ================= ROUTE ================= */

const fetchRoute = async()=>{

if(!driverPos) return;

let targetLat;
let targetLng;

if(phase==="pickup"){

targetLat = pickupLat;
targetLng = pickupLng;

}

if(phase==="destination"){

targetLat = destinationLat;
targetLng = destinationLng;

}

if(!targetLat || !targetLng) return;

try{

const url =
`https://router.project-osrm.org/route/v1/driving/${driverPos[1]},${driverPos[0]};${targetLng},${targetLat}?overview=full&geometries=geojson`;

const res = await fetch(url);

const data = await res.json();

if(!data.routes?.length) return;

const coords = data.routes[0].geometry.coordinates.map(c=>[
c[1],
c[0]
]);

setRoute(coords);

}catch(err){

console.log("Route error:",err);

}

};

/* ⭐ route refresh every 10 sec */

useEffect(()=>{

fetchRoute();

routeRef.current = setInterval(fetchRoute,10000);

return ()=>{

if(routeRef.current)
clearInterval(routeRef.current);

};

},[driverPos,phase]);

if(!driverPos){

return(
<div className="flex items-center justify-center h-full">
Getting driver location...
</div>
);

}

return(

<MapContainer
key={darkMode ? "dark-map" : "light-map"}
center={driverPos}
zoom={16}
style={{height:"100%",width:"100%"}}
zoomControl={false}
>

{/* THEME BASED MAP */}

<TileLayer
key={darkMode ? "dark-tiles" : "light-tiles"}
url={
darkMode
? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
}
attribution="&copy; OpenStreetMap contributors"
/>

{/* DRIVER */}

<Marker position={driverPos} icon={driverIcon}/>

{/* USER PICKUP */}

{pickupLat && pickupLng && (
<Marker position={[pickupLat,pickupLng]} icon={pickupIcon}/>
)}

{/* DESTINATION */}

{destinationLat && destinationLng && (
<Marker position={[destinationLat,destinationLng]} icon={dropIcon}/>
)}

{/* ROUTE */}

{route.length>0 && (
<Polyline
positions={route}
pathOptions={{
color:"#2563eb",
weight:6
}}
/>
)}

<FollowDriver position={driverPos}/>

</MapContainer>

);

}