import React from "react";

const VehiclePanel = (props) => {

  /* ===== AUTO VISIBILITY RULE ===== */

  const locationText =
    `${props.pickup || ""} ${props.destination || ""}`;

  const match = locationText.match(/\b\d{6}\b/);

  let allowAuto = true;

  if (match) {
    const pincode = parseInt(match[0]);

    // Mumbai city restriction
    if (pincode <= 400020) {
      allowAuto = false;
    }
  }

  return (
    <div>

      <h3 className="text-2xl font-semibold mb-5">
        Choose a Vehicle
      </h3>

      {/* BIKE */}
      <div onClick={()=>{
        props.setConfirmRidePanel(true);
        props.selectVehicle("moto");
      }}>
        Bike ₹{props.fare.moto}
      </div>

      {/* ✅ AUTO SHOWN ONLY WHEN ALLOWED */}
      {allowAuto && (
        <div onClick={()=>{
          props.setConfirmRidePanel(true);
          props.selectVehicle("auto");
        }}>
          Auto ₹{props.fare.auto}
        </div>
      )}

      {/* MINI */}
      <div onClick={()=>{
        props.setConfirmRidePanel(true);
        props.selectVehicle("mini");
      }}>
        Mini ₹{props.fare.mini}
      </div>

      {/* SEDAN */}
      <div onClick={()=>{
        props.setConfirmRidePanel(true);
        props.selectVehicle("sedan");
      }}>
        Sedan ₹{props.fare.sedan}
      </div>

      {/* SUV */}
      <div onClick={()=>{
        props.setConfirmRidePanel(true);
        props.selectVehicle("suv");
      }}>
        SUV ₹{props.fare.suv}
      </div>

    </div>
  );
};
console.log("Pickup:", props.pickup);
console.log("Destination:", props.destination);

export default VehiclePanel;