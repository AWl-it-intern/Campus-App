import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import bg1 from "./AWL_BG.jpg";
import logo from "./newlogo.jpg";
import bg2 from "./img117.jpg";
import { useState, useEffect } from "react";

export default function Login() {
  // login with google logic:
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google login success:", tokenResponse);

      // ✅ Set login flag
      localStorage.setItem("candidate_auth", "true");

      // ✅ Redirect to dashboard first
      navigate("/candidate-dashboard");

      // ✅ Fetch user info
      (async () => {
        try {
          const res = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            },
          );
          const user = await res.json();

          // Save user name in localStorage
          localStorage.setItem("candidate_name", user.name);
        } catch (err) {
          console.error("Failed to fetch user info", err);
        }
      })();
    },
    onError: () => {
      console.log("Google login failed");
    },
  });

const backgrounds = [bg1, bg2]; // add/remove as you like
const [bgIndex, setBgIndex] = useState(0);
const [fade, setFade] = useState(true);

useEffect(() => {
  const interval = setInterval(() => {
    setFade(false);
    setTimeout(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
      setFade(true);
    }, 400);
  }, 5000); // change image every 5 seconds

  return () => clearInterval(interval);
}, [backgrounds.length]);


  return (
   <div className="min-h-screen flex flex-col relative overflow-hidden">
  {/* Animated Background */}
  <div
    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
      fade ? "opacity-100" : "opacity-0"
    }`}
    style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
  />

  {/* Content Layer */}
  <div className="relative z-10 min-h-screen flex flex-col">

      {/* App Brand */}
      <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
        <img
          src={logo} // or "/logo.jpg" if from public folder
          alt="Campus Recruitment Platform Logo"
          className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
        />
        <span className="text-lg md:text-xl font-bold text-[#003329] tracking-wide">
          Campus Recruitment Platform
        </span>
      </div>

      {/* Split Layout */}
      <div className="flex flex-1">
        {/* Left: Login Panel */}
        <div className="w-full md:w-1/3 flex items-center justify-center px-8 bg-white/20 backdrop-blur-md border-r border-white/30">
          <div className="rounded-2xl shadow-2xl p-8 w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/30">
            {/* Title */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-[#0f766e]">Sign in</h1>
            </div>

            {/* Form */}
            <form className="space-y-4">
              {/* Email */}
              <div className="flex flex-col">
                <label className="text-gray-700 text-sm mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="input input-bordered w-full focus:border-[#0d9488] h-10"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="text-gray-700 text-sm mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="input input-bordered w-full focus:border-[#0d9488] h-10 "
                />
              </div>

              {/*Forgot */}
              <div className="flex justify-between items-center text-sm">
                <a
                  href="/forgot-password"
                  className="text-blue-600 font-medium underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Primary Sign in Button */}
              <button
                onClick={() => {}}
                className="btn w-full bg-linear-to-r from-[#14b8a6] to-[#4ade80] text-white font-semibold hover:opacity-90 cursor-pointer h-10"
              >
                Sign in
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Secondary Sign in */}
              <button
                type="button"
                onClick={() => {
                  googleLogin();
                }}
               className="btn w-full bg-linear-to-r bg-white text-black font-semibold hover:opacity-90 cursor-pointer h-10 "
              >
                Sign in with Google
              </button>
            </form>
          </div>
        </div>

        {/* Right: Background visible */}
        <div className="hidden md:block w-1/2"></div>
      </div>
    </div>
    </div>
  );
}
