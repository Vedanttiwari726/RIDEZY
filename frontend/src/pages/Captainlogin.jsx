import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

const Captainlogin = () => {

  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);

  const sliderRef = useRef(null);

  /* -------- SWITCH TO USER -------- */

  const goUser = ()=> navigate("/login");

  const handleDragEnd=(e)=>{
    const rect = sliderRef.current.getBoundingClientRect();
    const pos = e.clientX - rect.left;

    if(pos < rect.width/2){
      goUser();
    }
  };

  /* -------- LOGIN -------- */

  const submitHandler = async(e)=>{
    e.preventDefault();

    try{

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        { email,password }
      );

      if(response.status===200){

        const data = response.data;

        setCaptain(data.captain);

        localStorage.setItem("captainToken",data.token);
        localStorage.setItem(
          "captain",
          JSON.stringify(data.captain)
        );

        navigate("/captain-home",{replace:true});
      }

    }catch(err){
      alert(
        err.response?.data?.message ||
        "Login failed"
      );
    }

    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center
    bg-[#020617] px-4">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <h1 className="text-center text-4xl font-bold
        text-green-400 mb-6">
          Ridezy
        </h1>

        {/* ROLE SWITCH */}
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

        {/* LOGIN CARD */}
        <div className="bg-white/5 backdrop-blur-xl
        rounded-2xl shadow-xl p-8
        border border-white/10">

          <form onSubmit={submitHandler}>

            <h2 className="text-xl font-semibold mb-5
            text-white">
              Captain Login
            </h2>

            {/* EMAIL */}
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="input mb-4"
            />

            {/* PASSWORD */}
            <div className="relative mb-5">

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

            <button
              className="w-full bg-green-500
              hover:bg-green-400
              text-black font-semibold
              py-3 rounded-lg transition">
              Login
            </button>

          </form>

          <p className="text-center mt-5
          text-gray-400">
            Join fleet?{" "}
            <Link
              to="/captain-signup"
              className="text-green-400 font-medium">
              Register as Captain
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};

export default Captainlogin;