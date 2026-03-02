import { useState } from "react";
import { useNavigate } from "react-router-dom";
import awlLogo from "./Awllogo.svg";
import tempAuth from "../../data/tempAuth.json";

const ROLE_TABS = ["Candidate", "Panelist", "HR Admin", "College"];

const CampusRecruitLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const hrAdmin = tempAuth.hrAdmin;
  const candidateAuth = tempAuth.candidate;  //  ADD  this here || { email: "", password: "" }

  const handleCandidateLogin = () => {
    const matchesEmail =
      email.trim().toLowerCase() === candidateAuth.email.toLowerCase();
    const matchesPassword = password === candidateAuth.password;

    if (!matchesEmail || !matchesPassword) {
      alert("Invalid candidate credentials.");
      return;
    }

    localStorage.setItem("candidate_auth", "true");
    localStorage.setItem("candidate_name", "Candidate");
    localStorage.setItem("candidate_email", candidateAuth.email);
    localStorage.removeItem("candidate_id");
    localStorage.removeItem("hr_auth");
    localStorage.removeItem("hr_email");
    navigate("/candidate-dashboard");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (activeTab === "Candidate") {
      handleCandidateLogin();
      return;
    }

    if (activeTab === "HR Admin") {
      const isValidHrLogin =
        email.trim().toLowerCase() === hrAdmin.email.toLowerCase() &&
        password === hrAdmin.password;

      if (!isValidHrLogin) {
        alert("Invalid HR Admin credentials.");
        return;
      }

      localStorage.setItem("hr_auth", "true");
      localStorage.setItem("hr_email", hrAdmin.email);
      localStorage.removeItem("candidate_auth");
      localStorage.removeItem("candidate_name");
      localStorage.removeItem("candidate_email");
      localStorage.removeItem("candidate_id");
      navigate("/HR/dashboard");
      return;
    }

    console.log(`Logging in as ${activeTab}:`, { email, password });
  };

  return (
    <div
      className="min-h-screen bg-white text-[#0A0A0A]"
      style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
    >
      <main className="mx-auto flex min-h-screen max-w-[1275px] flex-col items-center px-4 pb-10 pt-24">
        <img src={awlLogo} alt="AWL logo" className="h-16 w-auto" />

        <h1 className="mt-8 text-center text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#001F3F]">
          AWL Recruit
        </h1>
        <p className="mt-4 text-center text-[20px] font-normal text-[#4A5565]">
          Campus Recruitment Portal
        </p>

        <section className="mt-12 w-full max-w-[448px] rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_35px_rgba(10,10,10,0.08)]">
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-[#ECECF0] p-1">
            {ROLE_TABS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveTab(role)}
                className={`rounded-[10px] px-2 py-2 text-[14px] font-medium transition-colors ${
                  activeTab === role
                    ? "bg-white text-[#0A0A0A] shadow-[0_1px_2px_rgba(10,10,10,0.08)]"
                    : "text-[#717182] hover:text-[#0A0A0A]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#0A0A0A]">
                Email ID *
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.email@example.com"
                className="h-12 w-full rounded-[10px] border border-transparent bg-[#F3F3F5] px-4 text-[14px] text-[#0A0A0A] outline-none transition-all placeholder:text-[#717182] focus:border-[#008080] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#0A0A0A]">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-12 w-full rounded-[10px] border border-transparent bg-[#F3F3F5] px-4 text-[14px] text-[#0A0A0A] outline-none transition-all placeholder:text-[#717182] focus:border-[#008080] focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-[10px] bg-[#008080] text-[16px] font-semibold text-white transition-colors hover:bg-[#006e6e]"
            >
              Login
            </button>

            <div className="text-center">
              <button type="button" className="text-[14px] font-semibold text-[#008080]">
                Forgot Password?
              </button>
            </div>
          </form>
        </section>

        <p className="mt-20 text-center text-[14px] text-[#6A7282]">
          &copy; 2026 AWL. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default CampusRecruitLogin;
