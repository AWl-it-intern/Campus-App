/**
 * File Type: UI/UX Component
 * Business Logic File Used: ./useAptitudeTestManagement.js
 * Fields Used: drives, selectedDrive, selectedJobRef, targetCandidates, selectedCandidateIds
 * Input Type: Dispatch view state + handlers + helpers
 * Output Type: ReactElement
 */
import { Link2, Send } from "lucide-react";

import AptitudeCandidatesTable from "./AptitudeCandidatesTable";

export default function AptitudeDispatchView({
  drives,
  loading,
  selectedDrive,
  selectedDriveId,
  setSelectedDriveId,
  availableJobs,
  selectedJobRef,
  setSelectedJobRef,
  aptitudeLink,
  setAptitudeLink,
  searchText,
  setSearchText,
  targetCandidates,
  selectedCandidateIds,
  selectedCandidateSet,
  allVisibleSelected,
  getJobKey,
  getCandidateKey,
  toggleCandidateSelection,
  toggleSelectAllVisible,
  handleSendAptitudeLink,
  colors,
}) {
  return (
    <section className="mb-6">
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ color: colors.stonewash }}>
          <Link2 size={18} />
          Aptitude Link Dispatch
        </h3>

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
                <option key={String(drive._id || drive.id || drive.DriveID || "")} value={String(drive._id || drive.id || drive.DriveID || "")}>
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

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Aptitude Test Link</span>
            <input
              type="url"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="https://..."
              value={aptitudeLink}
              onChange={(event) => setAptitudeLink(event.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Search Candidates</span>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Candidate ID / name / email"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {targetCandidates.length} candidates in selected drive-job | {selectedCandidateIds.length} selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
              disabled={targetCandidates.length === 0}
            >
              {allVisibleSelected ? "Unselect All" : "Select All"}
            </button>
            <button
              type="button"
              onClick={handleSendAptitudeLink}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.stonewash }}
              disabled={selectedCandidateIds.length === 0}
            >
              <Send size={14} />
              Send Link
            </button>
          </div>
        </div>

        <AptitudeCandidatesTable
          loading={loading}
          targetCandidates={targetCandidates}
          allVisibleSelected={allVisibleSelected}
          selectedCandidateSet={selectedCandidateSet}
          getCandidateKey={getCandidateKey}
          toggleSelectAllVisible={toggleSelectAllVisible}
          toggleCandidateSelection={toggleCandidateSelection}
          colors={colors}
        />
      </article>
    </section>
  );
}
