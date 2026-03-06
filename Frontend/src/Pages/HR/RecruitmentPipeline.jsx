import {
  Award,
  Briefcase,
  CheckCircle2,
  Link2,
  MapPin,
  MessageSquare,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HrShell from "../../Components/common/HrShell.jsx";
import { fetchDrives } from "../../services/drivesService";
import { fetchJobs } from "../../services/jobsService";
import HR_COLORS from "../../theme/hrPalette";
import {
  listRecruitmentFlowTemplates,
  upsertRecruitmentFlowTemplate,
} from "../../utils/recruitmentFlowTemplates";

const FLOW_STAGE_OPTIONS = [
  "Aptitude Test",
  "GD Round",
  "PI Round",
  "Final Selection",
];

const safeLower = (value) => String(value || "").trim().toLowerCase();

const PROCESS_STEPS = [
  {
    title: "Create Drive",
    subtitle: "Start by creating a drive as master record",
    icon: MapPin,
    path: "/HR/dashboard/Drives",
  },
  {
    title: "Add Jobs to Drive",
    subtitle: "Create jobs and map them to drive",
    icon: Briefcase,
    path: "/HR/dashboard/Create-Job",
  },
  {
    title: "Assign Candidates",
    subtitle: "Map candidates to the selected drive-job",
    icon: Users,
    path: "/HR/dashboard/Drives",
  },
  {
    title: "Aptitude Test",
    subtitle: "Send test link to all candidates in drive-job",
    icon: Link2,
    path: "/HR/dashboard/Aptitude-Test-Management",
  },
  {
    title: "GD Round",
    subtitle: "Evaluate group discussion performance",
    icon: MessageSquare,
    path: "/HR/dashboard/Manage-Panelists",
  },
  {
    title: "PI Round",
    subtitle: "Schedule and complete personal interview",
    icon: UserCheck,
    path: "/HR/dashboard/Manage-Panelists",
  },
  {
    title: "Final Selection",
    subtitle: "Finalize offers and close hiring",
    icon: Award,
    path: "/HR/dashboard/Offer-Approvals",
  },
];

export default function RecruitmentPipeline() {
  const navigate = useNavigate();
  const colors = HR_COLORS;
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [selectedJobName, setSelectedJobName] = useState("");
  const [selectedFlowStages, setSelectedFlowStages] = useState(FLOW_STAGE_OPTIONS);
  const [savedTemplates, setSavedTemplates] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [fetchedDrives, fetchedJobs] = await Promise.all([
          fetchDrives({ limit: 5000 }),
          fetchJobs({ limit: 5000 }),
        ]);
        if (!isMounted) return;
        setDrives(Array.isArray(fetchedDrives) ? fetchedDrives : []);
        setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.response?.data?.error || "Unable to load drive/job data.");
      } finally {
        if (isMounted) {
          setLoading(false);
          setSavedTemplates(listRecruitmentFlowTemplates());
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedJobName("");
  }, [selectedDriveId]);

  const selectedDrive = useMemo(
    () =>
      drives.find(
        (drive) => String(drive._id || drive.id || drive.DriveID) === String(selectedDriveId),
      ) || null,
    [drives, selectedDriveId],
  );

  const availableJobs = useMemo(() => {
    if (!selectedDrive) return [];

    const driveCode = String(selectedDrive.DriveID || "").trim();
    const configuredOpenings = new Set(
      (Array.isArray(selectedDrive.JobsOpening) ? selectedDrive.JobsOpening : [])
        .map((job) => safeLower(job))
        .filter(Boolean),
    );

    return jobs.filter((job) => {
      const jobName = String(job.JobName || "").trim();
      if (!jobName) return false;

      if (configuredOpenings.has(safeLower(jobName))) return true;

      const driveMap = job.Drive && typeof job.Drive === "object" ? job.Drive : {};
      return driveCode ? Object.prototype.hasOwnProperty.call(driveMap, driveCode) : false;
    });
  }, [selectedDrive, jobs]);

  const toggleFlowStage = (stageName) => {
    setSelectedFlowStages((previous) => {
      if (previous.includes(stageName)) {
        return previous.filter((stage) => stage !== stageName);
      }
      return [...previous, stageName];
    });
  };

  const handleSaveFlowTemplate = () => {
    if (!selectedDrive || !selectedJobName) {
      alert("Choose drive and job before saving flow template.");
      return;
    }

    if (selectedFlowStages.length === 0) {
      alert("Select at least one stage for the flow.");
      return;
    }

    upsertRecruitmentFlowTemplate({
      driveRef: selectedDrive._id || selectedDrive.id || selectedDrive.DriveID,
      driveLabel: `${selectedDrive.DriveID || "-"} - ${selectedDrive.CollegeName || "-"}`,
      jobName: selectedJobName,
      stages: selectedFlowStages,
    });

    setSavedTemplates(listRecruitmentFlowTemplates());
    alert("Flow template saved and assigned to selected drive-job.");
  };

  return (
    <HrShell
      title="Recruitment Pipeline"
      subtitle="Flow: Drive -> Jobs -> Candidates -> Aptitude -> GD -> PI -> Final Selection."
    >
      {loadError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      ) : null}

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.stonewash }}>
          Recruitment Process
        </h3>
        <p className="text-sm text-gray-600">
          This flow aligns with drive-job execution. Use steps to move through the process for each hiring track.
        </p>
      </section>

      <section className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="flex items-start">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === PROCESS_STEPS.length - 1;
              return (
                <div key={step.title} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => navigate(step.path)}
                    className="flex-1 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: colors.stonewash }}
                      >
                        <Icon size={16} />
                      </div>
                      <p className="text-base font-semibold" style={{ color: colors.stonewash }}>
                        {step.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{step.subtitle}</p>
                  </button>

                  {!isLast ? (
                    <div className="w-10 lg:w-14 h-[2px] mx-2" style={{ backgroundColor: colors.rainShadow }} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        {[
          { title: "Live Drives", value: "12" },
          { title: "Mapped Jobs", value: "34" },
          { title: "Aptitude Runs", value: "18" },
          { title: "Offers Closed", value: "28" },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: colors.stonewash }}>
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.stonewash }}>
          Custom Flow Builder
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Create and assign flow template to a specific drive-job. Only that job will use this flow.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <article className="rounded-xl border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              Assign Flow To Drive-Job
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <label className="text-sm">
                <span className="block text-gray-600 mb-1">Drive</span>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={selectedDriveId}
                  onChange={(event) => setSelectedDriveId(event.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Drive</option>
                  {drives.map((drive) => {
                    const driveKey = String(drive._id || drive.id || drive.DriveID || "");
                    const driveLabel = `${drive.DriveID || "-"} - ${drive.CollegeName || "-"}`;
                    return (
                      <option key={driveKey} value={driveKey}>
                        {driveLabel}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="text-sm">
                <span className="block text-gray-600 mb-1">Job</span>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={selectedJobName}
                  onChange={(event) => setSelectedJobName(event.target.value)}
                  disabled={!selectedDrive || loading}
                >
                  <option value="">Select Job</option>
                  {availableJobs.map((job) => (
                    <option key={job._id || job.id || job.JobName} value={job.JobName}>
                      {job.JobName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2 mb-3">
              {FLOW_STAGE_OPTIONS.map((stage) => (
                <label
                  key={stage}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2"
                >
                  <span className="text-sm text-gray-700">{stage}</span>
                  <input
                    type="checkbox"
                    checked={selectedFlowStages.includes(stage)}
                    onChange={() => toggleFlowStage(stage)}
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSaveFlowTemplate}
              className="w-full px-3 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: colors.rainShadow }}
            >
              Save Flow Template
            </button>
          </article>

          <article className="rounded-xl border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} />
              Assigned Templates
            </h4>

            <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
              {savedTemplates.length === 0 ? (
                <p className="text-sm text-gray-500">No custom templates saved yet.</p>
              ) : (
                savedTemplates.map((template) => (
                  <article
                    key={`${template.driveRef}-${template.jobName}-${template.updatedAt}`}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <p className="text-sm font-semibold text-gray-800">{template.jobName}</p>
                    <p className="text-xs text-gray-500 mb-1">{template.driveLabel || "-"}</p>
                    <p className="text-xs text-gray-600">{(template.stages || []).join(" -> ")}</p>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>

      </section>
    </HrShell>
  );
}
