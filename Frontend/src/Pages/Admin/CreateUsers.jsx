// pages/CreateUsers.jsx
// Updated to use modular components

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

// Import feature-specific components
import {
  UserFormCard,
  UsersTableHeader,
  UserTableRow,
} from "../../components/users/index.js";

// Import common components
import EmptyState from "../../components/common/EmptyState.jsx";

const API_BASE = "http://localhost:5000";

export default function CreateUsers({ onCandidatesUpdate }) {
  // Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

  // Dummy data for development (will be replaced by MongoDB data)
  const dummyCandidates = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@iitd.ac.in",
      college: "IIT Delhi",
      AssignedJob: "",
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya@nitt.edu",
      college: "NIT Trichy",
      AssignedJob: "",
    },
    {
      id: 3,
      name: "Arjun Reddy",
      email: "arjun@bits.ac.in",
      college: "BITS Pilani",
      AssignedJob: "",
    },
    {
      id: 4,
      name: "Sneha Iyer",
      email: "sneha@dtu.ac.in",
      college: "DTU Delhi",
      AssignedJob: "",
    },
    {
      id: 5,
      name: "Karthik Menon",
      email: "karthik@annauniv.edu",
      college: "Anna University",
      AssignedJob: "",
    },
    {
      id: 6,
      name: "Ananya Singh",
      email: "ananya@vit.ac.in",
      college: "VIT Vellore",
      AssignedJob: "",
    },
    {
      id: 7,
      name: "Rohan Das",
      email: "rohan@iitb.ac.in",
      college: "IIT Bombay",
      AssignedJob: "",
    },
    {
      id: 8,
      name: "Meera Krishnan",
      email: "meera@iiit.ac.in",
      college: "IIIT Hyderabad",
      AssignedJob: "",
    },
    {
      id: 9,
      name: "Vikram Malhotra",
      email: "vikram@nitw.ac.in",
      college: "NIT Warangal",
      AssignedJob: "",
    },
    {
      id: 10,
      name: "Divya Nair",
      email: "divya@srm.edu.in",
      college: "SRM University",
      AssignedJob: "",
    },
  ];

  const [candidates, setCandidates] = useState(dummyCandidates);
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
    // Validate inputs
    if (!newUser.name || !newUser.email || !newUser.college) {
      alert("Please fill in Name, Email, and College fields");
      return;
    }

    try {
      // For MongoDB integration (currently commented out):
      // await axios.post(`${API_BASE}/candidate`, newUser);

      // Temporary: Add to local state with new ID
      const newCandidate = {
        id:
          candidates.length > 0
            ? Math.max(...candidates.map((c) => c.id)) + 1
            : 1,
        ...newUser,
      };

      const updatedCandidates = [...candidates, newCandidate];
      setCandidates(updatedCandidates);

      // Notify parent component (CreateJob) about the update
      if (onCandidatesUpdate) {
        onCandidatesUpdate(updatedCandidates);
      }

      alert("New Candidate Inserted Successfully!");

      // Clear form
      setNewUser({ name: "", email: "", college: "", AssignedJob: "" });

      // For MongoDB: refresh from database
      // fetchCandidates();
    } catch (err) {
      console.error("Error creating candidate:", err);
      alert("Failed to create candidate");
    }
  };

  /* ---------------- Fetch Functions ---------------- */

  const fetchCandidates = async () => {
    try {
      // For MongoDB integration:
      // const res = await axios.get(`${API_BASE}/print-candidates`);
      // const fetchedCandidates = res.data.data || [];
      // setCandidates(fetchedCandidates);

      // Notify parent component
      // if (onCandidatesUpdate) {
      //   onCandidatesUpdate(fetchedCandidates);
      // }

      // Currently using dummy data
      console.log("Using dummy data. Connect to MongoDB to fetch real data.");
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  /* ---------------- Update Function (for job assignments) ---------------- */

  const updateCandidateJob = (candidateId, jobNames) => {
    const updatedCandidates = candidates.map((candidate) => {
      if (candidate.id === candidateId) {
        return { ...candidate, AssignedJob: jobNames };
      }
      return candidate;
    });

    setCandidates(updatedCandidates);

    // Notify parent component
    if (onCandidatesUpdate) {
      onCandidatesUpdate(updatedCandidates);
    }
  };

  // Expose updateCandidateJob to parent via ref or callback
  useEffect(() => {
    if (window.updateCandidateJob) {
      window.updateCandidateJob = updateCandidateJob;
    }
  }, [candidates]);

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    fetchCandidates();

    // Notify parent component with initial data
    if (onCandidatesUpdate) {
      onCandidatesUpdate(candidates);
    }
  }, []);

  /* ---------------- Filter Logic ---------------- */

  const uniqueColleges = [...new Set(candidates.map((c) => c.college))].sort();
  const uniqueJobs = [
    ...new Set(candidates.map((c) => c.AssignedJob).filter(Boolean)),
  ].sort();

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.college.toLowerCase().includes(searchLower);

    const matchesCollege =
      collegeFilter === "" || candidate.college === collegeFilter;
    const matchesJob = jobFilter === "" || candidate.AssignedJob === jobFilter;

    return matchesSearch && matchesCollege && matchesJob;
  });

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
        <UserFormCard
          newUser={newUser}
          setNewUser={setNewUser}
          createCandidate={createCandidate}
          colors={colors}
        />

        {/* Candidates Overview Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                    Assigned Jobs
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12">
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
                      key={candidate.id}
                      candidate={candidate}
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
