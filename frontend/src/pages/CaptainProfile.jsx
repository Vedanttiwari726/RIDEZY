import React, { useContext, useEffect, useState } from "react";
import { CaptainDataContext } from "../context/CaptainContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAppSettings } from "../context/AppSettingContext";
import { translations } from "../utils/translations";

import {
  Car,
  Bell,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Settings,
  Moon,
  Globe,
  Shield,
  KeyRound
} from "lucide-react";

const Profile = () => {

const { captain } = useContext(CaptainDataContext);
const navigate = useNavigate();

const { darkMode, setDarkMode, language, setLanguage } = useAppSettings();

const t = translations[language] || translations.english;

const [activeSection,setActiveSection]=useState(null);

const [stats,setStats]=useState({
  today:0,
  weekly:0,
  trips:0
});

const [sound,setSound]=
useState(localStorage.getItem("sound")!=="false");

const token =
localStorage.getItem("captainToken") ||
localStorage.getItem("token");


/* ================= FETCH STATS ================= */

useEffect(()=>{

const fetchStats=async()=>{

try{

const res=await api.get("/rides/captain/earnings",{
headers:{Authorization:`Bearer ${token}`}
});

setStats({
today:res.data.today||0,
weekly:res.data.total||0,
trips:res.data.rides||0
});

}catch{}

};

fetchStats();

},[]);



/* ================= TOGGLES ================= */

const toggleSound=()=>{
const val=!sound;
setSound(val);
localStorage.setItem("sound",val);
};

const toggleDark=()=>{
setDarkMode(!darkMode);
};



/* ================= LOGOUT ================= */

const logout=()=>{
localStorage.clear();
navigate("/captain-login");
};



/* ================= BACK HEADER ================= */

const BackHeader=({title})=>(

<div className="sticky top-0 z-[1000]
bg-white/5 backdrop-blur-xl border border-white/10
flex items-center gap-3 p-3 rounded-xl shadow mb-6">

<button
onClick={()=>setActiveSection(null)}
className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
<ArrowLeft/>
</button>

<h2 className="font-semibold text-lg text-white">{title}</h2>

</div>

);



/* ================= EDIT PROFILE ================= */

if(activeSection==="edit"){
return(
<div className="fixed inset-0 bg-gray-100 dark:bg-black p-4 overflow-y-auto z-[999] min-h-screen">

<BackHeader title={t.editProfile}/>

<div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10
p-5 rounded-xl shadow-sm space-y-4">

<input className="w-full border border-white/10 bg-white dark:bg-black/40 p-3 rounded-lg text-white" placeholder="First Name"/>
<input className="w-full border border-white/10 bg-white dark:bg-black/40 p-3 rounded-lg text-white" placeholder="Last Name"/>
<input className="w-full border border-white/10 bg-white dark:bg-black/40 p-3 rounded-lg text-white" placeholder="Vehicle Number"/>

<button className="w-full bg-green-500 text-white py-3 rounded-xl">
Save Changes
</button>

</div>
</div>
);
}



/* ================= PASSWORD ================= */

if(activeSection==="password"){
return(
<div className="fixed inset-0 bg-black p-4 overflow-y-auto z-[999] min-h-screen">

<BackHeader title={t.changePassword}/>

<div className="bg-white/5 backdrop-blur-xl border border-white/10
p-5 rounded-xl shadow space-y-4">

<input type="password" placeholder="Old Password"
className="w-full border border-white/10 bg-black/40 p-3 rounded-lg text-gray-900 dark:text-white"/>

<input type="password" placeholder="New Password"
className="w-full border border-white/10 bg-black/40 p-3 rounded-lg text-gray-900 dark:text-white"/>

<input type="password" placeholder="Confirm Password"
className="w-full border border-white/10 bg-black/40 p-3 rounded-lg text-gray-900 dark:text-white"/>

<button className="w-full bg-green-500 text-white py-3 rounded-xl">
Update Password
</button>

</div>
</div>
);
}



/* ================= SETTINGS PANEL ================= */

if(activeSection==="settings"){
return(
<div className="fixed inset-0 bg-black p-4 overflow-y-auto z-[999] min-h-screen">

<BackHeader title={t.appSettings}/>

<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow p-5 space-y-5 text-white">

{/* SOUND */}
<div className="flex justify-between items-center">
<span className="flex gap-2 items-center">
<Bell size={18}/> {t.soundAlerts}
</span>

<button
onClick={toggleSound}
className={`px-4 py-1 rounded-full text-white ${
sound?"bg-green-500":"bg-gray-400"
}`}>
{sound?"On":"Off"}
</button>
</div>


{/* THEME SLIDER */}

<div className="flex justify-between items-center">

<span className="flex gap-2 items-center">
<Moon size={18}/> Theme
</span>

<div className="flex items-center gap-3">

<span className="text-gray-400 text-sm">🌙</span>

<button
onClick={toggleDark}
className="relative w-14 h-7 bg-gray-300 dark:bg-neutral-700 rounded-full transition"
>

<div
className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300
${darkMode ? "translate-x-0" : "translate-x-7"}
`}
></div>

</button>

<span className="text-yellow-400 text-sm">☀️</span>

</div>

</div>


{/* LANGUAGE */}

<div className="flex justify-between items-center">
<span className="flex gap-2 items-center">
<Globe size={18}/> {t.language}
</span>

<select
value={language}
onChange={(e)=>setLanguage(e.target.value)}
className="border border-white/10 rounded-lg px-2 py-1 bg-black text-white">

<option value="english">English</option>
<option value="hindi">Hindi</option>
<option value="bengali">Bengali</option>
<option value="tamil">Tamil</option>
<option value="telugu">Telugu</option>
<option value="spanish">Spanish</option>
<option value="french">French</option>
<option value="arabic">Arabic</option>

</select>
</div>


<div className="flex justify-between items-center">
<span className="flex gap-2 items-center">
<Shield size={18}/> Privacy
</span>
›
</div>

</div>
</div>
);
}



/* ================= HELP ================= */

if(activeSection==="help"){
return(
<div className="fixed inset-0 bg-black p-4 overflow-y-auto z-[999] min-h-screen">

<BackHeader title={t.helpCenter}/>

<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow p-5 space-y-2 text-white">
<p>Email: support@ridezy.com</p>
<p>Phone: +91 XXXXX XXXXX</p>
</div>

</div>
);
}



/* ================= MAIN PROFILE ================= */

return(

<div className="bg-gray-100 dark:bg-black text-gray-900 dark:text-white min-h-screen pb-24 px-4 pt-20 space-y-6">

<div className="bg-gradient-to-br from-green-600 to-green-400 rounded-3xl p-6 text-white shadow">

<div className="flex gap-4 items-center">

<div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-xl font-bold">
{captain?.fullname?.firstname?.charAt(0)}
</div>

<div>
<h2 className="font-semibold text-lg">
{captain?.fullname?.firstname} {captain?.fullname?.lastname}
</h2>

<p className="flex gap-1 text-sm">
<Car size={14}/>
{captain?.vehicle?.plate}
</p>
</div>

</div>

<button
onClick={()=>setActiveSection("edit")}
className="mt-4 w-full bg-white text-green-600 py-2 rounded-xl font-semibold">
{t.editProfile}
</button>

</div>


<div className="grid grid-cols-3 gap-3">

<Card title={t.today} value={`₹${stats.today}`} color="text-green-400"/>
<Card title={t.total} value={`₹${stats.weekly}`} color="text-yellow-400"/>
<Card title={t.trips} value={stats.trips} color="text-blue-400"/>

</div>


<div className="bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-xl shadow-sm p-5 space-y-3">

<Row title={t.appSettings} icon={<Settings size={18}/>} onClick={()=>setActiveSection("settings")}/>
<Row title={t.changePassword} icon={<KeyRound size={18}/>} onClick={()=>setActiveSection("password")}/>
<Row title={t.helpCenter} icon={<HelpCircle size={18}/>} onClick={()=>setActiveSection("help")}/>

</div>


<button
onClick={logout}
className="w-full bg-red-600 text-white py-3 rounded-xl flex justify-center gap-2">
<LogOut size={18}/> {t.logout}
</button>

</div>

);
};



const Row=({title,icon,onClick})=>(

<div
onClick={onClick}
className="flex justify-between items-center p-3 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10">

<div className="flex items-center gap-3">

<div className="p-2 rounded-lg bg-white/10">
{icon}
</div>

<span className="text-gray-900 dark:text-white font-medium">{title}</span>

</div>

<span className="text-gray-400">›</span>

</div>

);



const Card=({title,value,color})=>(

<div className="bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-xl p-4 shadow-sm text-center">

<p className={`text-xl font-bold ${color}`}>{value}</p>

<p className="text-xs text-gray-400">{title}</p>

</div>

);

export default Profile;