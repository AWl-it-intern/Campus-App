import { useState } from "react";
// import axios from "axios";

const API_BASE = "http://localhost:5000";
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;


// const [NewUsers, setNewUsers] = useState({
//     Role: "Candidate",
//     email: "",
//     password :"",
//   });

// const createUsers = async () => {
//     try {
//       await axios.post(`${API_BASE}/Users`, NewUsers);

//       alert("New User Inserted to Db Successfully!!!");

//       // clear form
//       setNewUsers({ email: "", password:""});

//     } catch (err) {
//       console.error("Error creating candidate:", err);
//       alert("Failed to create candidate");
//     }
//   };


export default function Registration() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Small abstraction: shared input styles
  const inputBase = "input input-bordered w-full focus:border-[#0d9488] h-10";

  // ✅ Same logic, untouched
  const passwordRules = {
    length: password.length >= PASSWORD_MIN,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordRules).every(Boolean);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  // ✅ Scalable rule config (logic unchanged)
  const passwordRuleList = [
    { label: "Minimum 8 characters", valid: passwordRules.length },
    { label: "One uppercase letter", valid: passwordRules.uppercase },
    { label: "One lowercase letter", valid: passwordRules.lowercase },
    { label: "One number", valid: passwordRules.number },
    { label: "One special character", valid: passwordRules.special },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#baf0fb] to-[#c9f2a8] flex flex-col relative">
      {/* App Brand */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-white font-semibold">
        <div className="w-8 h-8 bg-white text-[#009688] font-bold flex items-center justify-center rounded">
          A
        </div>
        <span>Campus Recruitment Platform</span>
      </div>

      {/* Centered Registration Form */}
      <div className="flex justify-center items-center flex-1 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#0f766e]">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 font-medium underline">
                Sign in
              </a>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                className={inputBase}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                className={inputBase}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                minLength={PASSWORD_MIN}
                maxLength={PASSWORD_MAX}
                className={inputBase}
                onChange={(e) =>
                  setPassword(e.target.value.slice(0, PASSWORD_MAX))
                }
              />

              {/* Password rules feedback */}
              <div className="text-xs mt-1 space-y-0.5">
                {passwordRuleList.map((rule) => (
                  <p
                    key={rule.label}
                    className={rule.valid ? "text-green-600" : "text-red-500"}
                  >
                    • {rule.label}
                  </p>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                minLength={PASSWORD_MIN}
                maxLength={PASSWORD_MAX}
                className={inputBase}
                onChange={(e) =>
                  setConfirmPassword(e.target.value.slice(0, PASSWORD_MAX))
                }
              />

              {/* Match feedback */}
              {confirmPassword && (
                <p
                  className={`text-xs mt-1 ${
                    passwordsMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              className="btn w-full bg-linear-to-r from-[#14b8a6] to-[#4ade80] text-white font-semibold hover:opacity-90 h-10"
              type="submit"
              disabled={!isPasswordStrong || !passwordsMatch}
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
