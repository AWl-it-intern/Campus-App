import { Briefcase, CheckCircle2, Link2, MapPin, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import EmptyState from "../../Components/common/EmptyState.jsx";
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import StatsCard from "../../Components/common/StatsCard.jsx";
import { fetchCandidates } from "../../services/candidatesService";
import { fetchDrives } from "../../services/drivesService";
import { fetchJobs } from "../../services/jobsService";
import HR_COLORS from "../../theme/hrPalette";

const APTITUDE_VIEWS = {
  HOME: "home",
  DISPATCH: "aptitude-dispatch",
  LIST: "aptitude-list",
};

const APTITUDE_LOG_STORAGE_KEY = "aptitude_dispatch_log_v1";
const APTITUDE_COUNTER_STORAGE_KEY = "aptitude_dispatch_counter_v1";

const safeText = (value) => String(value || "").trim();
const safeLower = (value) => safeText(value).toLowerCase();

const splitAssignedJobs = (candidate) => {
  if (Array.isArray(candidate?.AssignedJobs)) {
    return candidate.AssignedJobs.map((job) => safeText(job)).filter(Boolean);
  }

  return safeText(candidate?.AssignedJob)
    .split(/[;,]/)
    .map((job) => job.trim())
    .filter(Boolean);
};

const normalizeDriveKeys = (drive = {}) =>
  new Set([drive?._id, drive?.id, drive?.DriveID].filter(Boolean).map((value) => safeLower(value)));

const getJobKey = (job = {}) => safeText(job._id || job.id || job.JobID || job.JobName);

function getCandidateKey(candidate) {
  return safeText(candidate?._id || candidate?.CandidateID || candidate?.id || candidate?.email);
}

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readAptitudeDispatchLog() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(APTITUDE_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAptitudeDispatchLog(nextLog = []) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(APTITUDE_LOG_STORAGE_KEY, JSON.stringify(nextLog));
}

function nextAptitudeCustomId() {
  const storage = getStorage();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  if (!storage) {
    return `APT-${today}-${String(Date.now()).slice(-4)}`;
  }

  const previous = Number.parseInt(storage.getItem(APTITUDE_COUNTER_STORAGE_KEY) || "0", 10);
  const next = Number.isFinite(previous) ? previous + 1 : 1;
  storage.setItem(APTITUDE_COUNTER_STORAGE_KEY, String(next));
  return `APT-${today}-${String(next).padStart(4, "0")}`;
}

export default function AptitudeTestManagement() {
  const colors = HR_COLORS;
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const stateDriveRef = safeText(location?.state?.driveId);
  const stateJobName = safeText(location?.state?.jobName);

  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [selectedJobRef, setSelectedJobRef] = useState("");
  const [searchText, setSearchText] = useState("");
  const [aptitudeLink, setAptitudeLink] = useState("");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [dispatchLog, setDispatchLog] = useState(() => readAptitudeDispatchLog());

  const activeViewRaw = safeLower(searchParams.get("view"));
  const activeView = Object.values(APTITUDE_VIEWS).includes(activeViewRaw)
    ? activeViewRaw
    : APTITUDE_VIEWS.HOME;

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
    setSelectedJobRef("");
    setSelectedCandidateIds([]);
  }, [selectedDriveId]);

  useEffect(() => {
    setSelectedCandidateIds([]);
  }, [selectedJobRef]);

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
      const driveRefs = [drive?._id, drive?.id, drive?.DriveID]
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

  useEffect(() => {
    if (!stateJobName || selectedJobRef || availableJobs.length === 0) return;
    const matched = availableJobs.find((job) => safeLower(job.JobName) === safeLower(stateJobName));
    if (matched) {
      setSelectedJobRef(getJobKey(matched));
    }
  }, [availableJobs, selectedJobRef, stateJobName]);

  const targetCandidates = useMemo(() => {
    if (!selectedDrive || !selectedJob) return [];

    const driveKeys = normalizeDriveKeys(selectedDrive);
    const selectedJobLower = safeLower(selectedJob.JobName);
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

        const candidateId = safeLower(candidate.CandidateID);
        const name = safeLower(candidate.name);
        const email = safeLower(candidate.email);
        return candidateId.includes(query) || name.includes(query) || email.includes(query);
      })
      .sort((left, right) =>
        safeText(left.CandidateID || left.name).localeCompare(
          safeText(right.CandidateID || right.name),
          undefined,
          { sensitivity: "base" },
        ),
      );
  }, [selectedDrive, selectedJob, candidates, searchText]);

  const selectedCandidateSet = useMemo(
    () => new Set(selectedCandidateIds.map((id) => String(id))),
    [selectedCandidateIds],
  );

  const allVisibleSelected =
    targetCandidates.length > 0 &&
    targetCandidates.every((candidate) => selectedCandidateSet.has(getCandidateKey(candidate)));

  const switchAptitudeView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === APTITUDE_VIEWS.HOME) {
      nextParams.delete("view");
    } else {
      nextParams.set("view", nextView);
    }
    setSearchParams(nextParams);
  };

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
    if (!selectedDrive || !selectedJob) {
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
    const selectedMap = new Map(
      targetCandidates.map((candidate) => [getCandidateKey(candidate), candidate]),
    );
    const jobId = safeText(selectedJob.JobID || selectedJob._id || selectedJob.id);
    const jobName = safeText(selectedJob.JobName);

    const sentRows = selectedCandidateIds
      .map((candidateKey) => selectedMap.get(candidateKey))
      .filter(Boolean)
      .map((candidate) => ({
        aptitudeId: nextAptitudeCustomId(),
        candidateKey: getCandidateKey(candidate),
        candidateId: safeText(candidate.CandidateID) || "-",
        candidateName: safeText(candidate.name) || "Unnamed Candidate",
        driveLabel,
        jobId: jobId || "-",
        jobName: jobName || "-",
        sentAt,
        link: aptitudeLink.trim(),
        status: "Queued",
      }));

    setDispatchLog((prev) => {
      const nextLog = [...sentRows, ...prev].slice(0, 200);
      writeAptitudeDispatchLog(nextLog);
      return nextLog;
    });

    setSelectedCandidateIds([]);
    alert(`Aptitude dispatch queued for ${sentRows.length} candidate(s).`);
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
        title: "Candidates",
        count: candidates.length,
        icon: Users,
        bgColor: colors.marigoldFlame,
        lightBg: "#FFF9E6",
      },
      {
        title: "Tracked Aptitude IDs",
        count: dispatchLog.length,
        icon: CheckCircle2,
        bgColor: colors.mossRock,
        lightBg: "#E8F9E8",
      },
    ],
    [
      drives.length,
      jobs.length,
      candidates.length,
      dispatchLog.length,
      colors.rainShadow,
      colors.softFlow,
      colors.marigoldFlame,
      colors.mossRock,
    ],
  );

  const aptitudeNavItems = [
    { key: APTITUDE_VIEWS.HOME, label: "Home" },
    { key: APTITUDE_VIEWS.DISPATCH, label: "Aptitude Dispatch" },
    { key: APTITUDE_VIEWS.LIST, label: "List of Aptitude" },
  ];

  const viewHeader = {
    [APTITUDE_VIEWS.HOME]: {
      title: "Aptitude Test Management",
      subtitle: "Monitor aptitude activity with custom IDs for fast tracking.",
    },
    [APTITUDE_VIEWS.DISPATCH]: {
      title: "Aptitude Dispatch",
      subtitle: "Select drive/job, choose candidates, and dispatch aptitude links.",
    },
    [APTITUDE_VIEWS.LIST]: {
      title: "List of Aptitude",
      subtitle: "Track active aptitude dispatch records by custom Aptitude ID.",
    },
  }[activeView];

  return (
    <HrShell
      title={viewHeader.title}
      subtitle={viewHeader.subtitle}
      topNav={
        <SectionNavBar
          items={aptitudeNavItems}
          activeKey={activeView}
          onChange={switchAptitudeView}
        />
      }
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {activeView === APTITUDE_VIEWS.HOME ? (
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

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.stonewash }}>
              Aptitude Tracking
            </h3>
            <p className="text-sm text-gray-600">
              Every dispatched aptitude record is tagged with a custom Aptitude ID (format:
              APT-YYYYMMDD-XXXX) so you can audit and track ongoing aptitude runs quickly.
            </p>
          </section>
        </>
      ) : null}

      {activeView === APTITUDE_VIEWS.DISPATCH ? (
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
                {targetCandidates.length} candidates in selected drive-job |{" "}
                {selectedCandidateIds.length} selected
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
      ) : null}

      {activeView === APTITUDE_VIEWS.LIST ? (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: colors.stonewash }}>
              Ongoing Aptitude Dispatches
            </h3>
            <span className="text-sm text-gray-600">{dispatchLog.length} tracked</span>
          </div>

          {dispatchLog.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Link2}
                title="No aptitude dispatch records"
                message="Dispatch aptitude links from the Aptitude Dispatch tab to start tracking."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Aptitude ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Drive
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Job ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Job
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Sent At
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchLog.map((entry) => (
                    <tr key={`${entry.aptitudeId}-${entry.candidateKey}-${entry.sentAt}`} className="border-t border-gray-100">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {entry.aptitudeId || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <p className="font-medium">{entry.candidateName || "-"}</p>
                        <p className="text-xs text-gray-500">{entry.candidateId || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{entry.driveLabel || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{entry.jobId || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{entry.jobName || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {entry.sentAt ? new Date(entry.sentAt).toLocaleString("en-IN") : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-semibold">
                          <CheckCircle2 size={12} />
                          {entry.status || "Queued"}
                        </span>
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
