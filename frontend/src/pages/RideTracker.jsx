import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import LiveTracking from "../components/LiveTracking";

export default function RideTracker(){

const { rideId } = useParams();

const [ride,setRide] = useState(null);

useEffect(()=>{

const getRide = async ()=>{

const res = await api.get(`/rides/${rideId}`);

setRide(res.data);

};

getRide();

},[]);

return(

<div className="h-screen w-screen relative">

{/* MAP */}
<LiveTracking ride={ride}/>

{/* INFO CARD */}
<div className="
absolute bottom-0
bg-white
w-full
rounded-t-3xl
p-5
shadow-lg
">

<h2 className="font-semibold text-lg">
Live Ride Tracking
</h2>

<p className="text-sm text-gray-500">
Driver: {ride?.captain?.fullname?.firstname}
</p>

<p className="text-sm">
Vehicle: {ride?.captain?.vehicle?.plate}
</p>

</div>

</div>

);

}