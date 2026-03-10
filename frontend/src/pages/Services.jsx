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
    <div className="p-5 pb-24">

      <h1 className="text-xl font-semibold mb-5">Choose Service</h1>

      <div className="grid grid-cols-2 gap-4">

        {rideTypes.map((ride) => (

          <div
            key={ride.name}
            onClick={() => setSelected(ride.name)}
            className={`p-5 rounded-2xl cursor-pointer border transition duration-200
            ${
              selected === ride.name
                ? "border-black bg-gray-100 scale-105"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-3xl mb-2">{ride.icon}</div>

            <div className="font-medium">{ride.name}</div>

          </div>

        ))}

      </div>
    </div>
  );
};

export default Services;
