import { useMemo, useState } from "react";
import { Award, Briefcase, UserCheck, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  JobFormCard,
  JobsTableHeader,
  JobTableRow,
} from "../../Components/jobs/index.js";
import EmptyState from "../../Components/common/EmptyState.jsx";
import StatsCard from "../../Components/common/StatsCard.jsx";
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useCreateJob from "../../hooks/useCreateJob";
import useKonamiConfetti from "../../hooks/useKonamiConfetti";
import JobCandidatesModal from "../../Components/jobs/JobCandidatesModal.jsx";

export default function CreateJob({ onJobAssignment, onJobsUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const colors = HR_COLORS;
  const JOB_VIEWS = {
    HOME: "home",
    CREATE: "create-jobs",
    LIST: "jobs-list",
  };

  const activeViewRaw = String(searchParams.get("view") || "").trim().toLowerCase();
  const activeView = Object.values(JOB_VIEWS).includes(activeViewRaw)
    ? activeViewRaw
    : JOB_VIEWS.HOME;

  useKonamiConfetti([
    colors.stonewash,
    colors.softFlow,
    colors.mossRock,
    colors.marigoldFlame,
    colors.goldenHour,
  ]);

  const {
    jobs,
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
  const jobsWithCandidatesCount = useMemo(
    () =>
      jobs.filter(
        (job) => Array.isArray(job.assignedCandidates) && job.assignedCandidates.length > 0,
      ).length,
    [jobs],
  );

  const candidateAssignmentsCount = useMemo(
    () =>
      jobs.reduce(
        (total, job) =>
          total + (Array.isArray(job.assignedCandidates) ? job.assignedCandidates.length : 0),
        0,
      ),
    [jobs],
  );

  const statsData = useMemo(
    () => [
      {
        title: "Total Jobs",
        count: jobs.length,
        icon: Briefcase,
        bgColor: colors.rainShadow,
        lightBg: "#E8F9F0",
      },
      {
        title: "Jobs with Candidates",
        count: jobsWithCandidatesCount,
        icon: Users,
        bgColor: colors.softFlow,
        lightBg: "#E6F9F5",
      },
      {
        title: "Unassigned Jobs",
        count: Math.max(0, jobs.length - jobsWithCandidatesCount),
        icon: UserCheck,
        bgColor: colors.marigoldFlame,
        lightBg: "#FFF9E6",
      },
      {
        title: "Candidate Assignments",
        count: candidateAssignmentsCount,
        icon: Award,
        bgColor: colors.mossRock,
        lightBg: "#E8F9E8",
      },
    ],
    [
      jobs.length,
      jobsWithCandidatesCount,
      candidateAssignmentsCount,
      colors.rainShadow,
      colors.softFlow,
      colors.marigoldFlame,
      colors.mossRock,
    ],
  );

  const jobNavItems = [
    { key: JOB_VIEWS.HOME, label: "Home" },
    { key: JOB_VIEWS.CREATE, label: "Create Jobs" },
    { key: JOB_VIEWS.LIST, label: "Jobs List" },
  ];

  const viewHeader = {
    [JOB_VIEWS.HOME]: {
      title: "Jobs Management",
      subtitle: "Track role availability and assignment coverage across all jobs.",
    },
    [JOB_VIEWS.CREATE]: {
      title: "Create Jobs",
      subtitle: "Add new hiring roles with unique IDs and titles.",
    },
    [JOB_VIEWS.LIST]: {
      title: "Jobs List",
      subtitle: "Search, review, and manage all job records.",
    },
  }[activeView];

  const switchJobView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === JOB_VIEWS.HOME) {
      nextParams.delete("view");
    } else {
      nextParams.set("view", nextView);
    }
    setSearchParams(nextParams);
  };

  const openJobCandidates = (job) => {
    setSelectedJob(job);
  };

  const closeJobCandidates = () => {
    setSelectedJob(null);
  };

  const selectedJobCandidates = selectedJob ? getCandidatesForJob(selectedJob) : [];

  return (
    <HrShell
      title={viewHeader.title}
      subtitle={viewHeader.subtitle}
      topNav={
        <SectionNavBar
          items={jobNavItems}
          activeKey={activeView}
          onChange={switchJobView}
        />
      }
    >
      {jobsError && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <strong>Warning:</strong> {jobsError}
        </div>
      )}

      {activeView === JOB_VIEWS.HOME ? (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                count={stat.count}
                icon={stat.icon}
                bgColor={stat.bgColor}
                lightBg={stat.lightBg}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeView === JOB_VIEWS.CREATE ? (
        <JobFormCard
          newJob={newJob}
          setNewJob={setNewJob}
          createJob={handleCreateJob}
          colors={colors}
        />
      ) : null}

      {activeView === JOB_VIEWS.LIST ? (
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
      ) : null}

      <JobCandidatesModal
        isOpen={Boolean(selectedJob)}
        onClose={closeJobCandidates}
        job={selectedJob}
        candidates={selectedJobCandidates}
      />
    </HrShell>
  );
}
