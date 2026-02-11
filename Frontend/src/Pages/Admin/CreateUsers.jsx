// import axios from "axios"; 
import { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Mail, 
  GraduationCap,
  Briefcase,
  UserPlus,
  Search,
  Filter
} from "lucide-react";

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
      AssignedJob: "" 
    },
    { 
      id: 2, 
      name: "Priya Patel", 
      email: "priya@nitt.edu", 
      college: "NIT Trichy", 
      AssignedJob: "" 
    },
    { 
      id: 3, 
      name: "Arjun Reddy", 
      email: "arjun@bits.ac.in", 
      college: "BITS Pilani", 
      AssignedJob: "" 
    },
    { 
      id: 4, 
      name: "Sneha Iyer", 
      email: "sneha@dtu.ac.in", 
      college: "DTU Delhi", 
      AssignedJob: "" 
    },
    { 
      id: 5, 
      name: "Karthik Menon", 
      email: "karthik@annauniv.edu", 
      college: "Anna University", 
      AssignedJob: "" 
    },
    { 
      id: 6, 
      name: "Ananya Singh", 
      email: "ananya@vit.ac.in", 
      college: "VIT Vellore", 
      AssignedJob: "" 
    },
    { 
      id: 7, 
      name: "Rohan Das", 
      email: "rohan@iitb.ac.in", 
      college: "IIT Bombay", 
      AssignedJob: "" 
    },
    { 
      id: 8, 
      name: "Meera Krishnan", 
      email: "meera@iiit.ac.in", 
      college: "IIIT Hyderabad", 
      AssignedJob: "" 
    },
    { 
      id: 9, 
      name: "Vikram Malhotra", 
      email: "vikram@nitw.ac.in", 
      college: "NIT Warangal", 
      AssignedJob: "" 
    },
    { 
      id: 10, 
      name: "Divya Nair", 
      email: "divya@srm.edu.in", 
      college: "SRM University", 
      AssignedJob: "" 
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
        id: candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1,
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
    const updatedCandidates = candidates.map(candidate => {
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

  const uniqueColleges = [...new Set(candidates.map(c => c.college))].sort();
  const uniqueJobs = [...new Set(candidates.map(c => c.AssignedJob).filter(Boolean))].sort();

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollege = !collegeFilter || candidate.college === collegeFilter;
    const matchesJob = !jobFilter || candidate.AssignedJob.includes(jobFilter);

    return matchesSearch && matchesCollege && matchesJob;
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.softFlow + '10' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.stonewash }}
            >
              <Users size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: colors.stonewash }}>
              User Management
            </h1>
          </div>
          <p className="text-gray-600 ml-15">
            Create and manage candidate profiles
          </p>
        </div>

        {/* Create New User Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus size={20} style={{ color: colors.mossRock }} />
            <h2 className="text-xl font-semibold" style={{ color: colors.stonewash }}>
              Create New Candidate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                style={{ focusBorderColor: colors.mossRock }}
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="Enter email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College/University *
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="Enter college name"
                value={newUser.college}
                onChange={(e) => setNewUser({ ...newUser, college: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Job (Optional)
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="Job title"
                value={newUser.AssignedJob}
                onChange={(e) => setNewUser({ ...newUser, AssignedJob: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={createCandidate}
            className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
            style={{ backgroundColor: colors.mossRock }}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus size={20} />
              <span>Create Candidate</span>
            </div>
          </button>
        </div>

        {/* Candidates Overview Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div 
            className="p-6 text-white"
            style={{ backgroundColor: colors.stonewash }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Users size={24} />
                <div>
                  <h2 className="text-xl font-bold">Candidates Overview</h2>
                  <p className="text-sm opacity-90">
                    Total: {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60 min-w-50px"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ backdropFilter: 'blur(10px)'}}
                  />
                </div>

                <select
                  className="px-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <option value="" className="text-gray-800">All Colleges</option>
                  {uniqueColleges.map(college => (
                    <option key={college} value={college} className="text-gray-800">
                      {college}
                    </option>
                  ))}
                </select>

                <select
                  className="px-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <option value="" className="text-gray-800">All Jobs</option>
                  {uniqueJobs.map(job => (
                    <option key={job} value={job} className="text-gray-800">
                      {job}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + '20' }}>
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
                    <td colSpan="4" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No candidates found</p>
                        <p className="text-sm">Try adjusting your filters or create a new candidate</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const jobList = candidate.AssignedJob ? candidate.AssignedJob.split(', ') : [];
                    const hasMultipleJobs = jobList.length > 1;
                    
                    return (
                      <tr 
                        key={candidate.id} 
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white shrink-0"
                              style={{ backgroundColor: colors.softFlow }}
                            >
                              {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{candidate.name}</p>
                              {hasMultipleJobs && (
                                <span 
                                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ 
                                    backgroundColor: colors.marigoldFlame + '20',
                                    color: colors.marigoldFlame
                                  }}
                                >
                                  {jobList.length} jobs
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Building2 size={16} className="text-gray-400" />
                            {candidate.college}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Mail size={16} className="text-gray-400" />
                            {candidate.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {jobList.length === 0 ? (
                              <span className="text-gray-400 text-sm italic">Not assigned</span>
                            ) : (
                              jobList.map((job, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                                  style={{
                                    backgroundColor: colors.clayPot + '60',
                                    color: colors.stonewash
                                  }}
                                >
                                  <Briefcase size={12} />
                                  {job}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MongoDB Integration Instructions */}
        <div 
          className="mt-8 p-4 rounded-xl border-2"
          style={{ 
            backgroundColor: colors.goldenHour + '10',
            borderColor: colors.goldenHour
          }}
        >
          <p className="text-sm" style={{ color: colors.stonewash }}>
            <strong>💡 MongoDB Integration:</strong> Currently using dummy data. 
            Uncomment the MongoDB API calls in <code>createCandidate()</code> and <code>fetchCandidates()</code> 
            to connect to your backend.
          </p>
        </div>
      </div>
    </div>
  );
}