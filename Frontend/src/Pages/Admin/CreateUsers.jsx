// pages/CreateUsers.jsx
// Updated with React Router navigation

import { useEffect, useState, useMemo} from "react";
import { Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Import feature-specific components
import {
  UserFormCard,
  UsersTableHeader,
  UserTableRow,
} from "../../Components/users/index.js";

// Import common components
import EmptyState from "../../Components/common/EmptyState.jsx";

const API_BASE = "http://localhost:5000";

export default function CreateUsers({ drives = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDrives = location.state?.fromDrives || false;

  // Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

const [candidates, setCandidates] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    college: "",
    AssignedJob: "",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");

  /* ---------------- Insert Functions ---------------- */

 const createCandidate = async () => {
  if (!newUser.name || !newUser.email || !newUser.college) {
    alert("Please fill in Name, Email, and College fields");
    return;
  }

  try {
    const res = await axios.post(`${API_BASE}/candidate`, newUser);

    // Assuming backend returns created candidate in res.data.data
    const createdCandidate = res.data.data;

    setCandidates((prev) => [...prev, createdCandidate]);

    alert("New Candidate Inserted Successfully!");

    setNewUser({
      name: "",
      email: "",
      college: "",
      AssignedJob: "",
    });

  } catch (err) {
    console.error("Error creating candidate:", err);
    alert("Failed to create candidate");
  }
};

  // ---------------------------Delete func---------------
  const deleteCandidate = async (candidateId) => {
  try {
    await axios.delete(`${API_BASE}/candidate/${candidateId}`);

    setCandidates((prev) =>
      prev.filter((candidate) => candidate._id !== candidateId)
    );

    alert("Candidate Deleted Successfully!");
  } catch (err) {
    console.error("Error deleting candidate:", err);
    alert("Failed to delete candidate");
  }
};


  /* ---------------- Fetch Functions ---------------- */

  const fetchCandidates = async () => {
    try {
      // For MongoDB integration:
      const res = await axios.get(`${API_BASE}/print-candidates`);
      const fetchedCandidates = res.data.data || [];
      setCandidates(fetchedCandidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Notify parent whenever candidates change


  /* ---------------- Filter Logic ---------------- */

  const uniqueColleges = useMemo(() => {
    return [...new Set(candidates.map((c) => c.college))].sort();
  }, [candidates]);

  const uniqueJobs = useMemo(() => {
    return [
      ...new Set(candidates.map((c) => c.AssignedJob).filter(Boolean)),
    ].sort();
  }, [candidates]);

  // Helper functions for drive and panelist
  const getDriveName = (driveId) => {
    const drive = drives.find((d) => d.driveId === driveId);
    return drive ? `${drive.driveId} - ${drive.collegeName}` : null;
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.college.toLowerCase().includes(searchLower);

    const matchesCollege =
      collegeFilter === "" ||
      candidate.college.toLowerCase() === collegeFilter.toLowerCase();

    const matchesJob =
      jobFilter === "" ||
      (candidate.AssignedJob &&
        candidate.AssignedJob.toLowerCase() === jobFilter.toLowerCase());

    return matchesSearch && matchesCollege && matchesJob;
  });

  /* ---------------- Render ---------------- */

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
            Manage Candidates
          </h1>
          <p className="text-gray-600">Create and manage candidate profiles</p>
        </div>

        {/* Create User Form - Using Component */}
        <div className="relative">
          <UserFormCard
            newUser={newUser}
            setNewUser={setNewUser}
            createCandidate={createCandidate}
            colors={colors}
          />
        </div>

        {/* Candidates Overview Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ">
          {/* Table Header - Using Component */}
          <UsersTableHeader
            filteredCandidates={filteredCandidates.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            collegeFilter={collegeFilter}
            setCollegeFilter={setCollegeFilter}
            jobFilter={jobFilter}
            setJobFilter={setJobFilter}
            uniqueColleges={uniqueColleges}
            uniqueJobs={uniqueJobs}
            colors={colors}
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    College
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Assigned Drive
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Assigned Jobs
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12">
                      <EmptyState
                        icon={Users}
                        title="No candidates found"
                        message="Try adjusting your filters or create a new candidate"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <UserTableRow
                      key={candidate._id}
                      candidate={candidate}
                      getDriveName={getDriveName}
                      colors={colors}
                      deleteCandidate={deleteCandidate}
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
