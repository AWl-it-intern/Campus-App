/**
 * File Type: Business Logic Hook
 * Input Type: { colors: HrPalette }
 * Output Type: Aptitude view state, selection handlers, dispatch handlers
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { fetchCandidates } from "../../../services/candidatesService";
import { fetchDrives } from "../../../services/drivesService";
import { fetchJobs } from "../../../services/jobsService";
import { buildAptitudeStats } from "./stats";
import { APTITUDE_NAV_ITEMS, APTITUDE_VIEW_HEADERS, APTITUDE_VIEWS } from "./constants";
import { buildSentRows } from "./dispatch";
import { nextAptitudeCustomId, readAptitudeDispatchLog, writeAptitudeDispatchLog } from "./storage";
import useAptitudeSelectionState from "./useAptitudeSelectionState";
import { getCandidateKey, getJobKey, safeLower, safeText } from "./utils";

export default function useAptitudeTestManagement({ colors }) {
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
  const activeView = Object.values(APTITUDE_VIEWS).includes(activeViewRaw) ? activeViewRaw : APTITUDE_VIEWS.HOME;

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [fetchedDrives, fetchedJobs, fetchedCandidates] = await Promise.all([fetchDrives({ limit: 5000 }), fetchJobs({ limit: 5000 }), fetchCandidates({ limit: 5000 })]);
        if (!isMounted) return;
        setDrives(Array.isArray(fetchedDrives) ? fetchedDrives : []);
        setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
        setCandidates(Array.isArray(fetchedCandidates) ? fetchedCandidates : []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError?.response?.data?.error || "Unable to load aptitude management data.");
      } finally {
        if (isMounted) setLoading(false);
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
  useEffect(() => setSelectedCandidateIds([]), [selectedJobRef]);

  const {
    selectedDrive,
    availableJobs,
    selectedJob,
    targetCandidates,
    selectedCandidateSet,
    allVisibleSelected,
    toggleCandidateSelection,
    toggleSelectAllVisible,
  } = useAptitudeSelectionState({
    drives,
    jobs,
    candidates,
    searchText,
    stateDriveRef,
    stateJobName,
    selectedDriveId,
    setSelectedDriveId,
    selectedJobRef,
    setSelectedJobRef,
    selectedCandidateIds,
    setSelectedCandidateIds,
  });

  const switchAptitudeView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === APTITUDE_VIEWS.HOME) nextParams.delete("view");
    else nextParams.set("view", nextView);
    setSearchParams(nextParams);
  };
  const handleSendAptitudeLink = () => {
    if (!selectedDrive || !selectedJob) return alert("Select drive and job before sending aptitude link.");
    if (!aptitudeLink.trim()) return alert("Enter an aptitude test link first.");
    if (selectedCandidateIds.length === 0) return alert("Select at least one candidate.");
    const sentRows = buildSentRows({ selectedCandidateIds, targetCandidates, selectedDrive, selectedJob, aptitudeLink, nextId: nextAptitudeCustomId });
    setDispatchLog((prev) => {
      const nextLog = [...sentRows, ...prev].slice(0, 200);
      writeAptitudeDispatchLog(nextLog);
      return nextLog;
    });
    setSelectedCandidateIds([]);
    alert(`Aptitude dispatch queued for ${sentRows.length} candidate(s).`);
  };

  const statsData = useMemo(() => buildAptitudeStats({
    drivesCount: drives.length,
    jobsCount: jobs.length,
    candidatesCount: candidates.length,
    trackedCount: dispatchLog.length,
    colors,
  }), [drives.length, jobs.length, candidates.length, dispatchLog.length, colors]);

  return {
    activeView,
    viewHeader: APTITUDE_VIEW_HEADERS[activeView],
    navItems: APTITUDE_NAV_ITEMS,
    loading,
    error,
    drives,
    selectedDrive,
    selectedDriveId,
    setSelectedDriveId,
    availableJobs,
    selectedJobRef,
    setSelectedJobRef,
    searchText,
    setSearchText,
    aptitudeLink,
    setAptitudeLink,
    selectedCandidateIds,
    dispatchLog,
    targetCandidates,
    selectedCandidateSet,
    allVisibleSelected,
    statsData,
    getJobKey,
    getCandidateKey,
    switchAptitudeView,
    toggleCandidateSelection,
    toggleSelectAllVisible,
    handleSendAptitudeLink,
  };
}
