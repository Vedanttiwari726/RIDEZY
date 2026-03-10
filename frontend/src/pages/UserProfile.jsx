import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

export default function Profile() {

  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);

  return (
    <div className="min-h-screen bg-gray-100 pb-28 relative">

      {/* 🔥 TOP HEADER */}
      <div className="bg-gradient-to-br from-black to-gray-800 h-48 rounded-b-[40px] p-6 text-white">
        <div className="mt-8">
          <h2 className="text-2xl font-bold">
            {user?.fullname?.firstname || "User"}
          </h2>
          <p className="text-gray-300 text-sm">
            {user?.email}
          </p>
        </div>
      </div>

      {/* 🔥 FLOATING PROFILE CARD */}
      <div className="absolute top-32 left-0 right-0 px-5">

        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">

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

        {/* 🔥 LOGOUT SEPARATE CARD */}
        <div className="bg-white rounded-3xl shadow-lg p-5 mt-5">
          <div
            onClick={() => navigate("/user/logout")}
            className="flex items-center gap-3 text-red-500 cursor-pointer"
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
      hover:bg-gray-100
      transition cursor-pointer
    "
  >
    <div className="flex items-center gap-3">
      <div className="bg-gray-100 p-2 rounded-lg">
        <i className={`${icon} text-lg`} />
      </div>
      <span className="font-medium">{label}</span>
    </div>

    <i className="ri-arrow-right-s-line text-gray-400 text-xl" />
  </div>
);