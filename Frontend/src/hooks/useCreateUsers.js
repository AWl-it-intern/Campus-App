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

const candidateSortKey = (candidate) => {
  const candidateId = String(candidate?.CandidateID || "").trim().toUpperCase();
  const match = candidateId.match(/^CND(\d+)$/);
  if (match) return Number(match[1]);
  return Number.MAX_SAFE_INTEGER;
};

const getCandidateKey = (candidate) =>
  String(candidate?._id || candidate?.id || candidate?.CandidateID || "").trim();

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
    candidateName: "",
    candidateEmail: "",
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

  const handleDeleteCandidatesBulk = async (candidateIds = []) => {
    const ids = Array.from(
      new Set((candidateIds || []).map((value) => String(value || "").trim()).filter(Boolean)),
    );
    if (ids.length === 0) {
      return { deletedCount: 0, failedCount: 0, failedIds: [] };
    }

    const results = await Promise.allSettled(ids.map((candidateId) => deleteCandidate(candidateId)));
    const deletedIds = [];
    const failedIds = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        deletedIds.push(ids[index]);
        return;
      }
      failedIds.push(ids[index]);
    });

    if (deletedIds.length > 0) {
      const deletedSet = new Set(deletedIds);
      setCandidates((prev) =>
        prev.filter((candidate) => !deletedSet.has(getCandidateKey(candidate))),
      );
    }

    if (failedIds.length > 0) {
      await loadCandidates();
    }

    return {
      deletedCount: deletedIds.length,
      failedCount: failedIds.length,
      failedIds,
    };
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      const result = await handleDeleteCandidatesBulk([candidateId]);
      if (result.deletedCount === 1 && result.failedCount === 0) {
        alert("Candidate Deleted Successfully!");
      } else {
        alert("Failed to delete candidate");
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const onOpenAssign = (candidate) => {
    const candidateDriveId = String(candidate.driveId || candidate.DriveID || "");
    const drive = drivesMap[candidateDriveId];

    const filterKeys = Array.isArray(drive?.JobsOpening) ? drive.JobsOpening : [];

    setAssignCtx({
      candidateId: candidate._id,
      candidateName: candidate.name || "",
      candidateEmail: candidate.email || "",
      filterKeys,
      filterBy: "JobName",
    });

    setIsAssignOpen(true);
  };

  const handleAssigned = async ({
    jobs: assignedJobs,
    candidateId,
    candidateIds,
    mode,
    filterBy,
  }) => {
    const targetIds = Array.isArray(candidateIds) && candidateIds.length > 0
      ? candidateIds
      : candidateId
        ? [candidateId]
        : [];
    if (targetIds.length === 0) return;

    const targetIdSet = new Set(targetIds.map((value) => String(value)));
    const keyName = String(filterBy || assignCtx.filterBy || "JobName");
    const names = (assignedJobs || [])
      .map((job) => String(job?.[keyName] ?? ""))
      .filter(Boolean);

    setCandidates((prev) =>
      prev.map((candidate) =>
        targetIdSet.has(String(candidate._id))
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
    return String(driveCode || "").trim();
  };

  const filteredCandidates = useMemo(
    () =>
      candidates
        .filter((candidate) => {
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
        })
        .sort((left, right) => {
          const idDelta = candidateSortKey(left) - candidateSortKey(right);
          if (idDelta !== 0) return idDelta;
          return String(left.name || "").localeCompare(String(right.name || ""), undefined, {
            sensitivity: "base",
          });
        }),
    [candidates, searchTerm, collegeFilter, jobFilter],
  );

  const exportCandidatesToCsv = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available to export.");
      return;
    }

    const csvString = buildCandidatesCsv(filteredCandidates, { drives });
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
    handleDeleteCandidatesBulk,
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
