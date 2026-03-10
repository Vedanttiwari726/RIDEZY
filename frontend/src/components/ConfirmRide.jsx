import React, { useState } from "react";

const ConfirmRide = (props) => {

  /* ================= SURGE LOGIC ================= */

  const baseFare =
    props.fare?.[props.vehicleType] || 0;

  const surge =
    props.surgeMultiplier || 1;

  const finalFare =
    Math.round(baseFare * surge);


  /* ================= USER BID ================= */

  const defaultBid =
    props.vehicleType === "bike" ? 20 : 30;

  const [userBid,setUserBid] =
    useState(defaultBid);


  /* ================= CONFIRM RIDE ================= */

  const confirmRide = () => {

    const bid = Number(userBid);

    if(!bid || bid <= 0){
      alert("Please enter valid bid price");
      return;
    }

    if(bid < defaultBid){
      alert(
        `Minimum bid for ${props.vehicleType} is ₹${defaultBid}`
      );
      return;
    }

    const pickupText =
      props.pickup?.toString() || "";

    const match =
      pickupText.match(/\b\d{6}\b/);

    /* AUTO SAFETY */

    if(match && props.vehicleType === "auto"){

      const pincode = parseInt(match[0]);

      if(pincode < 400070){
        alert(
          "Auto service is not available in this area."
        );
        return;
      }

    }

    props.setVehicleFound(true);
    props.setConfirmRidePanel(false);

    /* ⭐ USER BID PASS */

    props.createRide({
      userBid: bid
    });

  };


  return (
    <div>

      <h5
      className="p-1 text-center w-[93%] absolute top-0"
      onClick={()=>props.setConfirmRidePanel(false)}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>


      <h3 className="text-2xl font-semibold mb-5">
        Confirm your Ride
      </h3>


      <div className="flex gap-2 justify-between flex-col items-center">

        <img
        className="h-20"
        src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
        alt=""
        />


        <div className="w-full mt-5">

          {/* PICKUP */}

          <div className="flex items-center gap-5 p-3 border-b-2">

            <i className="ri-map-pin-user-fill"></i>

            <div>
              <h3 className="text-lg font-medium">
                Pickup
              </h3>

              <p className="text-sm -mt-1 text-gray-600">
                {props.pickup}
              </p>
            </div>

          </div>


          {/* DESTINATION */}

          <div className="flex items-center gap-5 p-3 border-b-2">

            <i className="ri-map-pin-2-fill"></i>

            <div>
              <h3 className="text-lg font-medium">
                Destination
              </h3>

              <p className="text-sm -mt-1 text-gray-600">
                {props.destination}
              </p>
            </div>

          </div>


          {/* BASE FARE */}

          <div className="flex items-center gap-5 p-3 border-b-2">

            <i className="ri-money-rupee-circle-line"></i>

            <div>
              <h3 className="text-lg font-medium">
                ₹{baseFare}
              </h3>

              <p className="text-sm -mt-1 text-gray-600">
                Base Fare
              </p>
            </div>

          </div>


          {/* SURGE */}

          {surge > 1 && (

            <div className="flex items-center gap-5 p-3 border-b-2">

              <i className="ri-fire-fill text-orange-500"></i>

              <div>

                <h3 className="text-lg font-medium text-orange-500">
                  x{surge}
                </h3>

                <p className="text-sm -mt-1 text-gray-600">
                  High demand pricing
                </p>

              </div>

            </div>

          )}


          {/* SUGGESTED FARE */}

          <div className="flex items-center gap-5 p-3 border-b-2">

            <i className="ri-currency-line"></i>

            <div>

              <h3 className="text-xl font-semibold text-green-600">
                ₹{finalFare}
              </h3>

              <p className="text-sm -mt-1 text-gray-600">
                Suggested Fare
              </p>

            </div>

          </div>


          {/* USER OFFER */}

          <div className="flex items-center gap-5 p-3">

            <i className="ri-hand-coin-line"></i>

            <div className="w-full">

              <h3 className="text-lg font-medium">
                Your Offer
              </h3>

              <input
              type="number"
              value={userBid}
              min={defaultBid}
              onChange={(e)=>
                setUserBid(e.target.value)
              }
              className="border rounded-lg p-2 w-full mt-1"
              />

              <p className="text-xs text-gray-500 mt-1">
                Minimum ₹{defaultBid}
              </p>

            </div>

          </div>

        </div>


        <button
        onClick={confirmRide}
        className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg"
        >
          Confirm Ride
        </button>

      </div>

    </div>
  );
};

export default ConfirmRide;