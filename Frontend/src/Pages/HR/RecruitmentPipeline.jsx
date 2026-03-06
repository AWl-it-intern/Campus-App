import { Briefcase, CheckCircle2, Link2, MapPin, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import EmptyState from "../../Components/common/EmptyState.jsx";
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import StatsCard from "../../Components/common/StatsCard.jsx";
import { fetchDrives } from "../../services/drivesService";
import { fetchJobs } from "../../services/jobsService";
import HR_COLORS from "../../theme/hrPalette";
import {
  deleteRecruitmentFlowTemplate,
  listRecruitmentFlowTemplates,
  upsertRecruitmentFlowTemplate,
} from "../../utils/recruitmentFlowTemplates";

const FLOW_STAGE_OPTIONS = [
  "Aptitude Test",
  "GD Round",
  "PI Round",
  "Final Selection",
];

const PIPELINE_VIEWS = {
  HOME: "home",
  BUILDER: "custom-flow-builder",
  LIST: "flow-list",
};

const safeText = (value) => String(value || "").trim();
const safeLower = (value) => safeText(value).toLowerCase();
const getJobKey = (job = {}) => safeText(job._id || job.id || job.JobID || job.JobName);

export default function RecruitmentPipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const colors = HR_COLORS;
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [selectedJobRef, setSelectedJobRef] = useState("");
  const [selectedFlowStages, setSelectedFlowStages] = useState(FLOW_STAGE_OPTIONS);
  const [savedTemplates, setSavedTemplates] = useState([]);

  const activeViewRaw = safeLower(searchParams.get("view"));
  const activeView = Object.values(PIPELINE_VIEWS).includes(activeViewRaw)
    ? activeViewRaw
    : PIPELINE_VIEWS.HOME;

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
    setSelectedJobRef("");
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

    const driveCode = safeText(selectedDrive.DriveID);
    const configuredOpenings = new Set(
      (Array.isArray(selectedDrive.JobsOpening) ? selectedDrive.JobsOpening : [])
        .map((job) => safeLower(job))
        .filter(Boolean),
    );

    return jobs.filter((job) => {
      const jobName = safeText(job.JobName);
      if (!jobName) return false;

      if (configuredOpenings.has(safeLower(jobName))) return true;

      const driveMap = job.Drive && typeof job.Drive === "object" ? job.Drive : {};
      return driveCode ? Object.prototype.hasOwnProperty.call(driveMap, driveCode) : false;
    });
  }, [selectedDrive, jobs]);

  const selectedJob = useMemo(
    () => availableJobs.find((job) => getJobKey(job) === selectedJobRef) || null,
    [availableJobs, selectedJobRef],
  );

  const switchPipelineView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === PIPELINE_VIEWS.HOME) {
      nextParams.delete("view");
    } else {
      nextParams.set("view", nextView);
    }
    setSearchParams(nextParams);
  };

  const toggleFlowStage = (stageName) => {
    setSelectedFlowStages((previous) => {
      if (previous.includes(stageName)) {
        return previous.filter((stage) => stage !== stageName);
      }
      return [...previous, stageName];
    });
  };

  const handleSaveFlowTemplate = () => {
    if (!selectedDrive || !selectedJob) {
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
      jobName: safeText(selectedJob.JobName),
      jobId: safeText(selectedJob.JobID || selectedJob._id || selectedJob.id),
      stages: selectedFlowStages,
    });

    setSavedTemplates(listRecruitmentFlowTemplates());
    alert("Flow template saved and assigned to selected drive-job.");
  };

  const handleDeleteFlowTemplate = (template) => {
    const driveLabel = safeText(template?.driveLabel) || "selected drive";
    const jobName = safeText(template?.jobName) || "selected job";
    const shouldDelete = window.confirm(
      `Delete flow assignment for ${driveLabel} -> ${jobName}?`,
    );
    if (!shouldDelete) return;

    const deleted = deleteRecruitmentFlowTemplate({
      driveRef: template?.driveRef,
      jobName: template?.jobName,
      driveLabel: template?.driveLabel,
    });

    if (!deleted) {
      alert("Flow assignment not found or already removed.");
      return;
    }

    setSavedTemplates(listRecruitmentFlowTemplates());
  };

  const statsData = useMemo(
    () => [
      {
        title: "Drives",
        count: drives.length,
        icon: MapPin,
        bgColor: colors.rainShadow,
        lightBg: "#E8F9F0",
      },
      {
        title: "Jobs",
        count: jobs.length,
        icon: Briefcase,
        bgColor: colors.softFlow,
        lightBg: "#E6F9F5",
      },
      {
        title: "Saved Flows",
        count: savedTemplates.length,
        icon: Link2,
        bgColor: colors.marigoldFlame,
        lightBg: "#FFF9E6",
      },
      {
        title: "Jobs With Custom Flow",
        count: new Set(
          savedTemplates
            .map((template) => safeLower(template.jobId || template.jobName))
            .filter(Boolean),
        ).size,
        icon: CheckCircle2,
        bgColor: colors.mossRock,
        lightBg: "#E8F9E8",
      },
    ],
    [
      drives.length,
      jobs.length,
      savedTemplates,
      colors.rainShadow,
      colors.softFlow,
      colors.marigoldFlame,
      colors.mossRock,
    ],
  );

  const pipelineNavItems = [
    { key: PIPELINE_VIEWS.HOME, label: "Home" },
    { key: PIPELINE_VIEWS.BUILDER, label: "Custom Flow Builder" },
    { key: PIPELINE_VIEWS.LIST, label: "Flows Assigned to Jobs" },
  ];

  const viewHeader = {
    [PIPELINE_VIEWS.HOME]: {
      title: "Recruitment Pipeline",
      subtitle: "Monitor pipeline configuration health across drives, jobs, and custom flows.",
    },
    [PIPELINE_VIEWS.BUILDER]: {
      title: "Custom Flow Builder",
      subtitle: "Build and assign custom interview flow templates by drive and job.",
    },
    [PIPELINE_VIEWS.LIST]: {
      title: "Flows Assigned to Jobs",
      subtitle: "Track saved flow templates mapped to each job with Job ID visibility.",
    },
  }[activeView];

  return (
    <HrShell
      title={viewHeader.title}
      subtitle={viewHeader.subtitle}
      topNav={
        <SectionNavBar
          items={pipelineNavItems}
          activeKey={activeView}
          onChange={switchPipelineView}
        />
      }
    >
      {loadError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      ) : null}

      {activeView === PIPELINE_VIEWS.HOME ? (
        <>
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

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.stonewash }}>
              Pipeline Overview
            </h3>
            <p className="text-sm text-gray-600">
              Custom flow templates are drive-job specific. Use the builder to define stages and
              track assignments in the list view with Job ID references.
            </p>
          </section>
        </>
      ) : null}

      {activeView === PIPELINE_VIEWS.BUILDER ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.stonewash }}>
            Assign Flow To Drive-Job
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Create and assign a flow template to a specific drive-job pair.
          </p>

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
                value={selectedJobRef}
                onChange={(event) => setSelectedJobRef(event.target.value)}
                disabled={!selectedDrive || loading}
              >
                <option value="">Select Job</option>
                {availableJobs.map((job) => {
                  const jobKey = getJobKey(job);
                  return (
                    <option key={jobKey} value={jobKey}>
                      {`${job.JobID || "-"} - ${job.JobName || "-"}`}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          <div className="space-y-2 mb-4">
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
            className="w-full md:w-auto px-4 py-2 rounded-lg text-white font-semibold inline-flex items-center gap-2"
            style={{ backgroundColor: colors.rainShadow }}
          >
            <Sparkles size={16} />
            Save Flow Template
          </button>
        </section>
      ) : null}

      {activeView === PIPELINE_VIEWS.LIST ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-0 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: colors.stonewash }}>
              Assigned Flow Templates
            </h3>
            <span className="text-sm text-gray-600">{savedTemplates.length} total</span>
          </div>

          {savedTemplates.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Link2}
                title="No flow assignments found"
                message="Create a flow template from the Custom Flow Builder tab."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Drive
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Job ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Job Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Stages
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Updated
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {savedTemplates.map((template) => (
                    <tr
                      key={`${template.driveRef}-${template.jobName}-${template.updatedAt}`}
                      className="border-t border-gray-100"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">{template.driveLabel || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{template.jobId || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {template.jobName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(template.stages || []).join(" -> ") || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {template.updatedAt
                          ? new Date(template.updatedAt).toLocaleString("en-IN")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <button
                          type="button"
                          onClick={() => handleDeleteFlowTemplate(template)}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-white text-xs font-semibold hover:opacity-90 transition-all"
                          style={{ backgroundColor: "#DC2626" }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </HrShell>
  );
}
