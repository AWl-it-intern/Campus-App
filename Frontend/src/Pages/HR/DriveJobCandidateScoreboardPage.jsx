/**
 * File Type: UI/UX Page
 * Business Logic File Used: ../../hooks/useDriveJobScoreboard.js
 * Logic Fields Used: loading/error/rows/driveLabel for drive-job scoreboard table
 * Input Type: URL params + navigation state (driveId/jobId/JobName/CollegeName)
 * Output Type: ReactElement
 */
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import HrShell from "../../Components/common/HrShell.jsx";
import { fetchDrives } from "../../services/drivesService";
import { fetchJobs } from "../../services/jobsService";
import HR_COLORS from "../../theme/hrPalette";
import useDriveJobScoreboard from "../../hooks/useDriveJobScoreboard";

const safeLower = (value) => String(value || "").trim().toLowerCase();

export default function DriveJobCandidateScoreboardPage() {
  const location = useLocation();
  const { driveId, jobId } = useParams();
  const colors = HR_COLORS;
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectorsLoading, setSelectorsLoading] = useState(true);
  const [selectorsError, setSelectorsError] = useState("");
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [selectedJobName, setSelectedJobName] = useState("");

  const jobNameFromParams = jobId
    ? location.state?.JobName || decodeURIComponent(jobId || "")
    : "";
  const collegeName = location.state?.CollegeName || "College";
  const isContextMode = Boolean(driveId && jobId);

  useEffect(() => {
    let isMounted = true;

    const loadSelectors = async () => {
      setSelectorsLoading(true);
      setSelectorsError("");

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
        console.error("Failed to load scoreboard selectors:", error);
        setSelectorsError(error?.response?.data?.error || "Unable to load drives/jobs.");
      } finally {
        if (isMounted) setSelectorsLoading(false);
      }
    };

    loadSelectors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isContextMode) return;
    setSelectedDriveId(String(driveId || ""));
    setSelectedJobName(String(jobNameFromParams || ""));
  }, [driveId, isContextMode, jobNameFromParams]);

  useEffect(() => {
    if (isContextMode) return;
    setSelectedJobName("");
  }, [selectedDriveId, isContextMode]);

  const selectedDrive = useMemo(
    () =>
      drives.find(
        (drive) =>
          String(drive._id || drive.id || "") === String(selectedDriveId || "") ||
          String(drive.DriveID || "").toLowerCase() === String(selectedDriveId || "").toLowerCase(),
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
      const name = String(job.JobName || "").trim();
      if (!name) return false;

      if (configuredOpenings.has(safeLower(name))) return true;

      const driveMap = job.Drive && typeof job.Drive === "object" ? job.Drive : {};
      return driveCode ? Object.prototype.hasOwnProperty.call(driveMap, driveCode) : false;
    });
  }, [jobs, selectedDrive]);

  const effectiveDriveId = isContextMode ? String(driveId || "") : String(selectedDriveId || "");
  const effectiveJobName = isContextMode ? String(jobNameFromParams || "") : String(selectedJobName || "");

  const { loading, error, rows, driveLabel } = useDriveJobScoreboard({
    driveId: effectiveDriveId,
    jobName: effectiveJobName,
  });

  return (
    <HrShell
      title="Leaderboard"
      subtitle={
        isContextMode
          ? `Drive-job score view for ${driveLabel || `${collegeName} (${jobNameFromParams})`}.`
          : ""
      }
    >
      {selectorsError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {selectorsError}
        </div>
      ) : null}

      {!isContextMode ? (
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-gray-600 mb-1">Drive</span>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={selectedDriveId}
                onChange={(event) => setSelectedDriveId(event.target.value)}
                disabled={selectorsLoading}
              >
                <option value="">Select Drive</option>
                {drives.map((drive) => {
                  const driveKey = String(drive._id || drive.id || drive.DriveID || "");
                  const driveText = `${drive.DriveID || "-"} - ${drive.CollegeName || "-"}`;
                  return (
                    <option key={driveKey} value={driveKey}>
                      {driveText}
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
                disabled={!selectedDrive || selectorsLoading}
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
        </section>
      ) : null}

      {!effectiveDriveId || !effectiveJobName ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-600">
          Select drive and job to view scoreboard.
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-gray-500" size={36} />
          <p className="text-gray-600 font-medium">Loading scoreboard...</p>
        </div>
      ) : error ? (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={36} />
          <h2 className="text-xl font-bold text-red-600 mb-2">Unable to load scoreboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-xl font-bold" style={{ color: colors.stonewash }}>
              Leaderboard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Candidate scores for Aptitude, GD, and PI in this drive-job combination.
            </p>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="min-w-full">
              <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Panelists
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Aptitude
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    GD
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    PI
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No candidates found for this drive and job.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.key} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{row.candidateName}</p>
                        <p className="text-xs text-gray-500">
                          {row.candidateId} | {row.candidateEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.panelists.length > 0 ? row.panelists.join(", ") : "Not mapped"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.aptitudeScore}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.gdScore}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.piScore}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </HrShell>
  );
}
