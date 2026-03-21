import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* =========================
   FIX DEFAULT MARKER ICON
========================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
iconRetinaUrl:
"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
iconUrl:
"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
shadowUrl:
"https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* =========================
   DRIVER ICON ROTATING
========================= */

const createDriverIcon = (angle=0)=> new L.DivIcon({
html:`
<div style="transform:rotate(${angle}deg)">
<img src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
style="width:44px;height:44px;filter:drop-shadow(0 0 8px #22c55e)"/>
</div>
`,
iconSize:[44,44],
iconAnchor:[22,22]
});

/* =========================
   PICKUP ICON
========================= */

const pickupIcon = new L.Icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/684/684908.png",
iconSize:[34,34],
iconAnchor:[17,34]
});

/* =========================
   DROP ICON
========================= */

const dropIcon = new L.Icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
iconSize:[34,34],
iconAnchor:[17,34]
});


/* =========================
   MAP FOLLOW DRIVER
========================= */

function FollowDriver({position,distance}){

const map = useMap()

useEffect(()=>{

if(!position || position[0]==null || position[1]==null) return

let zoom = 16

if(distance>5) zoom = 12
else if(distance>2) zoom = 14
else if(distance>1) zoom = 15
else zoom = 17

map.setView(position,zoom,{
animate:true
})

},[position,distance])

return null
}


/* =========================
   MAIN COMPONENT
========================= */

const LiveTracking = ({
pickup,
destination,
driverLocation,
heatZones=[],
userLiveLocation   // 🔥 ADDED
})=>{

const [userPos,setUserPos] = useState(null)
const [driverPos,setDriverPos] = useState(null)
const [route,setRoute] = useState([])
const [heading,setHeading] = useState(0)
const [distance,setDistance] = useState(0)

const watchRef = useRef(null)

const pickupLat = pickup?.lat
const pickupLng = pickup?.lng

const destLat = destination?.lat
const destLng = destination?.lng


/* =========================
   USER LIVE LOCATION (SELF GPS)
========================= */

useEffect(()=>{

if(!navigator.geolocation) return

watchRef.current = navigator.geolocation.watchPosition(

(pos)=>{

const {latitude,longitude} = pos.coords

if(latitude!=null && longitude!=null){
setUserPos([latitude,longitude])
}

},

(err)=>console.log("GPS ERROR:",err),

{
enableHighAccuracy:true,
maximumAge:10000,
timeout:5000
}

)

return ()=>{

if(watchRef.current)
navigator.geolocation.clearWatch(watchRef.current)

}

},[])



/* =========================
   DRIVER LIVE UPDATE
========================= */

useEffect(()=>{

if(driverLocation?.lat == null || driverLocation?.lng == null) return

setDriverPos(prev=>{

if(!prev)
return [driverLocation.lat,driverLocation.lng]

const lat = prev[0] + (driverLocation.lat-prev[0])*0.25
const lng = prev[1] + (driverLocation.lng-prev[1])*0.25

return [lat,lng]

})

if(driverLocation?.lat && driverLocation?.lng){

const dy = driverLocation.lat - (driverPos?.[0] || driverLocation.lat)
const dx = driverLocation.lng - (driverPos?.[1] || driverLocation.lng)

const angle = Math.atan2(dy,dx)*180/Math.PI

setHeading(angle)

}

},[driverLocation])



/* =========================
   DISTANCE CALCULATION
========================= */

useEffect(()=>{

if(!driverPos || driverPos[0]==null || driverPos[1]==null) return
if(destLat == null || destLng == null) return

const R = 6371

const dLat = (destLat-driverPos[0])*Math.PI/180
const dLng = (destLng-driverPos[1])*Math.PI/180

const a =
Math.sin(dLat/2)*Math.sin(dLat/2) +
Math.cos(driverPos[0]*Math.PI/180) *
Math.cos(destLat*Math.PI/180) *
Math.sin(dLng/2)*Math.sin(dLng/2)

const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))

const dist = R*c

setDistance(dist)

},[driverPos,destination])



/* =========================
   ROUTE FETCH
========================= */

const fetchRoute = async ()=>{

if(!driverPos || driverPos[0]==null || driverPos[1]==null) return

let targetLat = null
let targetLng = null

if(pickupLat != null && pickupLng != null && !destination){
targetLat = pickupLat
targetLng = pickupLng
}
else if(destLat != null && destLng != null){
targetLat = destLat
targetLng = destLng
}

if(targetLat == null || targetLng == null) return

try{

const url =
`https://router.project-osrm.org/route/v1/driving/${driverPos[1]},${driverPos[0]};${targetLng},${targetLat}?overview=full&geometries=geojson`

const res = await fetch(url)

const data = await res.json()

if(!data?.routes?.length) return

const coords = data.routes[0].geometry.coordinates.map(c=>[
c[1],
c[0]
])

setRoute(coords)

}catch(err){

console.log("Route error:",err)

}

}



/* =========================
   ROUTE AUTO REFRESH
========================= */

useEffect(()=>{

fetchRoute()

const interval = setInterval(fetchRoute,7000)

return ()=>clearInterval(interval)

},[driverPos,pickupLat,pickupLng,destLat,destLng])



/* =========================
   LOADING
========================= */

if(!userPos){

return(
<div className="flex items-center justify-center h-full w-full bg-black text-white text-lg">
Locating you...
</div>
)

}



/* =========================
   MAP UI
========================= */

return(

<div className="h-full w-full">

{(driverPos || userPos) && (

<MapContainer
center={driverPos || userPos}
zoom={16}
style={{height:"100%",width:"100%"}}
zoomControl={false}
whenCreated={(map)=>setTimeout(()=>map.invalidateSize(),100)}
>

<TileLayer
url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
/>

{/* USER DEVICE LOCATION */}
{userPos && (
<Marker position={userPos}/>
)}

{/* 🔥 LIVE USER (FROM SOCKET) */}
{userLiveLocation && (
<Marker position={[userLiveLocation.lat, userLiveLocation.lng]} />
)}

{/* DRIVER */}
{driverPos && (
<Marker
position={driverPos}
icon={createDriverIcon(heading)}
/>
)}

{/* PICKUP */}
{pickupLat != null && pickupLng != null && (
<Marker
position={[pickupLat,pickupLng]}
icon={pickupIcon}
/>
)}

{/* DROP */}
{destLat != null && destLng != null && (
<Marker
position={[destLat,destLng]}
icon={dropIcon}
/>
)}

{/* ROUTE */}
{route.length>0 && (
<Polyline
positions={route}
pathOptions={{
color:"#22c55e",
weight:7,
opacity:0.9
}}
/>
)}

{/* HEAT ZONES */}
{heatZones?.map((zone,index)=>{

if(zone?.lat == null || zone?.lng == null) return null

let color="green"

if(zone.level==="medium") color="orange"
if(zone.level==="high") color="red"

return(
<Circle
key={index}
center={[zone.lat,zone.lng]}
radius={400}
pathOptions={{
color,
fillColor:color,
fillOpacity:0.35
}}
/>
)

})}

<FollowDriver
position={driverPos || userPos}
distance={distance}
/>

</MapContainer>

)}

</div>

)

}

export default React.memo(LiveTracking);