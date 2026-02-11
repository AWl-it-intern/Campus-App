import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Users, 
  Plus, 
  Search, 
  X,
  Filter,
  Sparkles,
  CheckCircle2,
  Building2,
  UserCheck,
  Award,
  Trash2
} from "lucide-react";

export default function CreateJob({ candidates = [], onJobAssignment, onJobsUpdate }) {
  // Complete Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

  // Easter Egg State - Konami Code
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [easterEggActive, setEasterEggActive] = useState(false);

  // State - Jobs with some candidates assigned to multiple jobs
  const [jobs, setJobs] = useState([
    { JobID: "JOB001", JobName: "Software Engineer", assignedCandidates: [1, 2, 7] },
    { JobID: "JOB002", JobName: "Data Analyst", assignedCandidates: [2, 3, 8] },
    { JobID: "JOB003", JobName: "Product Manager", assignedCandidates: [4] },
    { JobID: "JOB004", JobName: "UI/UX Designer", assignedCandidates: [5, 9] },
    { JobID: "JOB005", JobName: "DevOps Engineer", assignedCandidates: [1, 7, 10] },
    { JobID: "JOB006", JobName: "Business Analyst", assignedCandidates: [2, 6] },
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
  const [selectedCandidatesForAssignment, setSelectedCandidatesForAssignment] = useState([]);

  // Easter Egg Functions - Defined before useEffect
  const createConfetti = () => {
    const confettiColors = [colors.stonewash, colors.softFlow, colors.mossRock, colors.marigoldFlame, colors.goldenHour];
    const confettiCount = 60;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
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
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
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
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyDown = (e) => {
      const newSequence = [...konamiSequence, e.key].slice(-10);
      setKonamiSequence(newSequence);

      if (newSequence.join(',') === konami.join(',')) {
        activateEasterEgg();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiSequence]);

  // Update parent component when job assignments change
  useEffect(() => {
    if (onJobAssignment) {
      // Create a mapping of candidate ID to their assigned jobs
      const candidateJobMap = {};
      
      jobs.forEach(job => {
        job.assignedCandidates.forEach(candidateId => {
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

    if (jobs.some(job => job.JobID === newJob.JobID)) {
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
      setSelectedCandidatesForAssignment(selectedCandidatesForAssignment.filter(id => id !== candidateId));
    } else {
      setSelectedCandidatesForAssignment([...selectedCandidatesForAssignment, candidateId]);
    }
  };

  // Save assignments
  const saveAssignments = () => {
    setJobs(jobs.map(job => 
      job.JobID === selectedJob.JobID 
        ? { ...job, assignedCandidates: selectedCandidatesForAssignment }
        : job
    ));
    setShowAssignModal(false);
    setSelectedJob(null);
    setSelectedCandidatesForAssignment([]);
    alert("Job assignments updated successfully!");
  };

  // Delete Job Function
  const deleteJob = (jobToDelete) => {
    if (window.confirm(`Are you sure you want to delete "${jobToDelete.JobName}" (${jobToDelete.JobID})?`)) {
      setJobs(jobs.filter(job => job.JobID !== jobToDelete.JobID));
      alert("Job deleted successfully!");
    }
  };

  // Get candidate name by ID
  const getCandidateName = (id) => {
    const candidate = candidates.find(c => c.id === id);
    return candidate ? candidate.name : "Unknown";
  };

  // Get candidate info by ID
  const getCandidateInfo = (id) => {
    return candidates.find(c => c.id === id);
  };

  // Get jobs for a candidate
  const getJobsForCandidate = (candidateId) => {
    return jobs.filter(job => job.assignedCandidates.includes(candidateId));
  };

  // Generate avatar color based on candidate ID
  const getAvatarColor = (candidateId) => {
    const colorArray = [
      colors.softFlow,
      colors.mossRock,
      colors.goldenHour,
      colors.marigoldFlame,
      colors.clayPot,
      colors.stonewash,
    ];
    return colorArray[candidateId % colorArray.length];
  };

  // Filtered Jobs
  const filteredJobs = jobs.filter(job => {
    const matchesJobSearch = job.JobName.toLowerCase().includes(jobSearchTerm.toLowerCase());
    
    const matchesCandidateFilter = !jobCandidateFilter || 
      job.assignedCandidates.some(id => {
        const candidate = candidates.find(c => c.id === id);
        return candidate && candidate.name.toLowerCase().includes(jobCandidateFilter.toLowerCase());
      });

    const matchesMultipleJobs = !showMultipleJobsOnly || 
      job.assignedCandidates.some(candidateId => {
        const candidateJobs = getJobsForCandidate(candidateId);
        return candidateJobs.length > 1;
      });

    return matchesJobSearch && matchesCandidateFilter && matchesMultipleJobs;
  });

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.clayPot + '15' }}>
      {/* Easter Egg Styles */}
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes rainbow-border {
          0%, 100% { border-color: ${colors.stonewash}; }
          20% { border-color: ${colors.softFlow}; }
          40% { border-color: ${colors.mossRock}; }
          60% { border-color: ${colors.goldenHour}; }
          80% { border-color: ${colors.marigoldFlame}; }
        }

        .easter-egg-active {
          animation: rainbow-border 2s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${easterEggActive ? 'easter-egg-active' : ''}`}
              style={{ 
                backgroundColor: colors.stonewash,
                borderWidth: '3px',
                borderStyle: 'solid'
              }}
            >
              <Briefcase size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: colors.stonewash }}>
              Job Management
            </h1>
            {easterEggActive && (
              <Sparkles size={24} className="animate-pulse" style={{ color: colors.marigoldFlame }} />
            )}
          </div>
          <p className="text-gray-600 ml-15">
            Create jobs and assign candidates efficiently
          </p>
        </div>

        {/* Create New Job Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Plus size={20} style={{ color: colors.mossRock }} />
            <h2 className="text-xl font-semibold" style={{ color: colors.stonewash }}>
              Create New Job
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job ID *
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                placeholder="e.g., JOB007"
                value={newJob.JobID}
                onChange={(e) => setNewJob({ ...newJob, JobID: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                placeholder="e.g., Backend Developer"
                value={newJob.JobName}
                onChange={(e) => setNewJob({ ...newJob, JobName: e.target.value })}
              />
            </div>

            <button
              onClick={createJob}
              className="px-8 py-2.5 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
              style={{ backgroundColor: colors.mossRock }}
            >
              <div className="flex items-center justify-center gap-2">
                <Plus size={20} />
                <span>Create Job</span>
              </div>
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div 
            className="p-6 text-white"
            style={{ backgroundColor: colors.stonewash }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Briefcase size={24} />
                <div>
                  <h2 className="text-xl font-bold">Job Overview</h2>
                  <p className="text-sm opacity-90">
                    Total: {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60 min-w-50px"
                    value={jobSearchTerm}
                    onChange={(e) => setJobSearchTerm(e.target.value)}
                    style={{ backdropFilter: 'blur(10px)' }}
                  />
                </div>

                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
                  <input
                    type="text"
                    placeholder="Filter by candidate..."
                    className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60 min-w-50px"
                    value={jobCandidateFilter}
                    onChange={(e) => setJobCandidateFilter(e.target.value)}
                    style={{ backdropFilter: 'blur(10px)' }}
                  />
                </div>

                <button
                  onClick={() => setShowMultipleJobsOnly(!showMultipleJobsOnly)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    showMultipleJobsOnly 
                      ? 'bg-green-500 text-black' 
                      : 'border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black hover:bg-opacity-40'
                  }`}
                  style={!showMultipleJobsOnly ? { backdropFilter: 'blur(10px)' } : {}}
                >
                  Multi-Job Only
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + '20' }}>
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
                    <td colSpan="4" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Briefcase size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No jobs found</p>
                        <p className="text-sm">Try adjusting your filters or create a new job</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1 rounded-lg text-xs font-mono font-semibold"
                          style={{ 
                            backgroundColor: colors.stonewash + '15',
                            color: colors.stonewash
                          }}
                        >
                          {job.JobID}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase size={18} style={{ color: colors.mossRock }} />
                          <span className="font-semibold text-gray-800">{job.JobName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {job.assignedCandidates.length === 0 ? (
                            <span className="text-gray-400 text-sm italic">No candidates assigned</span>
                          ) : (
                            <>
                              <div className="flex -space-x-2">
                                {job.assignedCandidates.slice(0, 3).map((candidateId) => {
                                  const candidate = getCandidateInfo(candidateId);
                                  const initials = candidate 
                                    ? candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                    : '?';
                                  
                                  return (
                                    <div
                                      key={candidateId}
                                      className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-xs border-2 border-white"
                                      style={{ backgroundColor: getAvatarColor(candidateId) }}
                                      title={getCandidateName(candidateId)}
                                    >
                                      {initials}
                                    </div>
                                  );
                                })}
                                {job.assignedCandidates.length > 3 && (
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-xs border-2 border-white"
                                    style={{ backgroundColor: colors.stonewash }}
                                  >
                                    +{job.assignedCandidates.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">
                                {job.assignedCandidates.length} candidate{job.assignedCandidates.length !== 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openAssignModal(job)}
                            className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-all"
                            style={{ backgroundColor: colors.mossRock }}
                          >
                            <div className="flex items-center gap-2">
                              <UserCheck size={16} />
                              <span>Assign</span>
                            </div>
                          </button>
                          <button
                            onClick={() => deleteJob(job)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                            title="Delete Job"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{ backgroundColor: colors.stonewash }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Assign Candidates</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {selectedJob.JobName} ({selectedJob.JobID})
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {candidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No candidates available. Please create candidates first.</p>
                  </div>
                ) : (
                  candidates.map(candidate => {
                    const isSelected = selectedCandidatesForAssignment.includes(candidate.id);
                    const candidateJobs = getJobsForCandidate(candidate.id);
                    
                    return (
                      <label
                        key={candidate.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-opacity-100 shadow-md' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        style={{ 
                          borderColor: isSelected ? colors.mossRock : undefined,
                          backgroundColor: isSelected ? colors.mossRock + '10' : undefined
                        }}
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded accent-green-600"
                          checked={isSelected}
                          onChange={() => toggleCandidateSelection(candidate.id)}
                        />
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                          style={{ backgroundColor: getAvatarColor(candidate.id) }}
                        >
                          {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{candidate.name}</p>
                          <p className="text-sm text-gray-600">{candidate.college}</p>
                          {candidateJobs.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {candidateJobs.map(job => (
                                <span
                                  key={job.JobID}
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ 
                                    backgroundColor: colors.goldenHour + '30',
                                    color: colors.stonewash
                                  }}
                                >
                                  {job.JobName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={24} style={{ color: colors.mossRock }} />
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div 
              className="p-6 border-t border-gray-200 flex items-center justify-between"
              style={{ backgroundColor: colors.softFlow + '10' }}
            >
              <p className="text-gray-700">
                <span className="font-semibold">{selectedCandidatesForAssignment.length}</span> candidate(s) selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAssignments}
                  className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
                  style={{ backgroundColor: colors.mossRock }}
                >
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}