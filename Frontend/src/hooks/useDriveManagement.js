import { useEffect, useMemo, useState } from "react";
import {
  createDrive,
  deleteDrive,
  fetchDriveById,
  fetchDrives,
  updateDrive,
} from "../services/drivesService";
import { fetchJobs } from "../services/jobsService";

const EMPTY_DRIVE_FORM = {
  DriveID: "",
  CollegeName: "",
  StartDate: "",
  EndDate: "",
  JobsOpening: [],
  Status: "Draft",
};

const getFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const normalizeStatus = (value) => {
  const status = String(value || "Draft").trim().toLowerCase();
  if (status === "live") return "Live";
  if (status === "closed") return "Closed";
  return "Draft";
};

const normalizeJobsOpening = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeDateForInput = (value) => {
  if (!value) return "";
  const stringValue = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) return stringValue;
  if (stringValue.includes("T")) return stringValue.slice(0, 10);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const normalizeDrive = (doc = {}) => {
  const normalizedId = getFirstDefined(doc.id, doc._id, doc.driveId, doc.DriveID, "");
  const normalizedDriveId = getFirstDefined(
    doc.DriveID,
    doc.driveId,
    doc.driveID,
    "",
  );
  const normalizedCollegeName = getFirstDefined(
    doc.CollegeName,
    doc.collegeName,
    doc.college,
    "",
  );
  const normalizedStartDate = getFirstDefined(
    doc.StartDate,
    doc.startDate,
    doc.start_date,
    "",
  );
  const normalizedEndDate = getFirstDefined(doc.EndDate, doc.endDate, doc.end_date, "");
  const normalizedJobs = getFirstDefined(
    doc.JobsOpening,
    doc.jobsOpening,
    doc.JobOpening,
    doc.jobOpening,
    [],
  );
  const normalizedStatus = getFirstDefined(doc.Status, doc.status, "Draft");
  const normalizedCandidateCount = getFirstDefined(
    doc.NumberOfCandidates,
    doc.numberOfCandidates,
    doc.CandidateCount,
    doc.candidateCount,
    0,
  );
  const normalizedSelected = getFirstDefined(
    doc.Selected,
    doc.selected,
    doc.SelectedCount,
    doc.selectedCount,
    0,
  );

  return {
    ...doc,
    id: normalizedId,
    DriveID: String(normalizedDriveId || "").trim(),
    CollegeName: String(normalizedCollegeName || "").trim(),
    StartDate: normalizeDateForInput(normalizedStartDate),
    EndDate: normalizeDateForInput(normalizedEndDate),
    JobsOpening: normalizeJobsOpening(normalizedJobs),
    Status: normalizeStatus(normalizedStatus),
    NumberOfCandidates: Number(normalizedCandidateCount) || 0,
    Selected: Number(normalizedSelected) || 0,
  };
};

export default function useDriveManagement({ onDrivesUpdate } = {}) {
  const [jobs, setJobs] = useState([]);
  const [jobCount, setJobCount] = useState(0);

  const [drives, setDrives] = useState([]);
  const [drivesLoading, setDrivesLoading] = useState(true);
  const [drivesError, setDrivesError] = useState(null);

  const [newDrive, setNewDrive] = useState(EMPTY_DRIVE_FORM);

  const [selectedJob, setSelectedJob] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  const loadJobs = async () => {
    try {
      const data = await fetchJobs({ limit: 5000 });
      const jobsData = (data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));

      setJobs(jobsData);
      setJobCount(jobsData.length);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setJobCount(0);
    }
  };

  const loadDrives = async () => {
    try {
      setDrivesLoading(true);
      const data = await fetchDrives({ limit: 5000 });
      const drivesData = (data || []).map((doc) => normalizeDrive(doc));

      setDrives(drivesData);
      setDrivesError(null);
    } catch (error) {
      console.error("Error fetching drives:", error);
      setDrives([]);
      setDrivesError("Failed to fetch drives from database. Please try again.");
    } finally {
      setDrivesLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    loadDrives();
  }, []);

  useEffect(() => {
    if (onDrivesUpdate) {
      onDrivesUpdate(drives);
    }
  }, [drives, onDrivesUpdate]);

  const handleCreateDrive = async () => {
    const payload = {
      DriveID: newDrive.DriveID.trim(),
      CollegeName: newDrive.CollegeName.trim(),
      StartDate: newDrive.StartDate,
      EndDate: newDrive.EndDate,
      JobsOpening: Array.isArray(newDrive.JobsOpening) ? newDrive.JobsOpening : [],
      Status: newDrive.Status || "Draft",
      NumberOfCandidates: 0,
      Selected: 0,
    };

    if (!payload.DriveID || !payload.CollegeName || !payload.StartDate || !payload.EndDate) {
      alert("Please fill Drive ID, College Name, Start Date and End Date.");
      return;
    }

    if (payload.JobsOpening.length === 0) {
      alert("Please select at least one job in Jobs Opening.");
      return;
    }

    if (new Date(payload.EndDate) < new Date(payload.StartDate)) {
      alert("End Date cannot be before Start Date.");
      return;
    }

    if (
      drives.some(
        (drive) =>
          String(drive.DriveID || "").toLowerCase() === payload.DriveID.toLowerCase(),
      )
    ) {
      alert("Drive ID already exists.");
      return;
    }

    try {
      const response = await createDrive(payload);
      if (response?.success) {
        setNewDrive(EMPTY_DRIVE_FORM);
        await loadDrives();
        await loadJobs();
        alert("Campus Drive created successfully.");
      } else {
        alert("Failed to create drive: " + (response?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating drive:", error);
      alert("Failed to create drive. Please check your connection and try again.");
    }
  };

  const handleDeleteDrive = async (driveToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${driveToDelete.DriveID}" (${driveToDelete.CollegeName})?`,
      )
    ) {
      const driveId = driveToDelete.id || driveToDelete._id;
      if (!driveId) {
        alert("Unable to delete drive: missing drive id.");
        return;
      }

      try {
        const response = await deleteDrive(driveId);
        if (response?.success) {
          await loadDrives();
          alert("Drive deleted successfully.");
        } else {
          alert("Failed to delete drive: " + (response?.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting drive:", error);
        alert("Failed to delete drive. Please check your connection and try again.");
      }
    }
  };

  const openEditDrive = async (drive) => {
    const normalizedLocalDrive = normalizeDrive(drive);
    const driveId = normalizedLocalDrive.id || normalizedLocalDrive._id;

    setEditingDrive(normalizedLocalDrive);
    setIsEditOpen(true);

    if (!driveId) return;

    try {
      const latestDrive = await fetchDriveById(driveId);
      if (!latestDrive) return;

      setEditingDrive((currentDrive) => {
        const currentId = currentDrive?.id || currentDrive?._id;
        if (String(currentId || "") !== String(driveId)) {
          return currentDrive;
        }

        return normalizeDrive({
          ...currentDrive,
          ...latestDrive,
          id: latestDrive._id || latestDrive.id || driveId,
        });
      });
    } catch (error) {
      console.error("Error fetching latest drive details:", error);
    }
  };

  const closeEditDrive = () => {
    setEditingDrive(null);
    setIsEditOpen(false);
  };

  const saveDriveEdits = async (driveId, payload) => {
    try {
      const response = await updateDrive(driveId, payload);
      if (response?.success) {
        await loadDrives();
        await loadJobs();
        alert("Drive updated successfully.");
        closeEditDrive();
      } else {
        alert("Failed to update drive: " + (response?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating drive:", error);
      alert("Failed to update drive.");
    }
  };

  const uniqueColleges = useMemo(
    () => [...new Set(drives.map((drive) => drive.CollegeName).filter(Boolean))].sort(),
    [drives],
  );

  const availableJobNames = useMemo(
    () => [...new Set(jobs.map((job) => job.JobName).filter(Boolean))].sort(),
    [jobs],
  );

  const filteredDrives = useMemo(
    () =>
      drives.filter((drive) => {
        const searchLower = searchTerm.toLowerCase();
        const jobsOpening = Array.isArray(drive.JobsOpening) ? drive.JobsOpening : [];

        const matchesSearch =
          String(drive.DriveID || "").toLowerCase().includes(searchLower) ||
          String(drive.CollegeName || "").toLowerCase().includes(searchLower) ||
          jobsOpening.join(", ").toLowerCase().includes(searchLower);

        const matchesJob =
          selectedJob === "" ||
          jobsOpening.some(
            (jobName) => String(jobName).toLowerCase() === selectedJob.toLowerCase(),
          );

        const matchesStatus =
          statusFilter === "" ||
          String(drive.Status || "").toLowerCase() === statusFilter.toLowerCase();

        const matchesCollege =
          collegeFilter === "" || String(drive.CollegeName || "") === collegeFilter;

        return matchesSearch && matchesJob && matchesStatus && matchesCollege;
      }),
    [drives, searchTerm, selectedJob, statusFilter, collegeFilter],
  );

  const stats = useMemo(() => {
    const totalCandidates = filteredDrives.reduce(
      (sum, drive) => sum + (Number(drive.NumberOfCandidates) || 0),
      0,
    );
    const totalSelected = filteredDrives.reduce(
      (sum, drive) => sum + (Number(drive.Selected) || 0),
      0,
    );
    const liveDrives = filteredDrives.filter(
      (drive) => String(drive.Status || "").toLowerCase() === "live",
    ).length;

    return {
      totalCandidates,
      totalSelected,
      liveDrives,
      totalDrives: filteredDrives.length,
    };
  }, [filteredDrives]);

  return {
    jobs,
    jobCount,
    drives,
    drivesLoading,
    drivesError,
    newDrive,
    setNewDrive,
    selectedJob,
    setSelectedJob,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    collegeFilter,
    setCollegeFilter,
    uniqueColleges,
    availableJobNames,
    filteredDrives,
    stats,
    handleCreateDrive,
    handleDeleteDrive,
    isEditOpen,
    editingDrive,
    openEditDrive,
    closeEditDrive,
    saveDriveEdits,
  };
}
