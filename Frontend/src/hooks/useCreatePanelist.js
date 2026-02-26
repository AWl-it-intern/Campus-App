import { useEffect, useMemo, useState } from "react";
import { fetchCandidates } from "../services/candidatesService";
import { fetchJobs } from "../services/jobsService";
import {
  createPanelist,
  deletePanelist,
  fetchPanelists,
  updatePanelist,
} from "../services/panelistsService";

const EMPTY_PANELIST = {
  name: "",
  email: "",
  designation: "",
  expertise: "",
};

export default function useCreatePanelist({ onPanelistsUpdate } = {}) {
  const [fetchedCandidates, setFetchedCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [fetchedJobs, setFetchedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [panelists, setPanelists] = useState([]);
  const [panelistsLoading, setPanelistsLoading] = useState(true);
  const [panelistsError, setPanelistsError] = useState(null);

  const [newPanelist, setNewPanelist] = useState(EMPTY_PANELIST);

  const [searchTerm, setSearchTerm] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPanelist, setSelectedPanelist] = useState(null);
  const [selectedJobsForAssignment, setSelectedJobsForAssignment] = useState([]);

  const [scheduleData, setScheduleData] = useState({
    candidateId: "",
    type: "GD",
    date: "",
    time: "",
  });

  const loadCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const data = await fetchCandidates({ limit: 5000 });
      const candidatesData = (data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));
      setFetchedCandidates(candidatesData);
      setFetchError(null);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setFetchError("Failed to fetch candidates/jobs from database. Please try again.");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      const data = await fetchJobs({ limit: 5000 });
      const jobsData = (data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));
      setFetchedJobs(jobsData);
      setFetchError(null);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setFetchError("Failed to fetch candidates/jobs from database. Please try again.");
    } finally {
      setJobsLoading(false);
    }
  };

  const loadPanelists = async () => {
    try {
      setPanelistsLoading(true);
      const data = await fetchPanelists({ limit: 5000 });
      const panelistsData = (data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        assignedJobs: doc.assignedJobs || [],
        scheduledRounds: doc.scheduledRounds || [],
      }));
      setPanelists(panelistsData);
      setPanelistsError(null);
    } catch (error) {
      console.error("Error fetching panelists:", error);
      setPanelistsError("Failed to fetch panelists from database. Please try again.");
      setPanelists([]);
    } finally {
      setPanelistsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
    loadJobs();
    loadPanelists();
  }, []);

  useEffect(() => {
    if (onPanelistsUpdate) {
      onPanelistsUpdate(panelists);
    }
  }, [panelists, onPanelistsUpdate]);

  const handleCreatePanelist = async () => {
    if (!newPanelist.name || !newPanelist.email || !newPanelist.designation || !newPanelist.expertise) {
      alert("Please fill in all fields");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newPanelist.email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const response = await createPanelist({
        name: newPanelist.name,
        email: newPanelist.email,
        designation: newPanelist.designation,
        expertise: newPanelist.expertise,
      });

      if (response?.success) {
        setNewPanelist(EMPTY_PANELIST);
        await loadPanelists();
        alert("Panelist Created Successfully!");
      } else {
        alert("Failed to create panelist: " + (response?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating panelist:", error);
      alert("Failed to create panelist. Please check your connection and try again.");
    }
  };

  const handleDeletePanelist = async (panelistToDelete) => {
    if (window.confirm(`Are you sure you want to delete "${panelistToDelete.name}"?`)) {
      try {
        const response = await deletePanelist(panelistToDelete.id);

        if (response?.success) {
          await loadPanelists();
          alert("Panelist deleted successfully!");
        } else {
          alert("Failed to delete panelist: " + (response?.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting panelist:", error);
        alert("Failed to delete panelist. Please check your connection and try again.");
      }
    }
  };

  const handleUpdatePanelist = async (panelistId, updateData) => {
    try {
      const response = await updatePanelist(panelistId, updateData);

      if (response?.success) {
        await loadPanelists();
        return true;
      }

      alert("Failed to update panelist: " + (response?.error || "Unknown error"));
      return false;
    } catch (error) {
      console.error("Error updating panelist:", error);
      alert("Failed to update panelist. Please check your connection and try again.");
      return false;
    }
  };

  const openAssignModal = (panelist) => {
    setSelectedPanelist(panelist);
    setSelectedJobsForAssignment(panelist.assignedJobs || []);
    setShowAssignModal(true);
  };

  const toggleJobSelection = (jobName) => {
    setSelectedJobsForAssignment((prev) =>
      prev.includes(jobName)
        ? prev.filter((value) => value !== jobName)
        : [...prev, jobName],
    );
  };

  const saveAssignments = async () => {
    if (!selectedPanelist) return;

    const success = await handleUpdatePanelist(selectedPanelist.id, {
      assignedJobs: selectedJobsForAssignment,
    });

    if (success) {
      setPanelists((prev) =>
        prev.map((panelist) =>
          panelist.id === selectedPanelist.id
            ? { ...panelist, assignedJobs: selectedJobsForAssignment }
            : panelist,
        ),
      );

      setShowAssignModal(false);
      setSelectedPanelist(null);
      setSelectedJobsForAssignment([]);
      alert("Job assignments updated successfully!");
    }
  };

  const openScheduleModal = (panelist) => {
    setSelectedPanelist(panelist);
    setScheduleData({ candidateId: "", type: "GD", date: "", time: "" });
    setShowScheduleModal(true);
  };

  const scheduleRound = async () => {
    if (!scheduleData.candidateId || !scheduleData.date || !scheduleData.time || !selectedPanelist) {
      alert("Please fill in all fields");
      return;
    }

    const newRound = {
      candidateId: scheduleData.candidateId,
      type: scheduleData.type,
      date: scheduleData.date,
      time: scheduleData.time,
      status: "Scheduled",
    };

    const updatedScheduledRounds = [...selectedPanelist.scheduledRounds, newRound];
    const success = await handleUpdatePanelist(selectedPanelist.id, {
      scheduledRounds: updatedScheduledRounds,
    });

    if (success) {
      setPanelists((prev) =>
        prev.map((panelist) =>
          panelist.id === selectedPanelist.id
            ? { ...panelist, scheduledRounds: updatedScheduledRounds }
            : panelist,
        ),
      );

      setShowScheduleModal(false);
      setSelectedPanelist(null);
      alert("Interview round scheduled successfully!");
    }
  };

  const getCandidateName = (id) => {
    const candidate = fetchedCandidates.find(
      (item) => item.id === id || item._id === id,
    );
    return candidate?.name || "Unknown";
  };

  const uniqueExpertise = useMemo(
    () => [...new Set(panelists.map((panelist) => panelist.expertise).filter(Boolean))].sort(),
    [panelists],
  );

  const filteredPanelists = panelists.filter((panelist) => {
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      String(panelist.name || "").toLowerCase().includes(query) ||
      String(panelist.email || "").toLowerCase().includes(query) ||
      String(panelist.designation || "").toLowerCase().includes(query);

    const matchesExpertise =
      expertiseFilter === "" || panelist.expertise === expertiseFilter;

    const isAssigned = (panelist.assignedJobs || []).length > 0;
    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && isAssigned) ||
      (assignmentFilter === "unassigned" && !isAssigned);

    return matchesSearch && matchesExpertise && matchesAssignment;
  });

  return {
    fetchedCandidates,
    candidatesLoading,
    fetchedJobs,
    jobsLoading,
    fetchError,
    panelists,
    panelistsLoading,
    panelistsError,
    newPanelist,
    setNewPanelist,
    searchTerm,
    setSearchTerm,
    expertiseFilter,
    setExpertiseFilter,
    assignmentFilter,
    setAssignmentFilter,
    showAssignModal,
    setShowAssignModal,
    showScheduleModal,
    setShowScheduleModal,
    selectedPanelist,
    selectedJobsForAssignment,
    toggleJobSelection,
    saveAssignments,
    scheduleData,
    setScheduleData,
    scheduleRound,
    openAssignModal,
    openScheduleModal,
    handleCreatePanelist,
    handleDeletePanelist,
    uniqueExpertise,
    filteredPanelists,
    getCandidateName,
  };
}
