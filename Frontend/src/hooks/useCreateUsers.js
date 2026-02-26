import { useEffect, useMemo, useRef, useState } from "react";
import {
  bulkInsertCandidates,
  createCandidate,
  deleteCandidate,
  fetchCandidates,
  updateCandidate,
} from "../services/candidatesService";
import { fetchJobs } from "../services/jobsService";
import { fetchDrives } from "../services/drivesService";
import { buildCandidatesCsv, parseCsvCandidates } from "../utils/csvCandidates";

const EMPTY_NEW_USER = {
  name: "",
  email: "",
  college: "",
  AssignedJobs: [],
};

export default function useCreateUsers({ drivesProp = [] } = {}) {
  const fileInputRef = useRef(null);

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState(drivesProp || []);

  const [importing, setImporting] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);

  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignCtx, setAssignCtx] = useState({
    candidateId: null,
    filterKeys: [],
    filterBy: "JobName",
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const loadCandidates = async () => {
    try {
      const data = await fetchCandidates({ limit: 5000 });
      const normalized = (data || []).map((candidate) => {
        const AssignedJobs = Array.isArray(candidate.AssignedJobs)
          ? candidate.AssignedJobs.filter(Boolean).map(String)
          : [];
        return { ...candidate, AssignedJobs };
      });
      setCandidates(normalized);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await fetchJobs({ limit: 5000 });
      const jobsData = (data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    }
  };

  const loadDrives = async () => {
    try {
      const data = await fetchDrives({ limit: 5000 });
      const drivesData = (data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        JobsOpening: Array.isArray(doc.JobsOpening) ? doc.JobsOpening : [],
      }));
      setDrives(drivesData);
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  };

  useEffect(() => {
    loadCandidates();
    loadJobs();
    loadDrives();
  }, []);

  const handleCreateCandidate = async () => {
    if (!newUser.name || !newUser.email || !newUser.college) {
      alert("Please fill in Name, Email, and College fields");
      return;
    }

    try {
      const payload = {
        ...newUser,
        AssignedJobs: Array.isArray(newUser.AssignedJobs)
          ? newUser.AssignedJobs
          : [],
      };

      await createCandidate(payload);
      await loadCandidates();

      alert("New Candidate Inserted Successfully!");
      setNewUser(EMPTY_NEW_USER);
    } catch (error) {
      console.error("Error creating candidate:", error);
      alert("Failed to create candidate");
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      await deleteCandidate(candidateId);
      setCandidates((prev) => prev.filter((candidate) => candidate._id !== candidateId));
      alert("Candidate Deleted Successfully!");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const onOpenAssign = (candidate) => {
    const candidateDriveId = String(candidate.driveId || "");
    const drive = drivesMap[candidateDriveId];

    const filterKeys = Array.isArray(drive?.JobsOpening) ? drive.JobsOpening : [];

    setAssignCtx({
      candidateId: candidate._id,
      filterKeys,
      filterBy: "JobName",
    });

    setIsAssignOpen(true);
  };

  const handleAssigned = async ({ jobs: assignedJobs, candidateId, mode }) => {
    const names = (assignedJobs || [])
      .map((job) => String(job?.[assignCtx.filterBy] ?? ""))
      .filter(Boolean);

    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate._id === candidateId
          ? {
              ...candidate,
              AssignedJobs:
                mode === "clear"
                  ? []
                  : Array.from(
                      new Set([
                        ...(Array.isArray(candidate.AssignedJobs)
                          ? candidate.AssignedJobs.map(String)
                          : []),
                        ...names,
                      ]),
                    ),
            }
          : candidate,
      ),
    );
    await loadCandidates();
  };

  const uniqueColleges = useMemo(
    () =>
      [...new Set(candidates.map((candidate) => candidate.college).filter(Boolean))].sort(),
    [candidates],
  );

  const uniqueJobs = useMemo(() => {
    const flat = candidates.flatMap((candidate) =>
      Array.isArray(candidate.AssignedJobs) ? candidate.AssignedJobs : [],
    );
    return [...new Set(flat.filter(Boolean).map(String))].sort();
  }, [candidates]);

  const drivesMap = useMemo(
    () =>
      Object.fromEntries(
        (drives || []).map((drive) => [
          String(drive._id || drive.id || drive.DriveID || ""),
          drive,
        ]),
      ),
    [drives],
  );

  const getDriveName = (driveId) => {
    const drive = drivesMap[String(driveId || "")];
    if (!drive) return null;

    const driveCode = drive.DriveID || drive.driveId || "";
    const collegeName = drive.CollegeName || drive.collegeName || "";
    return `${driveCode} - ${collegeName}`.trim();
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    const name = String(candidate.name || "").toLowerCase();
    const email = String(candidate.email || "").toLowerCase();
    const college = String(candidate.college || "").toLowerCase();

    const matchesSearch =
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      college.includes(searchLower);

    const matchesCollege =
      collegeFilter === "" || college === collegeFilter.toLowerCase();

    const jobsArr = Array.isArray(candidate.AssignedJobs)
      ? candidate.AssignedJobs.map((value) => String(value).toLowerCase())
      : [];

    const matchesJob =
      jobFilter === "" || jobsArr.includes(jobFilter.toLowerCase());

    return matchesSearch && matchesCollege && matchesJob;
  });

  const exportCandidatesToCsv = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available to export.");
      return;
    }

    const csvString = buildCandidatesCsv(filteredCandidates);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const fileDate = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `candidates_${fileDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const openEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setIsEditOpen(true);
  };

  const closeEditCandidate = () => {
    setEditingCandidate(null);
    setIsEditOpen(false);
  };

  const saveCandidateEdits = async (candidateId, payload) => {
    try {
      const response = await updateCandidate(candidateId, payload);
      if (response?.success) {
        await loadCandidates();
        alert("Candidate updated successfully!");
        closeEditCandidate();
      } else {
        alert("Failed to update candidate: " + (response?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating candidate:", error);
      alert("Failed to update candidate.");
    }
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const fileText = await file.text();
      const parsedCandidates = parseCsvCandidates(fileText);

      if (parsedCandidates.length === 0) {
        alert("No valid candidate rows found in the file.");
        return;
      }

      const response = await bulkInsertCandidates(parsedCandidates);

      if (response?.success) {
        await loadCandidates();
        alert(
          `Imported ${response.insertedCount || parsedCandidates.length} candidate(s) successfully.`,
        );
      } else {
        alert("Import failed: " + (response?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error importing candidates:", error);
      alert(error?.response?.data?.error || "Failed to import candidates.");
    } finally {
      setImporting(false);
      if (event.target) event.target.value = "";
    }
  };

  return {
    fileInputRef,
    candidates,
    jobs,
    drives,
    importing,
    newUser,
    setNewUser,
    searchTerm,
    setSearchTerm,
    collegeFilter,
    setCollegeFilter,
    jobFilter,
    setJobFilter,
    isAssignOpen,
    setIsAssignOpen,
    assignCtx,
    isEditOpen,
    editingCandidate,
    uniqueColleges,
    uniqueJobs,
    filteredCandidates,
    getDriveName,
    handleCreateCandidate,
    handleDeleteCandidate,
    onOpenAssign,
    handleAssigned,
    exportCandidatesToCsv,
    onImportClick,
    onFileChange,
    openEditCandidate,
    closeEditCandidate,
    saveCandidateEdits,
  };
}
