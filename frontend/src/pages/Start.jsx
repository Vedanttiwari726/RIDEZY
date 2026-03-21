import React from "react";
import { useNavigate } from "react-router-dom";

export default function Start(){

const navigate = useNavigate();

return(

<div className="h-screen w-full flex flex-col justify-between bg-[#020617] text-white relative overflow-hidden">

{/* GLOW BACKGROUND */}

<div className="absolute w-[350px] h-[350px] bg-green-500/20 blur-[120px] top-[-120px] left-[-120px]" />
<div className="absolute w-[350px] h-[350px] bg-blue-500/20 blur-[120px] bottom-[-120px] right-[-120px]" />

{/* TOP RIGHT BUTTONS */}

<div className="flex justify-end gap-3 p-5">

<button
onClick={()=>navigate("/login")}
className="text-sm border border-white/20 px-4 py-1.5 rounded-lg hover:bg-white/10 transition"
>

Sign In

</button>

<button
onClick={()=>navigate("/signup")}
className="text-sm bg-green-500 px-4 py-1.5 rounded-lg hover:bg-green-600 transition"
>

Sign Up

</button>

</div>


{/* CENTER CONTENT */}

<div className="flex flex-col items-center text-center px-6">

<h1 className="text-6xl font-bold tracking-wide animate-pulse">
Ridezy
</h1>

<p className="text-green-400 mt-3 text-lg font-semibold">
Go Easy With Ridezy
</p>



</div>


{/* BOTTOM BUTTON */}

<div className="px-6 pb-10">

<button
onClick={()=>navigate("/login")}
className="
w-full
bg-green-500
py-4
rounded-2xl
text-lg
font-semibold
shadow-lg
hover:bg-green-600
transition
">

Start Ride

</button>

</div>

</div>

);

}