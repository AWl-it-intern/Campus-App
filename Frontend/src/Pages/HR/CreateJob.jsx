// pages/CreateJob.jsx
// Updated with React Router navigation

import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Import feature-specific components
import {
  JobFormCard,
  JobsTableHeader,
  JobTableRow,
} from "../../Components/jobs/index.js";

// Import common components
import EmptyState from "../../Components/common/EmptyState.jsx";

const API_BASE = "http://localhost:5000";

export default function CreateJob({
  onJobAssignment,
  onJobsUpdate,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDrives = location.state?.fromDrives || false;

  // Complete Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
    rainShadow: "#00988D",
  };

  // Easter Egg State - Konami Code
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [ setEasterEggActive] = useState(false);

  // State - Jobs from database
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  const [newJob, setNewJob] = useState({
    JobID: "",
    JobName: "",
  });

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const jobsRes = await axios.get(`${API_BASE}/print-jobs`);
      const jobsData = (jobsRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        assignedCandidates: doc.assignedCandidates || [],
      }));
      setJobs(jobsData);
      setJobsError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobsError("Failed to fetch jobs from database. Please try again.");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter states for Jobs Table
  const [jobSearchTerm, setJobSearchTerm] = useState("");

  // Easter Egg Functions - Defined before useEffect
  const createConfetti = () => {
    const confettiColors = [
      colors.stonewash,
      colors.softFlow,
      colors.mossRock,
      colors.marigoldFlame,
      colors.goldenHour,
    ];
    const confettiCount = 60;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";
      confetti.style.cssText = `
        position: fixed;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background-color: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
        animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
        z-index: 9999;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      `;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4500);
    }
  };

  const activateEasterEgg = () => {
    setEasterEggActive(true);
    createConfetti();

    setTimeout(() => {
      setEasterEggActive(false);
    }, 5000);
  };

  // Easter Egg Detection - Konami Code
  useEffect(() => {
    const konami = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    const handleKeyDown = (e) => {
      const newSequence = [...konamiSequence, e.key].slice(-10);
      setKonamiSequence(newSequence);

      if (newSequence.join(",") === konami.join(",")) {
        activateEasterEgg();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiSequence]);

  // Add confetti animation CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Update parent component when job assignments change
  useEffect(() => {
    if (onJobAssignment) {
      // Create a mapping of candidate ID to their assigned jobs
      const candidateJobMap = {};

      jobs.forEach((job) => {
        (job.assignedCandidates || []).forEach((candidateId) => {
          if (!candidateJobMap[candidateId]) {
            candidateJobMap[candidateId] = [];
          }
          candidateJobMap[candidateId].push(job.JobName);
        });
      });

      // Update candidates with their assigned jobs
      onJobAssignment(candidateJobMap);
    }

    // Notify parent about jobs update
    if (onJobsUpdate) {
      onJobsUpdate(jobs);
    }
  }, [jobs]);

  // Create Job Function
  const createJob = async () => {
    const jobId = newJob.JobID.trim();
    const jobName = newJob.JobName.trim();

    if (!jobId || !jobName) {
      alert("Please fill in all fields");
      return;
    }

    if (jobs.some((job) => job.JobID.toLowerCase() === jobId.toLowerCase())) {
      alert("Job ID already exists!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/job`, {
        JobID: jobId,
        JobName: jobName,
        assignedCandidates: [],
      });

      if (response.data.success) {
        setNewJob({ JobID: "", JobName: "" });
        await fetchJobs();
        alert("Job Created Successfully!");
      } else {
        alert("Failed to create job: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please check your connection and try again.");
    }
  };

  // Delete Job Function
  const deleteJob = async (jobToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${jobToDelete.JobName}" (${jobToDelete.JobID})?`,
      )
    ) {
      const jobId = jobToDelete.id || jobToDelete._id;
      if (!jobId) {
        alert("Unable to delete job: missing job id.");
        return;
      }

      try {
        const response = await axios.delete(`${API_BASE}/job/${jobId}`);
        if (response.data.success) {
          await fetchJobs();
          alert("Job deleted successfully!");
        } else {
          alert("Failed to delete job: " + (response.data.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job. Please check your connection and try again.");
      }
    }
  };

  // Filter jobs based on search
  const filteredJobs = jobs
    .filter((job) => {
      const searchLower = jobSearchTerm.toLowerCase();
      return (
        job.JobID.toLowerCase().includes(searchLower) ||
        job.JobName.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) =>
      String(a.JobID || "").localeCompare(String(b.JobID || ""), undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(
              fromDrives ? "/HR/dashboard/Drives" : "/HR/dashboard",
            )
          }
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
          ← Back to {fromDrives ? "Drive Management" : "Dashboard"}
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.stonewash }}
          >
            Manage Jobs
          </h1>
          <p className="text-gray-600">Create and manage jobs</p>
        </div>

        {/* Jobs Error Message */}
        {jobsError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <strong>Warning:</strong> {jobsError}
          </div>
        )}

        {/* Create Job Form - Using Component */}
        <JobFormCard
          newJob={newJob}
          setNewJob={setNewJob}
          createJob={createJob}
          colors={colors}
        />

        {/* Jobs Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Table Header - Using Component */}
          <JobsTableHeader
            filteredJobsCount={filteredJobs.length}
            jobSearchTerm={jobSearchTerm}
            setJobSearchTerm={setJobSearchTerm}
            colors={colors}
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Job ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Job Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Assigned Candidates
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobsLoading ? (
                  <tr>
                    <td colSpan="4" className="py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-3"></div>
                        <p className="font-medium text-gray-500">Loading jobs...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12">
                      <EmptyState
                        icon={Briefcase}
                        title="No jobs found"
                        message="Try adjusting your filters or create a new job"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <JobTableRow
                      key={job.id || job._id || job.JobID}
                      job={job}
                      deleteJob={deleteJob}
                      colors={colors}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
