import React, { useEffect, useState } from "react";
import api from "../services/api";

const Activity = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH RIDES ================= */
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await api.get("/rides/history");
        setRides(res.data);
      } catch (err) {
        console.log(err);
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  /* ================= DELETE RIDE ================= */
  const deleteRide = async (rideId) => {
    try {

      const confirmDelete = window.confirm(
        "Delete this ride history?"
      );

      if (!confirmDelete) return;

      await api.delete(`/rides/history/${rideId}`);

      setRides((prev) =>
        prev.filter((ride) => ride._id !== rideId)
      );

    } catch (err) {
      console.log(err);
      alert("Failed to delete ride");
    }
  };

  /* ================= LOADING ================= */
  if (loading)
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center text-lg text-white">
        Loading rides...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-28">

      <h1 className="text-3xl font-bold mb-6">
        Your Trips
      </h1>

      {rides.length === 0 ? (
        <div className="text-gray-400 text-center mt-20">
          No rides yet 🚕
        </div>
      ) : (
        <div className="space-y-4">

          {rides.map((ride) => (

            <div
              key={ride._id}
              className="
              bg-white/10
              backdrop-blur-md
              border border-white/10
              rounded-2xl
              p-5
              shadow-lg
            "
            >

              {/* Pickup + Fare */}

              <div className="flex justify-between mb-3">

                <span className="font-medium text-white">
                  {ride.pickup}
                </span>

                <span className="text-green-400 font-semibold">
                  ₹{ride.fare}
                </span>

              </div>

              {/* Destination */}

              <div className="text-sm text-gray-400 mb-3">
                {ride.destination}
              </div>

              {/* Status + Date */}

              <div className="flex justify-between items-center text-xs text-gray-500">

                <span className="capitalize">
                  {ride.status}
                </span>

                <span>
                  {new Date(
                    ride.createdAt
                  ).toLocaleDateString()}
                </span>

              </div>

              {/* DELETE BUTTON */}

              <button
                onClick={() => deleteRide(ride._id)}
                className="
                  mt-4
                  w-full
                  bg-red-500/90
                  hover:bg-red-600
                  active:scale-95
                  transition
                  text-white
                  py-2.5
                  rounded-xl
                  font-medium
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <i className="ri-delete-bin-line"></i>
                Delete Ride
              </button>

            </div>

          ))}

        </div>
      )}
    </div>
  );
};

export default Activity;