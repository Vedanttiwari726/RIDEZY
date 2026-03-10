import React from "react";
import { useAppSettings } from "../context/AppSettingContext";
import { translations } from "../utils/translations";

const RideRequestCard = ({ ride, timer, onAccept, onReject }) => {

  const { language } = useAppSettings();

  const t =
    translations[language] ||
    translations.english;

  if (!ride) return null;

  const percent = Math.max(0,(timer/15)*100);

  const pickup =
    ride?.pickup?.address ||
    ride?.pickup ||
    "";

  const destination =
    ride?.destination?.address ||
    ride?.destination ||
    "";

  const userBid = ride?.userBid ?? ride?.fare ?? 0;

  /* ⭐ DRIVER EARNING PREVIEW */

  const driverEarning =
    Math.round(userBid * 0.4);

  return (
    <div className="
    fixed left-0 right-0 top-24
    flex justify-center
    z-[9999]
    animate-slideUp">

      <div className="
      w-[92%] max-w-md rounded-3xl
      bg-gradient-to-br
      from-[#111] to-[#1c1c1c]
      dark:from-neutral-900 dark:to-black
      border border-white/10
      shadow-[0_25px_80px_rgba(0,0,0,0.8)]
      backdrop-blur-xl
      p-6 text-white">

        {/* TITLE */}

        <h2 className="text-xl font-semibold text-center mb-3">
          {t.newRideRequest}
        </h2>


        {/* TIMER */}

        <div className="text-center text-3xl font-bold mb-3">
          00:{timer.toString().padStart(2,"0")}
        </div>


        {/* PROGRESS */}

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-5">
          <div
            style={{ width: `${percent}%` }}
            className="
            h-full
            bg-gradient-to-r
            from-green-400 to-lime-400
            transition-all duration-1000"
          />
        </div>


        {/* RIDE INFO */}

        <div className="space-y-3 text-sm">

          <div className="flex gap-2 items-start">
            📍
            <p>
              <span className="text-gray-400">
                {t.pickup}:
              </span>{" "}
              {pickup}
            </p>
          </div>

          <div className="flex gap-2 items-start">
            🎯
            <p>
              <span className="text-gray-400">
                {t.destination}:
              </span>{" "}
              {destination}
            </p>
          </div>


          {/* ⭐ USER OFFER */}

          <div className="
          flex gap-2 items-center
          text-lg font-bold text-green-400">

            💰 User Offer: ₹{userBid}

          </div>


          {/* SUGGESTED FARE */}

          <div className="
          flex gap-2 items-center
          text-sm text-gray-400">

            Suggested Fare: ₹{ride.fare}

          </div>


          {/* DRIVER EARNING */}

          <div className="
          flex gap-2 items-center
          text-sm text-yellow-400">

            Driver Earn: ~₹{driverEarning}

          </div>

        </div>


        {/* ACTION BUTTONS */}

        <div className="flex gap-3 mt-6">

          <button
            onClick={onAccept}
            className="
            flex-1 py-3 rounded-xl
            bg-gradient-to-r
            from-green-500 to-emerald-600
            font-semibold
            shadow-lg shadow-green-500/40
            active:scale-95
            transition"
          >
            {t.accept}
          </button>

          <button
            onClick={onReject}
            className="
            flex-1 py-3 rounded-xl
            bg-gradient-to-r
            from-red-500 to-rose-600
            font-semibold
            shadow-lg shadow-red-500/40
            active:scale-95
            transition"
          >
            {t.reject}
          </button>

        </div>

      </div>

    </div>
  );
};

export default RideRequestCard;