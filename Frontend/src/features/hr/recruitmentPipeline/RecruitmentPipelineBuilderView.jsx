/**
 * File Type: UI/UX Component
 * Business Logic File Used: ./useRecruitmentPipeline.js
 * Fields Used: drives, selectedDrive, selectedDriveId, availableJobs, selectedJobRef, selectedFlowStages
 * Input Type: Builder state + handlers + helpers
 * Output Type: ReactElement
 */
import { Sparkles } from "lucide-react";

import { FLOW_STAGE_OPTIONS } from "./constants";

export default function RecruitmentPipelineBuilderView({
  drives,
  loading,
  selectedDrive,
  selectedDriveId,
  setSelectedDriveId,
  availableJobs,
  selectedJobRef,
  setSelectedJobRef,
  selectedFlowStages,
  toggleFlowStage,
  handleSaveFlowTemplate,
  colors,
  getDriveKey,
  getJobKey,
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold" style={{ color: colors.stonewash }}>
        Assign Flow To Drive-Job
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        Create and assign a flow template to a specific drive-job pair.
      </p>

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Drive</span>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={selectedDriveId}
            onChange={(event) => setSelectedDriveId(event.target.value)}
            disabled={loading}
          >
            <option value="">Select Drive</option>
            {drives.map((drive) => (
              <option key={getDriveKey(drive)} value={getDriveKey(drive)}>
                {`${drive.DriveID || "-"} - ${drive.CollegeName || "-"}`}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Job</span>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={selectedJobRef}
            onChange={(event) => setSelectedJobRef(event.target.value)}
            disabled={!selectedDrive || loading}
          >
            <option value="">Select Job</option>
            {availableJobs.map((job) => (
              <option key={getJobKey(job)} value={getJobKey(job)}>
                {`${job.JobID || "-"} - ${job.JobName || "-"}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-4 space-y-2">
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold text-white md:w-auto"
        style={{ backgroundColor: colors.rainShadow }}
      >
        <Sparkles size={16} />
        Save Flow Template
      </button>
    </section>
  );
}
