// pages/CreateJob.jsx
// Updated with React Router navigation

import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Import feature-specific components
import {
  JobFormCard,
  JobsTableHeader,
  JobTableRow,
  AssignCandidatesModal,
} from "../../Components/jobs/index.js";

// Import common components
import EmptyState from "../../Components/common/EmptyState.jsx";

export default function CreateJob({
  onJobAssignment,
  onJobsUpdate,
}) {
  // Hardcoded candidate values
  const candidates = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Charlie Lee", email: "charlie@example.com" },
    { id: 4, name: "Diana Patel", email: "diana@example.com" },
    { id: 5, name: "Ethan Brown", email: "ethan@example.com" },
    { id: 6, name: "Fiona Green", email: "fiona@example.com" },
    { id: 7, name: "George White", email: "george@example.com" },
    { id: 8, name: "Hannah Black", email: "hannah@example.com" },
    { id: 9, name: "Ian Blue", email: "ian@example.com" },
    { id: 10, name: "Julia Red", email: "julia@example.com" },
  ];
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

  // State - Jobs with some candidates assigned to multiple jobs
  const [jobs, setJobs] = useState([
    {
      JobID: "JOB001",
      JobName: "Software Engineer",
      assignedCandidates: [1, 2, 7],
    },
    { JobID: "JOB002", JobName: "Data Analyst", assignedCandidates: [2, 3, 8] },
    { JobID: "JOB003", JobName: "Product Manager", assignedCandidates: [4] },
    { JobID: "JOB004", JobName: "UI/UX Designer", assignedCandidates: [5, 9] },
    {
      JobID: "JOB005",
      JobName: "DevOps Engineer",
      assignedCandidates: [1, 7, 10],
    },
    {
      JobID: "JOB006",
      JobName: "Business Analyst",
      assignedCandidates: [2, 6],
    },
  ]);

  const [newJob, setNewJob] = useState({
    JobID: "",
    JobName: "",
  });

  // Filter states for Jobs Table
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobCandidateFilter, setJobCandidateFilter] = useState("");
  const [showMultipleJobsOnly, setShowMultipleJobsOnly] = useState(false);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCandidatesForAssignment, setSelectedCandidatesForAssignment] =
    useState([]);

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
        job.assignedCandidates.forEach((candidateId) => {
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
  const createJob = () => {
    if (!newJob.JobID || !newJob.JobName) {
      alert("Please fill in all fields");
      return;
    }

    if (jobs.some((job) => job.JobID === newJob.JobID)) {
      alert("Job ID already exists!");
      return;
    }

    setJobs([...jobs, { ...newJob, assignedCandidates: [] }]);
    setNewJob({ JobID: "", JobName: "" });
    alert("Job Created Successfully!");
  };

  // Open Assignment Modal
  const openAssignModal = (job) => {
    setSelectedJob(job);
    setSelectedCandidatesForAssignment(job.assignedCandidates);
    setShowAssignModal(true);
  };

  // Toggle candidate selection in modal
  const toggleCandidateSelection = (candidateId) => {
    if (selectedCandidatesForAssignment.includes(candidateId)) {
      setSelectedCandidatesForAssignment(
        selectedCandidatesForAssignment.filter((id) => id !== candidateId),
      );
    } else {
      setSelectedCandidatesForAssignment([
        ...selectedCandidatesForAssignment,
        candidateId,
      ]);
    }
  };

  // Save assignments
  const saveAssignments = () => {
    setJobs(
      jobs.map((job) =>
        job.JobID === selectedJob.JobID
          ? { ...job, assignedCandidates: selectedCandidatesForAssignment }
          : job,
      ),
    );
    setShowAssignModal(false);
    setSelectedJob(null);
    setSelectedCandidatesForAssignment([]);
    alert("Job assignments updated successfully!");
  };

  // Delete Job Function
  const deleteJob = (jobToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${jobToDelete.JobName}" (${jobToDelete.JobID})?`,
      )
    ) {
      setJobs(jobs.filter((job) => job.JobID !== jobToDelete.JobID));
      alert("Job deleted successfully!");
    }
  };

  // Get candidate name by ID
  const getCandidateName = (id) => {
    const candidate = candidates.find((c) => c.id === id);
    return candidate ? candidate.name : "Unknown";
  };

  // Get candidate info by ID
  const getCandidateInfo = (id) => {
    return candidates.find((c) => c.id === id);
  };

  // Get jobs for a specific candidate
  const getJobsForCandidate = (candidateId) => {
    return jobs.filter((job) => job.assignedCandidates.includes(candidateId));
  };

  // Get avatar color based on ID
  const getAvatarColor = (id) => {
    const avatarColors = [
      colors.softFlow,
      colors.mossRock,
      colors.goldenHour,
      colors.marigoldFlame,
      colors.clayPot,
    ];
    return avatarColors[id % avatarColors.length];
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const searchLower = jobSearchTerm.toLowerCase();
    const matchesSearch =
      job.JobID.toLowerCase().includes(searchLower) ||
      job.JobName.toLowerCase().includes(searchLower);

    const matchesCandidate =
      jobCandidateFilter === "" ||
      job.assignedCandidates.some((id) => {
        const name = getCandidateName(id);
        return name.toLowerCase().includes(jobCandidateFilter.toLowerCase());
      });

    const matchesMultiple =
      !showMultipleJobsOnly || job.assignedCandidates.length > 1;

    return matchesSearch && matchesCandidate && matchesMultiple;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(
              fromDrives ? "/Admin/dashboard/Drives" : "/Admin/dashboard",
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
          <p className="text-gray-600">Create jobs and assign candidates</p>
        </div>


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
            jobCandidateFilter={jobCandidateFilter}
            setJobCandidateFilter={setJobCandidateFilter}
            showMultipleJobsOnly={showMultipleJobsOnly}
            setShowMultipleJobsOnly={setShowMultipleJobsOnly}
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
                {filteredJobs.length === 0 ? (
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
                      key={job.JobID}
                      job={job}
                      getCandidateInfo={getCandidateInfo}
                      getCandidateName={getCandidateName}
                      getAvatarColor={getAvatarColor}
                      openAssignModal={openAssignModal}
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

      {/* Assignment Modal - Using Component */}
      <AssignCandidatesModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedJob={selectedJob}
        candidates={candidates}
        selectedCandidates={selectedCandidatesForAssignment}
        toggleCandidateSelection={toggleCandidateSelection}
        saveAssignments={saveAssignments}
        getJobsForCandidate={getJobsForCandidate}
        getAvatarColor={getAvatarColor}
        colors={colors}
      />
    </div>
  );
}
