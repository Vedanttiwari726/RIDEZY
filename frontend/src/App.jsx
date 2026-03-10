import React from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";

/* GLOBAL SETTINGS */
import {
  AppSettingsProvider,
  useAppSettings
} from "./context/AppSettingContext";

import { translations } from "./utils/translations";

/* PUBLIC PAGES */
import Start from "./pages/Start";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import CaptainLogin from "./pages/Captainlogin";
import CaptainSignup from "./pages/CaptainSignup";

/* USER PAGES */
import Home from "./pages/Home";
import Riding from "./pages/Riding";
import SearchRide from "./pages/SearchRide";
import Activity from "./pages/Activity";
import Services from "./pages/Services";
import UserProfile from "./pages/UserProfile";
import FindingDriver from "./pages/FindingDriver";
import UserLogout from "./pages/UserLogout";
import SavedPlaces from "./pages/SavedPlaces";
import Safety from "./pages/Safety";
import RideTracker from "./pages/RideTracker";
import RideStarted from "./pages/RideStarted";

/* CAPTAIN */
import CaptainHome from "./pages/CaptainHome";
import CaptainRiding from "./pages/CaptainRiding";
import Trips from "./pages/Trips";
import CaptainLogout from "./pages/CaptainLogout";

/* PROTECT WRAPPERS */
import UserProtectWrapper from "./pages/UserProtectWrapper";
import CaptainProtectWrapper from "./pages/CaptainProtectWrapper";

import "remixicon/fonts/remixicon.css";
import "leaflet/dist/leaflet.css";



/* =====================================================
   GLOBAL NAVBAR
===================================================== */
const BottomNav = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const { language } = useAppSettings();
  const t = translations[language] || translations.english;

  const pages = ["/home", "/activity", "/services", "/profile"];
  if (!pages.includes(location.pathname)) return null;

  const Item = ({ icon, label, to }) => (
    <div
      onClick={() => navigate(to)}
      className={`flex flex-col items-center text-sm cursor-pointer transition ${
        location.pathname === to
          ? "text-green-500 font-semibold"
          : "text-gray-500"
      }`}
    >
      <i className={`${icon} text-xl`} />
      {label}
    </div>
  );

  return (
    <div
      className="
      fixed bottom-3 left-1/2 -translate-x-1/2
      w-[95%] max-w-md h-[70px]
      bg-white dark:bg-gray-900
      rounded-3xl shadow-lg
      flex justify-around items-center z-50
    "
    >
      <Item icon="ri-home-5-line" label={t.home} to="/home" />
      <Item icon="ri-time-line" label="Activity" to="/activity" />
      <Item icon="ri-service-line" label="Services" to="/services" />
      <Item icon="ri-user-3-line" label={t.profile} to="/profile" />
    </div>
  );
};


/* =====================================================
   ROUTES
===================================================== */
const AppRoutes = () => {
  return (
    <>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/captain-login" element={<CaptainLogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />

        {/* USER PROTECTED */}
        <Route element={<UserProtectWrapper />}>

          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<SearchRide />} />
          <Route path="/riding" element={<Riding />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/services" element={<Services />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/saved-places" element={<SavedPlaces />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/track/:rideId" element={<RideTracker />} />

          <Route path="/finding-driver" element={<FindingDriver />} />

          {/* ⭐ RIDE START PAGE */}
          <Route path="/ride-started" element={<RideStarted />} />

          <Route path="/user/logout" element={<UserLogout />} />

        </Route>

        {/* CAPTAIN PROTECTED */}
        <Route element={<CaptainProtectWrapper />}>

          <Route path="/captain-home" element={<CaptainHome />} />
          <Route path="/captain-riding" element={<CaptainRiding />} />
          <Route path="/captain-trips" element={<Trips />} />
          <Route path="/captain/logout" element={<CaptainLogout />} />

        </Route>

      </Routes>

      <BottomNav />
    </>
  );
};


/* =====================================================
   MAIN APP
===================================================== */
const App = () => {

  return (
    <AppSettingsProvider>

      {/* OUTER BACKGROUND */}
      <div
        className="
        min-h-screen
        w-full
        flex
        justify-center
        bg-gray-200 dark:bg-black
      "
      >

        {/* MOBILE APP CONTAINER */}
        <div
          className="
          w-full
          max-w-[430px]
          min-h-screen
          bg-gray-100 dark:bg-black
          relative
          overflow-x-hidden
        "
        >

          <AppRoutes />

        </div>

      </div>

    </AppSettingsProvider>
  );
};

export default App;