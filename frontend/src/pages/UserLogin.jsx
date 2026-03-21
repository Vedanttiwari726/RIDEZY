import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import api from "../services/api";

const UserLogin = () => {

  const navigate = useNavigate();
  const { loginUser } = useContext(UserDataContext);

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const sliderRef = useRef(null);

  const goDriver = ()=> navigate("/captain-login");

  const handleDragEnd=(e)=>{
    const rect = sliderRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;

    if(position > rect.width/2){
      goDriver();
    }
  };

  const submitHandler = async(e)=>{
    e.preventDefault();
    setLoading(true);
    setError("");

    try{

      const res = await api.post("/users/login",{
        email,
        password
      });

      loginUser(res.data.user,res.data.token);
      navigate("/home");

    }catch(err){
      setError(
        err.response?.data?.message ||
        "Login failed. Try again."
      );
    }finally{
      setLoading(false);
      setShowPassword(false);
    }
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
          onClick={goDriver}
        >
          <div className="bg-green-500 text-black
          font-semibold px-6 py-2 rounded-full">
            User →
          </div>

          <span className="ml-auto mr-4 text-sm
          text-gray-300">
            Slide for Driver
          </span>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white/5 backdrop-blur-xl
        rounded-2xl shadow-xl p-8
        border border-white/10">

          <form onSubmit={submitHandler}>

            <h2 className="text-xl font-semibold mb-5
            text-white">
              Welcome Back
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
              className="w-full bg-green-500
              hover:bg-green-400
              text-black font-semibold
              py-3 rounded-lg transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="text-center mt-5
          text-gray-400">
            New here?{" "}
            <Link
              to="/signup"
              className="text-green-400 font-medium">
              Create Account
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};

export default UserLogin;