import React, { useEffect, useState } from "react";
import api from "../services/api";

import { useAppSettings } from "../context/AppSettingContext";
import { translations } from "../utils/translations";

const EarningsTab = () => {

  /* ✅ GLOBAL SETTINGS */
  const { language } = useAppSettings();
  const t = translations[language] || translations.english;

  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);

  const token =
    localStorage.getItem("captainToken") ||
    localStorage.getItem("token");


  /* ================= FETCH ================= */
  useEffect(()=>{
    const fetchEarnings = async()=>{
      try{
        const res = await api.get(
          "/rides/captain/earnings",
          { headers:{ Authorization:`Bearer ${token}` }}
        );

        setData(res.data);

      }catch(err){
        console.log(err.message);
      }
      finally{
        setLoading(false);
      }
    };

    fetchEarnings();
  },[]);



  /* ================= LOADING ================= */
  if(loading){
    return(
      <div className="
      flex justify-center items-center h-full
      text-gray-500 dark:text-gray-400">
        {t.loadingEarnings || "Loading earnings..."}
      </div>
    );
  }



  /* ================= EMPTY ================= */
  if(!data || data.rides===0){
    return(
      <div className="flex justify-center items-center h-full px-5">

        <div className="
        bg-white dark:bg-neutral-900
        rounded-3xl shadow-md p-8 text-center max-w-sm w-full">

          <div className="w-16 h-16 mx-auto mb-4
          flex items-center justify-center
          rounded-full bg-green-100 text-2xl">
            💰
          </div>

          <h2 className="text-lg font-semibold">
            {t.noEarnings || "No Earnings Yet"}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {t.startEarning ||
            "Complete your first ride to start earning."}
          </p>

          <div className="mt-5 text-xs text-gray-400">
            {t.earningsAppear ||
            "Your earnings will appear here automatically."}
          </div>

        </div>

      </div>
    );
  }



  /* ================= DASHBOARD ================= */
  return(
  <div className="p-5 space-y-5">

    <h1 className="text-xl font-semibold">
      {t.earningsSummary || "Earnings Summary"}
    </h1>


    {/* TOTAL */}
    <div className="
    bg-white dark:bg-neutral-900
    rounded-3xl p-6 shadow-md text-center">

      <p className="text-gray-500 text-sm">
        {t.total}
      </p>

      <h1 className="text-4xl font-bold text-green-500 mt-2">
        ₹ {data.total || 0}
      </h1>

    </div>



    {/* TODAY WEEK MONTH */}
    <div className="grid grid-cols-3 gap-3">

      <StatCard
        title={t.today}
        value={data.today}
        color="text-green-500"
      />

      <StatCard
        title={t.weekly}
        value={data.weekly}
        color="text-yellow-500"
      />

      <StatCard
        title={t.monthly}
        value={data.monthly}
        color="text-blue-500"
      />

    </div>



    {/* EXTRA STATS */}
    <div className="grid grid-cols-2 gap-4">

      <div className="
      bg-white dark:bg-neutral-900
      rounded-2xl p-5 shadow-md text-center">

        <p className="text-gray-500 text-sm">
          {t.completedRides}
        </p>

        <h3 className="text-2xl font-semibold mt-1">
          {data.rides || 0}
        </h3>
      </div>


      <div className="
      bg-white dark:bg-neutral-900
      rounded-2xl p-5 shadow-md text-center">

        <p className="text-gray-500 text-sm">
          {t.avgRide}
        </p>

        <h3 className="text-2xl font-semibold text-green-500 mt-1">
          ₹ {data.rides
            ? Math.round(data.total / data.rides)
            : 0}
        </h3>

      </div>

    </div>

  </div>
  );
};



/* ================= SMALL CARD ================= */
const StatCard = ({title,value,color}) => (
  <div className="
  bg-white dark:bg-neutral-900
  rounded-2xl p-4 shadow-md text-center">

    <p className="text-xs text-gray-500">
      {title}
    </p>

    <p className={`font-bold text-lg ${color}`}>
      ₹ {value || 0}
    </p>

  </div>
);

export default EarningsTab;