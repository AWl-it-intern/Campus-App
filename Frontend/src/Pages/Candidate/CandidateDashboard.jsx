import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CandidateDashboard = () => {
   // Show welcome alert
  const navigate = useNavigate();
  const [candidateName, setCandidateName] = useState("");

  // Logic preserved exactly as requested
  useEffect(() => {
    const interval = setInterval(() => {
      const name = localStorage.getItem("candidate_name");
      if (name) {
        setCandidateName(name);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  //  alert(`Welcome, ${name}!`);  

  const handleLogout = () => {
    localStorage.removeItem("candidate_auth");
    localStorage.removeItem("candidate_name");
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-gray-50 text-base-content font-sans"
      data-theme="campusRecruit"
    >
      {/* Clean Professional Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Campus Recruit
              </h1>
              <p className="text-xs text-gray-500">Hiring Made Simple</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-600">
                Welcome,{" "}
                <span className="font-semibold text-gray-900">
                  {candidateName || "Candidate"}
                </span>
              </p>
              <p className="text-xs text-gray-500">Candidate Portal</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 normal-case font-medium"
            >
              <svg
                className="h-4 w-4"
                fill="none" 
                viewBox="0 0 24 24"
                stroke="red"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Status Update Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <div className="p-2 bg-blue-500 rounded-lg text-white shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill= "none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">
              Status Update: Results Pending
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Your PI Round assessment is complete. Hang tight!
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Profile Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase">
                Application Profile
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Institution
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  IIT Delhi
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Department
                </span>
                <span className="text-sm font-semibold text-gray-900">CSE</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Academic Score
                </span>
                <span className="text-sm font-bold text-black">85.5%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Submitted
                </span>
                <span className="text-sm text-gray-700">15 Jan 2026</span>
              </div>
            </div>
          </div>

          {/* Assessment Scores Card - Merged */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase">
                  Assessment Scores
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Aptitude Test */}
                <div className="pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Aptitude Test
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        85<span className="text-base text-gray-400">/100</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>

                {/* Group Discussion */}
                <div className="pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Group Discussion
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Assessed by Panelist name
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        26<span className="text-base text-gray-400">/30</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "86.67%" }}
                    ></div>
                  </div>
                </div>

                {/* Personal Interview */}
                <div className="pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Personal Interview
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Assessed by Panelist name
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        40<span className="text-base text-gray-400">/45</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "88.89%" }}
                    ></div>
                  </div>
                </div>

                {/* Recommendation Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase">
                      Panel Recommendation
                    </h3>
                    <span className="badge bg-success text-white border-0 font-semibold px-3">
                      SELECT
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    "Excellent problem-solving skills. Strong technical
                    foundation. Shows great potential for leadership roles."
                  </p>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-xs font-semibold text-success">
                      ✓ Processed to Next Round
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Progress Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase">
                  Journey Progress
                </h2>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between relative">

                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-green-600 z-10"
                    style={{ width: "80%" }}
                  ></div>

                  {/* Step 1: Submitted */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mb-2">
                      <svg
                        className="h-5 w-5"
                        fill= "none"
                        viewBox="0 0 24 24"
                       stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">
                      Submitted
                    </p>
                  </div>

                  {/* Step 2: Shortlisted */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">
                      Shortlisted
                    </p>
                  </div>

                  {/* Step 3: GD Round */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">
                      GD Round
                    </p>
                  </div>

                  {/* Step 4: PI Round */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">
                      PI Round
                    </p>
                  </div>

                  {/* Step 5: Result */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mb-2">
                      <span className="text-lg">?</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500">
                      Result
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-gray-400 text-xs border-t border-gray-200 mt-8">
          © 2026 Campus Recruit Infrastructure. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default CandidateDashboard;
