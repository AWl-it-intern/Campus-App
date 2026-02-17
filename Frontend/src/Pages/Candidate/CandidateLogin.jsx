import React, { useState } from 'react';
import awlLogo from "./Awllogo.svg"; 

/**
 * AWL Campus Recruitment Portal - Login Component
 * Date: February 13, 2026
 * Description: A centralized authentication hub for Candidates, Panelists, HR Admins, and Colleges.
 */

const CampusRecruitLogin = () => {
  const [activeTab, setActiveTab] = useState('Candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const roles = ['Candidate', 'Panelist', 'HR Admin', 'College'];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Logging in as ${activeTab}:`, { email, password });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      {/* Header Section */}
      <header className="pt-16 pb-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <img src={awlLogo} alt="image not found" />
          {/* Titles */}
          <div className="mt-6">
            <h2 className="text-3xl font-extrabold text-[#0f172a]">AWL Recruit</h2>
            <p className="text-slate-400 font-medium mt-1">Campus Recruitment Portal</p>
          </div>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="grow flex items-start justify-center px-4 pt-4">
        <div className="w-full max-w-112.5 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* DaisyUI Role Tabs */}
          <div className="tabs tabs-boxed bg-slate-100 rounded-none p-1 grid grid-cols-4">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`tab tab-md transition-all duration-200 ${
                  activeTab === role 
                  ? "tab-active bg-white text-[#008080] font-bold shadow-sm rounded-2xl" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-slate-700 text-sm">Email ID</span>
                </label>
                <input 
                  type="email" 
                  placeholder=" your.email@example.com" 
                  className="input input-bordered w-full bg-slate-50 border-slate-200 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-slate-700 text-sm">Password</span>
                </label>
                <input 
                  type="password" 
                  placeholder="........" 
                  className="input input-bordered w-full bg-slate-50 border-slate-200 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="btn w-full bg-[#008080] hover:bg-[#006666] text-white border-none normal-case text-base font-bold h-12 shadow-lg transition-transform active:scale-95"
            >
              Login Securely
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <a href="#" className="text-sm font-medium text-[#008080] hover:underline decoration-2 underline-offset-4">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="py-8 text-center">
        <p className="text-slate-400 text-sm italic font-light">
          &copy; 2026 AWL. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default CampusRecruitLogin;
