import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

export default function Profile() {

  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);

  return (
    <div className="min-h-screen bg-black text-white pb-28 relative">

      {/* 🔥 TOP HEADER */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 h-52 rounded-b-[40px] p-6">

        <div className="mt-10 flex items-center gap-4">

          {/* PROFILE ICON */}
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">
            {user?.fullname?.firstname?.[0] || "U"}
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {user?.fullname?.firstname || "User"}
            </h2>
            <p className="text-gray-400 text-sm">
              {user?.email}
            </p>
          </div>

        </div>
      </div>

      {/* 🔥 FLOATING PROFILE CARD */}
      <div className="absolute top-36 left-0 right-0 px-5">

        {/* MENU CARD */}
        <div className="
          bg-white/5 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-lg
          p-5 space-y-2
        ">

          <MenuItem
            icon="ri-map-pin-line"
            label="Saved Places"
            onClick={() => navigate("/saved-places")}
          />

          <MenuItem
            icon="ri-bank-card-line"
            label="Payments"
            onClick={() => navigate("/payments")}
          />

          <MenuItem
            icon="ri-gift-line"
            label="Referral"
            onClick={() => navigate("/referral")}
          />

          <MenuItem
            icon="ri-shield-check-line"
            label="Safety"
            onClick={() => navigate("/safety")}
          />

          <MenuItem
            icon="ri-settings-3-line"
            label="Settings"
            onClick={() => navigate("/settings")}
          />

        </div>

        {/* 🔥 LOGOUT CARD */}
        <div className="
          bg-white/5 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-lg
          p-5 mt-5
        ">
          <div
            onClick={() => navigate("/user/logout")}
            className="flex items-center gap-3 text-red-400 hover:text-red-500 cursor-pointer transition"
          >
            <i className="ri-logout-box-r-line text-xl" />
            <span className="font-medium">Logout</span>
          </div>
        </div>

      </div>

    </div>
  );
}


/* 🔥 MENU ITEM */
const MenuItem = ({ icon, label, onClick }) => (
  <div
    onClick={onClick}
    className="
      flex items-center justify-between
      p-3 rounded-xl
      hover:bg-white/10
      transition cursor-pointer
    "
  >
    <div className="flex items-center gap-3">
      <div className="bg-white/10 p-2 rounded-lg">
        <i className={`${icon} text-lg`} />
      </div>
      <span className="font-medium">{label}</span>
    </div>

    <i className="ri-arrow-right-s-line text-gray-500 text-xl" />
  </div>
);