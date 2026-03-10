import React, { useContext, useEffect, useState } from "react";
import { CaptainDataContext } from "../context/CaptainContext";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import api from "../services/api";

const CaptainProtectWrapper = () => {

const navigate = useNavigate();
const location = useLocation();

const { captain, setCaptain } = useContext(CaptainDataContext);

const [loading,setLoading] = useState(true);


/* GET TOKEN FIXED */
const getToken = () => {
return(
localStorage.getItem("captainToken") ||
localStorage.getItem("token")
);
};


useEffect(()=>{

let mounted = true;

const verifyCaptain = async ()=>{

const token = getToken();

if(!token){

if(mounted){
setLoading(false);
navigate("/captain-login",{replace:true});
}

return;

}


/* Captain already loaded */
if(captain){

if(mounted) setLoading(false);

return;

}

try{

const res = await api.get(
"/captains/profile",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

if(mounted){

setCaptain(res.data);

setLoading(false);

}

}catch(err){

console.log(
"CAPTAIN AUTH ERROR:",
err.response?.data || err.message
);

localStorage.removeItem("captainToken");
localStorage.removeItem("token");

if(mounted){

setLoading(false);

navigate("/captain-login",{replace:true});

}

}

};

verifyCaptain();

return()=>{ mounted=false };

},[location.pathname,captain,navigate]);


if(loading){

return(

<div className="h-screen flex items-center justify-center text-lg font-semibold">

Verifying Captain...

</div>

);

}


return <Outlet/>

};

export default CaptainProtectWrapper;