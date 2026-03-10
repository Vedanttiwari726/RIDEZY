import React, { useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-semibold mb-5">Profile</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <p className="font-medium">
          {user?.fullName?.firstName} {user?.fullName?.lastName}
        </p>
        <p className="text-gray-500 text-sm">{user?.email}</p>
      </div>

      <button
        onClick={logout}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
