import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainSignup = () => {

  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const sliderRef = useRef(null);

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);

  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [phone,setPhone]=useState("");
  const [vehicleColor,setVehicleColor]=useState("");
  const [vehiclePlate,setVehiclePlate]=useState("");
  const [vehicleCapacity,setVehicleCapacity]=useState("");
  const [vehicleType,setVehicleType]=useState("bike"); // ✅ default fix

  const goUser = ()=> navigate("/signup");

  const handleDragEnd=(e)=>{
    const rect = sliderRef.current.getBoundingClientRect();
    const pos = e.clientX - rect.left;

    if(pos < rect.width/2){
      goUser();
    }
  };

  const submitHandler = async(e)=>{
    e.preventDefault();

    // ✅ VALIDATIONS ADDED
    if(!firstName || !lastName){
      return alert("Name is required");
    }

    if(!email.includes("@")){
      return alert("Invalid email");
    }

    if(phone.length !== 10 || isNaN(phone)){
      return alert("Phone must be 10 digits");
    }

    if(password.length < 6){
      return alert("Password must be at least 6 characters");
    }

    if(!vehicleColor || !vehiclePlate){
      return alert("Vehicle details required");
    }

    if(!vehicleCapacity || isNaN(vehicleCapacity)){
      return alert("Invalid vehicle capacity");
    }

    if(!vehicleType){
      return alert("Please select vehicle type");
    }

    try{

      const captainData={
        fullname:{
          firstname:firstName,
          lastname:lastName
        },
        email,
        password,
        phone,
        vehicle:{
          color:vehicleColor,
          plate:vehiclePlate,
          capacity:Number(vehicleCapacity),
          vehicleType
        }
      };

      console.log("Sending Data:", captainData); // ✅ DEBUG

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        captainData
      );

      const data = res.data;

      setCaptain(data.captain);

      localStorage.setItem("token",data.token);
      localStorage.setItem(
        "captain",
        JSON.stringify(data.captain)
      );

      navigate("/captain-home");

    }catch(err){
      console.log(err.response); // ✅ DEBUG

      alert(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Signup failed"
      );
    }

    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center
    bg-[#020617] px-4">

      <div className="w-full max-w-md">

        <h1 className="text-center text-4xl font-bold
        text-green-400 mb-6">
          Ridezy
        </h1>

        <div
          ref={sliderRef}
          className="relative flex items-center
          bg-white/10
          rounded-full p-1 mb-6 cursor-pointer"
          onMouseUp={handleDragEnd}
          onTouchEnd={(e)=>
            handleDragEnd(e.changedTouches[0])
          }
          onClick={goUser}
        >
          <span className="ml-4 text-sm
          text-gray-300">
            Slide for User
          </span>

          <div className="ml-auto bg-green-500
          text-black font-semibold
          px-6 py-2 rounded-full">
            ← Driver
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl
        rounded-2xl shadow-xl p-8
        border border-white/10">

          <form onSubmit={submitHandler}>

            <h2 className="text-xl font-semibold mb-5
            text-white">
              Captain Registration
            </h2>

            <div className="flex gap-3 mb-4">
              <input
                required
                placeholder="First Name"
                value={firstName}
                onChange={e=>setFirstName(e.target.value)}
                className="input"
              />

              <input
                required
                placeholder="Last Name"
                value={lastName}
                onChange={e=>setLastName(e.target.value)}
                className="input"
              />
            </div>

            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              className="input mb-4"
            />

            <input
              required
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={e=>setPhone(e.target.value)}
              className="input mb-4"
            />

            <div className="relative mb-4">

              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="input pr-12"
              />

              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2
                -translate-y-1/2 text-xl"
              >
                {showPassword ? "🙉" : "🙈"}
              </button>

            </div>

            <div className="flex gap-3 mb-4">
              <input
                required
                placeholder="Vehicle Color"
                value={vehicleColor}
                onChange={e=>setVehicleColor(e.target.value)}
                className="input"
              />

              <input
                required
                placeholder="Plate Number"
                value={vehiclePlate}
                onChange={e=>setVehiclePlate(e.target.value)}
                className="input"
              />
            </div>

            <div className="flex gap-3 mb-6">
              <input
                required
                type="number"
                placeholder="Capacity"
                value={vehicleCapacity}
                onChange={e=>setVehicleCapacity(e.target.value)}
                className="input"
              />

              <select
                required
                value={vehicleType}
                onChange={e=>setVehicleType(e.target.value)}
                className="input"
              >
                <option value="">Vehicle</option>
                <option value="bike">Bike</option>
                <option value="auto">Auto</option>
                <option value="mini">Mini</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
              </select>
            </div>

            <button
              className="w-full bg-green-500
              hover:bg-green-400
              text-black font-semibold
              py-3 rounded-lg transition">
              Create Captain Account
            </button>

          </form>

          <p className="text-center mt-5
          text-gray-400">
            Already registered?{" "}
            <Link
              to="/captain-login"
              className="text-green-400 font-medium">
              Login
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};

export default CaptainSignup;