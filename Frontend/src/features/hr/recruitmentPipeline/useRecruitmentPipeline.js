/**
 * File Type: Business Logic Hook
 * Input Type: None
 * Output Type:
 * {
 *   activeView, loading, loadError, drives, selectedDrive, selectedDriveId, setSelectedDriveId,
 *   availableJobs, selectedJobRef, setSelectedJobRef, selectedFlowStages, savedTemplates,
 *   statsData, navItems, viewHeader, switchPipelineView, toggleFlowStage,
 *   handleSaveFlowTemplate, handleDeleteFlowTemplate, getJobKey, getDriveKey
 * }
 */
import { Briefcase, CheckCircle2, Link2, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchDrives } from "../../../services/drivesService";
import { fetchJobs } from "../../../services/jobsService";
import {
  deleteRecruitmentFlowTemplate,
  listRecruitmentFlowTemplates,
  upsertRecruitmentFlowTemplate,
} from "../../../utils/recruitmentFlowTemplates";
import {
  FLOW_STAGE_OPTIONS,
  PIPELINE_NAV_ITEMS,
  PIPELINE_VIEW_HEADERS,
  PIPELINE_VIEWS,
} from "./constants";
import { getDriveKey, getJobKey, resolveAvailableJobs, safeLower, safeText, uniqueJobTemplateCount } from "./utils";

export default function useRecruitmentPipeline({ colors }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [selectedJobRef, setSelectedJobRef] = useState("");
  const [selectedFlowStages, setSelectedFlowStages] = useState(FLOW_STAGE_OPTIONS);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const activeViewRaw = safeLower(searchParams.get("view"));
  const activeView = Object.values(PIPELINE_VIEWS).includes(activeViewRaw) ? activeViewRaw : PIPELINE_VIEWS.HOME;

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [fetchedDrives, fetchedJobs] = await Promise.all([fetchDrives({ limit: 5000 }), fetchJobs({ limit: 5000 })]);
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
    () => drives.find((drive) => getDriveKey(drive) === String(selectedDriveId)) || null,
    [drives, selectedDriveId],
  );
  const availableJobs = useMemo(() => resolveAvailableJobs({ selectedDrive, jobs }), [selectedDrive, jobs]);
  const selectedJob = useMemo(
    () => availableJobs.find((job) => getJobKey(job) === selectedJobRef) || null,
    [availableJobs, selectedJobRef],
  );

  const switchPipelineView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === PIPELINE_VIEWS.HOME) nextParams.delete("view");
    else nextParams.set("view", nextView);
    setSearchParams(nextParams);
  };

  const toggleFlowStage = (stageName) =>
    setSelectedFlowStages((prev) => (prev.includes(stageName) ? prev.filter((stage) => stage !== stageName) : [...prev, stageName]));

  const handleSaveFlowTemplate = () => {
    if (!selectedDrive || !selectedJob) return alert("Choose drive and job before saving flow template.");
    if (selectedFlowStages.length === 0) return alert("Select at least one stage for the flow.");
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
    const shouldDelete = window.confirm(`Delete flow assignment for ${driveLabel} -> ${jobName}?`);
    if (!shouldDelete) return;
    const deleted = deleteRecruitmentFlowTemplate({ driveRef: template?.driveRef, jobName: template?.jobName, driveLabel: template?.driveLabel });
    if (!deleted) return alert("Flow assignment not found or already removed.");
    setSavedTemplates(listRecruitmentFlowTemplates());
  };

  const statsData = useMemo(
    () => [
      { title: "Drives", count: drives.length, icon: MapPin, bgColor: colors.rainShadow, lightBg: "#E8F9F0" },
      { title: "Jobs", count: jobs.length, icon: Briefcase, bgColor: colors.softFlow, lightBg: "#E6F9F5" },
      { title: "Saved Flows", count: savedTemplates.length, icon: Link2, bgColor: colors.marigoldFlame, lightBg: "#FFF9E6" },
      { title: "Jobs With Custom Flow", count: uniqueJobTemplateCount(savedTemplates), icon: CheckCircle2, bgColor: colors.mossRock, lightBg: "#E8F9E8" },
    ],
    [colors.marigoldFlame, colors.mossRock, colors.rainShadow, colors.softFlow, drives.length, jobs.length, savedTemplates],
  );

  return {
    activeView,
    loading,
    loadError,
    drives,
    selectedDrive,
    selectedDriveId,
    setSelectedDriveId,
    availableJobs,
    selectedJobRef,
    setSelectedJobRef,
    selectedFlowStages,
    savedTemplates,
    statsData,
    navItems: PIPELINE_NAV_ITEMS,
    viewHeader: PIPELINE_VIEW_HEADERS[activeView],
    switchPipelineView,
    toggleFlowStage,
    handleSaveFlowTemplate,
    handleDeleteFlowTemplate,
    getJobKey,
    getDriveKey,
  };
}
