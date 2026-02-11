import axios from "axios";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const API_BASE = "http://localhost:5000";

export default function AdminActions() {
  const [userCount, setUserCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ---------------- Fetch Counts ---------------- */

  const fetchCounts = async () => {
    try {
      const usersRes = await axios.get(`${API_BASE}/print-candidates`);
      const jobsRes = await axios.get(`${API_BASE}/print-jobs`);

      const users = usersRes.data.data || [];
      const jobs = jobsRes.data.data || [];

      setUserCount(users.length);
      setJobCount(jobs.length);
    } catch (err) {
      console.error("Error fetching dashboard counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex bg-green-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-semibold text-green-800 mb-8">
          HR Dashboard
        </h1>

        {loading ? (
          <div className="text-center text-green-700">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Users Card */}
            <div className="bg-white rounded-xl shadow p-6 text-center border border-green-200">
              <h2 className="text-xl font-medium text-green-700 mb-2">
                👤 Current Users
              </h2>
              <p className="text-4xl font-bold text-green-800">{userCount}</p>
            </div>

            {/* Jobs Card */}
            <div className="bg-white rounded-xl shadow p-6 text-center border border-green-200">
              <h2 className="text-xl font-medium text-green-700 mb-2">
                💼 Current Jobs
              </h2>
              <p className="text-4xl font-bold text-green-800">{jobCount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
