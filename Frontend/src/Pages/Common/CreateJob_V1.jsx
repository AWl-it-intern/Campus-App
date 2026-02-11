import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function CreateJob() {
  const [jobs, setJobs] = useState([]);

  const [newJob, setNewJob] = useState({
    JobID: "",
    JobName: "",
  });

  /* ---------------- Insert Function ---------------- */

  const createJob = async () => {
    try {
      await axios.post(`${API_BASE}/job`, newJob);

      alert("Job Created Successfully");

      // clear form
      setNewJob({ JobID: "", JobName: "" });

      // refresh table
      fetchJobs();
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Failed to create job");
    }
  };

  /* ---------------- Fetch Function ---------------- */

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/print-jobs`);
      setJobs(res.data.data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    fetchJobs();
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div>
      {/* Create Job Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={createJob}
          className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          Create Job
        </button>
      </div>

      {/* Job Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input
          className="border rounded px-3 py-2"
          placeholder="Job ID"
          value={newJob.JobID}
          onChange={(e) => setNewJob({ ...newJob, JobID: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Job Name"
          value={newJob.JobName}
          onChange={(e) => setNewJob({ ...newJob, JobName: e.target.value })}
        />
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-green-200 rounded-lg">
          <thead className="bg-green-100">
            <tr>
              <th className="px-4 py-2 border">JobID</th>
              <th className="px-4 py-2 border">JobName</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-4 text-gray-500 text-center">
                  No data found
                </td>
              </tr>
            ) : (
              jobs.map((a, index) => (
                <tr key={index} className="hover:bg-green-50">
                  <td className="px-4 py-2 border">{a.JobID}</td>
                  <td className="px-4 py-2 border">{a.JobName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
