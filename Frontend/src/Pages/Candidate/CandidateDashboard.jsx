import { Link,useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";



export default function CandidateDashboard() {
  const navigate = useNavigate();


  const [candidateName, setCandidateName] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const name = localStorage.getItem("candidate_name");
      if (name) {
        setCandidateName(name);
        clearInterval(interval); // Stop polling once name is set
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  return (
    <div className="min-h-screen bg-linear-to-br from-[#baf0fb] to-[#c9f2a8] flex flex-col">

      {/* Top bar */}
      <div className="flex justify-between items-center p-4">
        {/* App brand */}
        <div className="flex items-center gap-2 text-black font-semibold">
          <div className="w-8 h-8 bg-white text-[#009688] font-bold flex items-center justify-center rounded">A</div>
          <span>Campus Recruitment Platform</span>
        </div>

        {/* Welcome */}
        <div className="text-black font-semibold">
          Welcome, {candidateName || "Candidate"}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row justify-center items-start mt-6 px-4 gap-6">

        {/* Left: Candidate details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full md:w-2/3">
          <h1 className="text-2xl font-bold text-[#0f766e] mb-2">Candidate Dashboard</h1>
          <p className="text-gray-600 mb-4">
            Here you can view your application status, upcoming rounds, and messages.
          </p>

          {/* Example placeholder card */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
            <h2 className="font-semibold text-gray-700 mb-2">Application Status</h2>
            <p className="text-gray-500">Your application is under review. Stay tuned for updates!</p>
          </div>
        </div>

        {/* Right: Selection process */}
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full md:w-64">
          <h2 className="text-xl font-bold text-[#0f766e] mb-4">Selection Process</h2>

          <div className="space-y-3">

            <Link to="/candidate/application">
              <div className="border rounded-lg p-2 flex items-center cursor-pointer hover:bg-gray-100">
                <div className="border w-8 h-8 flex items-center justify-center mr-2 rounded-full bg-gray-50">
                  1
                </div>
                <span>Application Submission</span>
              </div>
            </Link>

            <div className="border rounded-lg p-2 flex items-center">
              <div className="border w-8 h-8 flex items-center justify-center mr-2 rounded-full bg-gray-50">
                2
              </div>
              <span>Aptitude Round</span>
            </div>

            <div className="border rounded-lg p-2 flex items-center">
              <div className="border w-8 h-8 flex items-center justify-center mr-2 rounded-full bg-gray-50">
                3
              </div>
              <span>GD Round</span>
            </div>

            <div className="border rounded-lg p-2 flex items-center">
              <div className="border w-8 h-8 flex items-center justify-center mr-2 rounded-full bg-gray-50">
                4
              </div>
              <span>PI Round</span>
            </div>

            <div className="border rounded-lg p-2 flex items-center">
              <div className="border w-8 h-8 flex items-center justify-center mr-2 rounded-full bg-gray-50">
                5
              </div>
              <span>Final Result</span>
            </div>

          </div>
        </div>
      </div>

       <button
      className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
      onClick={() => {
        localStorage.removeItem("candidate_auth");
navigate("/");         
      }}
    >
      Logout
    </button>

    </div>
  );
}
