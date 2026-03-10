import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { UserDataContext } from "../context/UserContext";

const UserSignup = () => {

  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);

  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  /* -------- SLIDER -------- */

  const sliderRef = useRef(null);

  const goDriver = ()=> navigate("/driver/signup");

  const handleDragEnd=(e)=>{
    const rect = sliderRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;

    if(position > rect.width/2){
      goDriver();
    }
  };

  /* -------- SIGNUP -------- */

  const submitHandler = async(e)=>{
    e.preventDefault();
    setLoading(true);
    setError("");

    try{

      const res = await api.post("/users/register",{
        fullname:{
          firstname:firstName,
          lastname:lastName
        },
        email,
        password
      });

      const data = res.data;

      setUser(data.user);
      localStorage.setItem("token",data.token);

      navigate("/home");

    }catch(err){
      setError(
        err.response?.data?.message ||
        "Signup failed. Try again."
      );
    }finally{
      setLoading(false);
      setShowPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
    bg-gray-100 dark:bg-black px-4">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <h1 className="text-center text-4xl font-bold
        text-yellow-500 mb-6">
          Ridezy
        </h1>

        {/* ROLE SLIDER */}
        <div
          ref={sliderRef}
          className="relative flex items-center
          bg-gray-200 dark:bg-gray-800
          rounded-full p-1 mb-6 cursor-pointer"
          onMouseUp={handleDragEnd}
          onTouchEnd={(e)=>
            handleDragEnd(e.changedTouches[0])
          }
          onClick={goDriver}
        >
          <div
            className="bg-yellow-500 text-black
            font-semibold px-6 py-2 rounded-full">
            User →
          </div>

          <span className="ml-auto mr-4 text-sm
          text-gray-600 dark:text-gray-300">
            Slide for Driver
          </span>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900
        rounded-2xl shadow-xl p-8
        border dark:border-gray-800">

          <form onSubmit={submitHandler}>

            <h2 className="text-xl font-semibold mb-4
            text-gray-800 dark:text-white">
              Create Account
            </h2>

            {/* NAME */}
            <div className="flex gap-3 mb-4">
              <input
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e)=>setFirstName(e.target.value)}
                className="input"
              />

              <input
                required
                placeholder="Last Name"
                value={lastName}
                onChange={(e)=>setLastName(e.target.value)}
                className="input"
              />
            </div>

            {/* EMAIL */}
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="input mb-4"
            />

            {/* PASSWORD WITH MONKEY */}
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

            {error && (
              <p className="text-red-500 text-sm mb-3">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full bg-yellow-500
              hover:bg-yellow-400
              text-black font-semibold
              py-3 rounded-lg transition"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

          </form>

          <p className="text-center mt-5
          text-gray-600 dark:text-gray-400">
            Already have account?{" "}
            <Link
              to="/login"
              className="text-yellow-500 font-medium">
              Login
            </Link>
          </p>
        </div>

        <p className="text-xs text-center mt-6 text-gray-500">
          Protected by Ridezy security system
        </p>

      </div>
    </div>
  );
};

export default UserSignup;