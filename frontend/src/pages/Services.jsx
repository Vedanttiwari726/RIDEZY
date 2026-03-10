import React, { useState } from "react";

const rideTypes = [
  { name: "Bike", icon: "🏍️" },
  { name: "Auto", icon: "🛺" },
  { name: "Mini", icon: "🚗" },
  { name: "Sedan", icon: "🚘" },
  { name: "SUV", icon: "🚙" },
  { name: "Package", icon: "📦" },
];

const Services = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-28">

      <h1 className="text-3xl font-bold mb-6">
        Choose Service
      </h1>

      <div className="grid grid-cols-2 gap-4">

        {rideTypes.map((ride) => (

          <div
            key={ride.name}
            onClick={() => setSelected(ride.name)}
            className={`
            p-6
            rounded-2xl
            cursor-pointer
            border
            backdrop-blur-sm
            flex flex-col items-center
            justify-center
            transition duration-200
            ${
              selected === ride.name
                ? "border-white bg-white/10 scale-105"
                : "border-white/30 bg-transparent hover:bg-white/5"
            }
            `}
          >

            <div className="text-4xl mb-3">
              {ride.icon}
            </div>

            <div className="font-medium">
              {ride.name}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Services;