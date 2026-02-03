import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";



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
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const user = await res.json();

        // Save user name in localStorage
        localStorage.setItem("candidate_name", user.name);

        // Show welcome alert
        alert(`Welcome, ${user.name}!`);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    })();
  },
  onError: () => {
    console.log("Google login failed");
  },
});


  return (
    <div className="min-h-screen bg-linear-to-br from-[#baf0fb] to-[#c9f2a8] flex flex-col relative">
      {/* App Brand */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-black font-semibold">
        <div className="w-8 h-8 bg-white text-[#009688] font-bold flex items-center justify-center rounded">
          A
        </div>
        <span>Campus Recruitment Platform</span>
      </div>

      {/* Centered Login Form */}
      <div className="flex justify-center items-center flex-1 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#0f766e]">Sign in</h1>
            <p className="text-gray-600 text-sm mt-1">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-blue-600 font-medium underline"
              >
                Create Account
              </a>
            </p>
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
                className="input input-bordered w-full focus:border-[#0d9488] h-10"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary" />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-blue-600 font-medium underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Primary Sign in Button */}
            <button className="btn w-full bg-linear-to-r from-[#14b8a6] to-[#4ade80] text-white font-semibold hover:opacity-90 cursor-pointer h-10">
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
              className="btn btn-outline w-full font-medium cursor-pointer"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
