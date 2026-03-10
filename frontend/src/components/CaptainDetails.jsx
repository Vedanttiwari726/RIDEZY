import React, { useContext } from "react";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainDetails = () => {

  const { captain } = useContext(CaptainDataContext);

  if (!captain) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading Captain...
      </div>
    );
  }

  return (
    <div className="p-6">

      <div className="flex items-center justify-between">

        <div className="flex gap-3 items-center">
          <img
            className="h-10 w-10 rounded-full"
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          />
          <h4 className="text-lg font-medium capitalize">
            {captain.fullname.firstname} {captain.fullname.lastname}
          </h4>
        </div>

        <div>
          <h4 className="text-xl font-semibold">₹0</h4>
          <p className="text-sm text-gray-600">Earned</p>
        </div>

      </div>

    </div>
  );
};

export default CaptainDetails;
