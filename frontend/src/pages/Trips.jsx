import { useEffect, useState, useMemo } from "react";
import api from "../services/api";

import { useAppSettings } from "../context/AppSettingContext";
import { translations } from "../utils/translations";

const Trips = () => {

  const { language } = useAppSettings();
  const t = translations[language] || translations.english;

  const [trips,setTrips] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [filter,setFilter] = useState("all");

  const token =
    localStorage.getItem("captainToken") ||
    localStorage.getItem("token");



  /* ================= FETCH ================= */

  useEffect(()=>{

    const fetchTrips = async()=>{

      try{

        const res = await api.get(
          "/rides/captain/trips",
          { headers:{ Authorization:`Bearer ${token}` }}
        );

        setTrips(res.data || []);

      }catch{
        setError("Failed to load trips");
      }
      finally{
        setLoading(false);
      }

    };

    fetchTrips();

  },[]);



  /* ================= DELETE ================= */

  const deleteTrip = async(id)=>{

    try{

      await api.delete(
        `/rides/captain/trips/${id}`,
        { headers:{ Authorization:`Bearer ${token}` }}
      );

      setTrips(prev=>prev.filter(t=>t._id!==id));

    }catch(err){
      console.log(err.message);
    }

  };



  /* ================= FILTER ================= */

  const filteredTrips = useMemo(()=>{

    const now = new Date();

    return trips.filter(trip=>{

      const tripDate = new Date(trip.createdAt);

      if(filter==="today")
        return tripDate.toDateString()===now.toDateString();

      if(filter==="weekly"){
        const weekAgo=new Date();
        weekAgo.setDate(now.getDate()-7);
        return tripDate>=weekAgo;
      }

      if(filter==="monthly"){
        return (
          tripDate.getMonth()===now.getMonth() &&
          tripDate.getFullYear()===now.getFullYear()
        );
      }

      return true;

    });

  },[trips,filter]);



  /* ================= LOADING ================= */

  if(loading){

    return(
      <div className="flex justify-center items-center h-full text-gray-400">
        {t.loadingTrips || "Loading trips..."}
      </div>
    );

  }



  /* ================= EMPTY ================= */

  if(filteredTrips.length===0){

    return(

      <div className="flex justify-center items-center h-full px-5">

        <div className="
        bg-white/5 backdrop-blur-xl border border-white/10
        rounded-3xl shadow-lg p-8 text-center max-w-sm w-full">

          <div className="w-16 h-16 mx-auto mb-4
          flex items-center justify-center
          rounded-full bg-blue-500/20 text-2xl">
            🚗
          </div>

          <h2 className="text-lg font-semibold text-white">
            {t.noTrips || "No Trips Found"}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            {t.tripsAppear || "Trips for this period will appear here."}
          </p>

        </div>

      </div>

    );

  }



  /* ================= UI ================= */

  return(

  <div className="p-5 space-y-4">

    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
      {t.trips}
    </h1>


    {/* FILTER BAR */}

    <div className="flex gap-2 overflow-x-auto pb-1">

      {[
        {key:"all",label:t.all || "All"},
        {key:"today",label:t.today},
        {key:"weekly",label:t.weekly},
        {key:"monthly",label:t.monthly}
      ].map(f=>(

        <button
          key={f.key}
          onClick={()=>setFilter(f.key)}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition
          ${
            filter===f.key
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white/5 border border-white/10 text-gray-300"
          }`}
        >

          {f.label}

        </button>

      ))}

    </div>



    {/* TRIPS LIST */}

    {filteredTrips.map(trip=>(

      <div
        key={trip._id}
        className="
        bg-white/5 backdrop-blur-xl border border-white/10
        rounded-2xl p-5 shadow-lg
        flex justify-between items-start
        hover:shadow-blue-500/10 transition"
      >

        <div className="flex-1">

          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {trip.pickup} → {trip.destination}
          </p>

          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {new Date(trip.createdAt).toLocaleString()}
          </p>

        </div>


        <div className="flex flex-col items-end gap-2">

          <p className="text-green-400 font-bold text-lg">
            ₹ {trip.driverEarning || 0}
          </p>

          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
            {trip.status}
          </p>

          <button
            onClick={()=>deleteTrip(trip._id)}
            className="bg-red-500 hover:bg-red-600
            text-white text-xs px-3 py-1 rounded-lg">

            {t.delete || "Delete"}

          </button>

        </div>

      </div>

    ))}

  </div>

  );

};

export default Trips;