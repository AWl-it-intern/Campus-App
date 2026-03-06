import {
  Briefcase,
  CheckCircle2,
  Link2,
  MapPin,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import HrShell from "../../Components/common/HrShell.jsx";
import { fetchCandidates } from "../../services/candidatesService";
import { fetchDrives } from "../../services/drivesService";
import { fetchJobs } from "../../services/jobsService";
import HR_COLORS from "../../theme/hrPalette";

const safeLower = (value) => String(value || "").trim().toLowerCase();

const splitAssignedJobs = (candidate) => {
  if (Array.isArray(candidate?.AssignedJobs)) {
    return candidate.AssignedJobs.map((job) => String(job || "").trim()).filter(Boolean);
  }

  const rawText = String(candidate?.AssignedJob || "");
  return rawText
    .split(/[;,]/)
    .map((job) => job.trim())
    .filter(Boolean);
};

const normalizeDriveKeys = (drive = {}) =>
  new Set(
    [drive?._id, drive?.id, drive?.DriveID]
      .filter(Boolean)
      .map((value) => safeLower(value)),
  );

function getCandidateKey(candidate) {
  return String(
    candidate?._id || candidate?.CandidateID || candidate?.id || candidate?.email || "",
  );
}

export default function AptitudeTestManagement() {
  const colors = HR_COLORS;
  const location = useLocation();
  const stateDriveRef = String(location?.state?.driveId || "").trim();
  const stateJobName = String(location?.state?.jobName || "").trim();
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [selectedJobName, setSelectedJobName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [aptitudeLink, setAptitudeLink] = useState("");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [dispatchLog, setDispatchLog] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [fetchedDrives, fetchedJobs, fetchedCandidates] = await Promise.all([
          fetchDrives({ limit: 5000 }),
          fetchJobs({ limit: 5000 }),
          fetchCandidates({ limit: 5000 }),
        ]);

        if (!isMounted) return;
        setDrives(Array.isArray(fetchedDrives) ? fetchedDrives : []);
        setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
        setCandidates(Array.isArray(fetchedCandidates) ? fetchedCandidates : []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError?.response?.data?.error || "Unable to load aptitude management data.");
      } finally {
        if (isMounted) {
          setLoading(false);
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
    setSelectedCandidateIds([]);
  }, [selectedDriveId]);

  useEffect(() => {
    setSelectedCandidateIds([]);
  }, [selectedJobName]);

  const selectedDrive = useMemo(
    () =>
      drives.find(
        (drive) => String(drive._id || drive.id || drive.DriveID) === String(selectedDriveId),
      ) || null,
    [drives, selectedDriveId],
  );

  useEffect(() => {
    if (!stateDriveRef || selectedDriveId || drives.length === 0) return;
    const matchedDrive = drives.find((drive) => {
      const driveRefs = [
        drive?._id,
        drive?.id,
        drive?.DriveID,
      ]
        .filter(Boolean)
        .map((value) => String(value));
      return driveRefs.includes(stateDriveRef);
    });
    if (matchedDrive) {
      setSelectedDriveId(String(matchedDrive._id || matchedDrive.id || matchedDrive.DriveID));
    }
  }, [drives, selectedDriveId, stateDriveRef]);

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

  useEffect(() => {
    if (!stateJobName || selectedJobName || availableJobs.length === 0) return;
    const matched = availableJobs.find(
      (job) => safeLower(job.JobName) === safeLower(stateJobName),
    );
    if (matched) {
      setSelectedJobName(String(matched.JobName || ""));
    }
  }, [availableJobs, selectedJobName, stateJobName]);

  const targetCandidates = useMemo(() => {
    if (!selectedDrive || !selectedJobName) return [];

    const driveKeys = normalizeDriveKeys(selectedDrive);
    const selectedJobLower = safeLower(selectedJobName);
    const query = safeLower(searchText);

    return candidates
      .filter((candidate) => {
        const candidateDriveKeys = [
          candidate?.driveId,
          candidate?.assignedDriveId,
          candidate?.DriveID,
          candidate?.AssignedDriveId,
        ]
          .filter(Boolean)
          .map((value) => safeLower(value));

        const isInDrive = candidateDriveKeys.some((key) => driveKeys.has(key));
        if (!isInDrive) return false;

        const hasJob = splitAssignedJobs(candidate).some(
          (jobName) => safeLower(jobName) === selectedJobLower,
        );
        if (!hasJob) return false;

        if (!query) return true;

        const candidateId = String(candidate.CandidateID || "").toLowerCase();
        const name = String(candidate.name || "").toLowerCase();
        const email = String(candidate.email || "").toLowerCase();
        return candidateId.includes(query) || name.includes(query) || email.includes(query);
      })
      .sort((left, right) =>
        String(left.CandidateID || left.name || "").localeCompare(
          String(right.CandidateID || right.name || ""),
          undefined,
          { sensitivity: "base" },
        ),
      );
  }, [selectedDrive, selectedJobName, candidates, searchText]);

  const selectedCandidateSet = useMemo(
    () => new Set(selectedCandidateIds.map((id) => String(id))),
    [selectedCandidateIds],
  );

  const allVisibleSelected =
    targetCandidates.length > 0 &&
    targetCandidates.every((candidate) => selectedCandidateSet.has(getCandidateKey(candidate)));

  const toggleCandidateSelection = (candidateKey) => {
    setSelectedCandidateIds((prev) => {
      const normalized = String(candidateKey);
      if (prev.includes(normalized)) {
        return prev.filter((value) => value !== normalized);
      }
      return [...prev, normalized];
    });
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleKeys = new Set(targetCandidates.map((candidate) => getCandidateKey(candidate)));
      setSelectedCandidateIds((prev) => prev.filter((value) => !visibleKeys.has(value)));
      return;
    }

    const nextSet = new Set(selectedCandidateIds);
    targetCandidates.forEach((candidate) => nextSet.add(getCandidateKey(candidate)));
    setSelectedCandidateIds(Array.from(nextSet));
  };

  const handleSendAptitudeLink = () => {
    if (!selectedDrive || !selectedJobName) {
      alert("Select drive and job before sending aptitude link.");
      return;
    }

    if (!aptitudeLink.trim()) {
      alert("Enter an aptitude test link first.");
      return;
    }

    if (selectedCandidateIds.length === 0) {
      alert("Select at least one candidate.");
      return;
    }

    const sentAt = new Date().toISOString();
    const driveLabel = `${selectedDrive.DriveID || "-"} - ${selectedDrive.CollegeName || "-"}`;
    const selectedMap = new Map(targetCandidates.map((candidate) => [getCandidateKey(candidate), candidate]));
    const sentRows = selectedCandidateIds
      .map((candidateKey) => selectedMap.get(candidateKey))
      .filter(Boolean)
      .map((candidate) => ({
        candidateKey: getCandidateKey(candidate),
        candidateId: candidate.CandidateID || "-",
        candidateName: candidate.name || "Unnamed Candidate",
        driveLabel,
        jobName: selectedJobName,
        sentAt,
        link: aptitudeLink.trim(),
      }));

    setDispatchLog((prev) => [...sentRows, ...prev].slice(0, 50));
    setSelectedCandidateIds([]);
    alert(`Aptitude test link queued for ${sentRows.length} candidate(s).`);
  };

  return (
    <HrShell
      title="Aptitude Test Management"
      subtitle="Select drive -> job -> candidates and push aptitude test links."
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mb-6">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.stonewash }}>
            <Link2 size={18} />
            Aptitude Link Dispatch
          </h3>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <label className="text-sm">
              <span className="block text-gray-600 mb-1">Aptitude Test Link</span>
              <input
                type="url"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://..."
                value={aptitudeLink}
                onChange={(event) => setAptitudeLink(event.target.value)}
              />
            </label>

            <label className="text-sm">
              <span className="block text-gray-600 mb-1">Search Candidates</span>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Candidate ID / name / email"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm text-gray-600">
              {targetCandidates.length} candidates in selected drive-job | {selectedCandidateIds.length} selected
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                disabled={targetCandidates.length === 0}
              >
                {allVisibleSelected ? "Unselect All" : "Select All"}
              </button>
              <button
                type="button"
                onClick={handleSendAptitudeLink}
                className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2"
                style={{ backgroundColor: colors.stonewash }}
                disabled={selectedCandidateIds.length === 0}
              >
                <Send size={14} />
                Send Link
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="min-w-full">
              <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      disabled={targetCandidates.length === 0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Candidate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                      Loading candidates...
                    </td>
                  </tr>
                ) : targetCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                      No candidates found for selected drive-job.
                    </td>
                  </tr>
                ) : (
                  targetCandidates.map((candidate) => {
                    const candidateKey = getCandidateKey(candidate);
                    const checked = selectedCandidateSet.has(candidateKey);
                    return (
                      <tr key={candidateKey} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCandidateSelection(candidateKey)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{candidate.name || "-"}</p>
                          <p className="text-xs text-gray-500">{candidate.CandidateID || "-"}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{candidate.email || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {candidate.ApplicationStatus || "Under Review"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.stonewash }}>
          Recent Dispatch Activity
        </h3>
        <div className="space-y-2">
          {dispatchLog.length === 0 ? (
            <p className="text-sm text-gray-500">No dispatch events yet.</p>
          ) : (
            dispatchLog.map((entry) => (
              <article
                key={`${entry.candidateKey}-${entry.sentAt}`}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.candidateName} ({entry.candidateId})
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.driveLabel} | {entry.jobName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{new Date(entry.sentAt).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-700 truncate max-w-[240px]">{entry.link}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-semibold">
                  <CheckCircle2 size={12} />
                  Queued
                </span>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { title: "Drives", value: drives.length, icon: MapPin },
          { title: "Jobs", value: jobs.length, icon: Briefcase },
          { title: "Candidates", value: candidates.length, icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-2xl font-bold mt-1 flex items-center gap-2" style={{ color: colors.stonewash }}>
                <Icon size={18} />
                {item.value}
              </p>
            </article>
          );
        })}
      </section>
    </HrShell>
  );
}
