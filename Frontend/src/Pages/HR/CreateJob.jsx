import { Briefcase } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  JobFormCard,
  JobsTableHeader,
  JobTableRow,
} from "../../Components/jobs/index.js";
import EmptyState from "../../Components/common/EmptyState.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useCreateJob from "../../hooks/useCreateJob";
import useKonamiConfetti from "../../hooks/useKonamiConfetti";
import JobCandidatesModal from "../../Components/jobs/JobCandidatesModal.jsx";
import { useState } from "react";

export default function CreateJob({ onJobAssignment, onJobsUpdate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDrives = location.state?.fromDrives || false;
  const colors = HR_COLORS;

  useKonamiConfetti([
    colors.stonewash,
    colors.softFlow,
    colors.mossRock,
    colors.marigoldFlame,
    colors.goldenHour,
  ]);

  const {
    jobsLoading,
    jobsError,
    newJob,
    setNewJob,
    jobSearchTerm,
    setJobSearchTerm,
    filteredJobs,
    getCandidatesForJob,
    handleCreateJob,
    handleDeleteJob,
  } = useCreateJob({ onJobAssignment, onJobsUpdate });

  const [selectedJob, setSelectedJob] = useState(null);

  const openJobCandidates = (job) => {
    setSelectedJob(job);
  };

  const closeJobCandidates = () => {
    setSelectedJob(null);
  };

  const selectedJobCandidates = selectedJob ? getCandidatesForJob(selectedJob) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() =>
            navigate(fromDrives ? "/HR/dashboard/Drives" : "/HR/dashboard")
          }
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
           Back to {fromDrives ? "Drive Management" : "Dashboard"}
        </button>

        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.stonewash }}
          >
            Manage Jobs
          </h1>
          <p className="text-gray-600">Create and manage jobs</p>
        </div>

        {jobsError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <strong>Warning:</strong> {jobsError}
          </div>
        )}

        <JobFormCard
          newJob={newJob}
          setNewJob={setNewJob}
          createJob={handleCreateJob}
          colors={colors}
        />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <JobsTableHeader
            filteredJobsCount={filteredJobs.length}
            jobSearchTerm={jobSearchTerm}
            setJobSearchTerm={setJobSearchTerm}
            colors={colors}
          />

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
                      deleteJob={handleDeleteJob}
                      colors={colors}
                      recentCandidates={getCandidatesForJob(job).slice(0, 3)}
                      onRowClick={openJobCandidates}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <JobCandidatesModal
        isOpen={Boolean(selectedJob)}
        onClose={closeJobCandidates}
        job={selectedJob}
        candidates={selectedJobCandidates}
      />
    </div>
  );
}
