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

      /* instant UI update */
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
      <div className="h-screen flex items-center justify-center text-lg">
        Loading rides...
      </div>
    );

  return (
    <div className="p-5 pb-24">

      <h1 className="text-xl font-semibold mb-5">
        Your Trips
      </h1>

      {rides.length === 0 ? (
        <div className="text-gray-500 text-center mt-20">
          No rides yet 🚕
        </div>
      ) : (
        <div className="space-y-4">

          {rides.map((ride) => (

            <div
              key={ride._id}
              className="bg-white rounded-2xl p-4 shadow border"
            >

              <div className="flex justify-between mb-2">
                <span className="font-medium">
                  {ride.pickup}
                </span>

                <span className="text-sm text-gray-500">
                  ₹{ride.fare}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-2">
                {ride.destination}
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400">

                <span>{ride.status}</span>

                <span>
                  {new Date(
                    ride.createdAt
                  ).toLocaleDateString()}
                </span>

              </div>

              {/* ✅ DELETE BUTTON */}
             <button
  onClick={() => deleteRide(ride._id)}
  className="
    mt-3
    w-full
    bg-red-500
    hover:bg-red-600
    active:scale-95
    transition
    text-white
    py-2
    rounded-lg
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