import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

/* GLOBAL SETTINGS */
import { AppSettingsProvider } from "./context/AppSettingContext";

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

/* BOTTOM NAV */
import BottomTabs from "./components/BottomTabs";
import ChooseVehicle from "./pages/ChooseVehicles";

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
   ROUTES
===================================================== */
const AppRoutes = () => {
  return (
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

        {/* RIDE START PAGE */}
        <Route path="/ride-started" element={<RideStarted />} />
        <Route path="/choose-vehicle" element={<ChooseVehicle />} />

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
  );
};


/* =====================================================
   MAIN APP CONTENT
===================================================== */

const AppContent = () => {

  const location = useLocation();

  // Hide bottom tabs on captain pages
  const hideTabs = location.pathname.startsWith("/captain");

  return (

    <div
      className="
      min-h-screen
      w-full
      flex
      justify-center
      bg-gray-200
      dark:bg-neutral-950
      text-gray-900
      dark:text-white
      transition-colors duration-300
      "
    >

      {/* MOBILE APP CONTAINER */}
      <div
        className="
        w-full
        max-w-[430px]
        min-h-screen
        bg-gray-100
        dark:bg-neutral-950
        text-gray-900
        dark:text-white
        relative
        overflow-x-hidden
        transition-colors duration-300
        "
      >

        {/* ROUTES */}
        <AppRoutes />

        {/* GLOBAL USER BOTTOM NAV */}
        {!hideTabs && <BottomTabs />}

      </div>

    </div>

  );
};


/* =====================================================
   ROOT APP
===================================================== */

const App = () => {
  return (
    <AppSettingsProvider>
      <AppContent />
    </AppSettingsProvider>
  );
};

export default App;