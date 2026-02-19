import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  PanelistFormCard,
  PanelistsTableHeader,
  PanelistTableRow,
  AssignCandidatesModal,
  ScheduleRoundModal,
} from "../../Components/panelists/index.js";
import EmptyState from "../../Components/common/EmptyState.jsx";

export default function CreatePanelist({ onPanelistsUpdate }) {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000";

  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

  const [fetchedCandidates, setFetchedCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [fetchedJobs, setFetchedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [panelists, setPanelists] = useState([]);
  const [panelistsLoading, setPanelistsLoading] = useState(true);
  const [panelistsError, setPanelistsError] = useState(null);

  const [newPanelist, setNewPanelist] = useState({
    name: "",
    email: "",
    designation: "",
    expertise: "",
  });

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

  const fetchCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const candidatesRes = await axios.get(`${API_BASE}/print-candidates?limit=5000`);
      const candidatesData = (candidatesRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));
      setFetchedCandidates(candidatesData);
      setFetchError(null);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setFetchError("Failed to fetch candidates/jobs from database. Please try again.");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const jobsRes = await axios.get(`${API_BASE}/print-jobs?limit=5000`);
      const jobsData = (jobsRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));
      setFetchedJobs(jobsData);
      setFetchError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setFetchError("Failed to fetch candidates/jobs from database. Please try again.");
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchPanelists = async () => {
    try {
      setPanelistsLoading(true);
      const panelistsRes = await axios.get(`${API_BASE}/print-panelists?limit=5000`);
      const panelistsData = (panelistsRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        assignedJobs: doc.assignedJobs || [],
        scheduledRounds: doc.scheduledRounds || [],
      }));
      setPanelists(panelistsData);
      setPanelistsError(null);
    } catch (err) {
      console.error("Error fetching panelists:", err);
      setPanelistsError("Failed to fetch panelists from database. Please try again.");
      setPanelists([]);
    } finally {
      setPanelistsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
    fetchPanelists();
  }, []);

  useEffect(() => {
    if (onPanelistsUpdate) {
      onPanelistsUpdate(panelists);
    }
  }, [panelists, onPanelistsUpdate]);

  const createPanelist = async () => {
    if (
      !newPanelist.name ||
      !newPanelist.email ||
      !newPanelist.designation ||
      !newPanelist.expertise
    ) {
      alert("Please fill in all fields");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newPanelist.email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/panelist`, {
        name: newPanelist.name,
        email: newPanelist.email,
        designation: newPanelist.designation,
        expertise: newPanelist.expertise,
      });

      if (response.data.success) {
        setNewPanelist({ name: "", email: "", designation: "", expertise: "" });
        await fetchPanelists();
        alert("Panelist Created Successfully!");
      } else {
        alert("Failed to create panelist: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating panelist:", error);
      alert("Failed to create panelist. Please check your connection and try again.");
    }
  };

  const deletePanelist = async (panelistToDelete) => {
    if (window.confirm(`Are you sure you want to delete "${panelistToDelete.name}"?`)) {
      try {
        const response = await axios.delete(`${API_BASE}/panelist/${panelistToDelete.id}`);

        if (response.data.success) {
          await fetchPanelists();
          alert("Panelist deleted successfully!");
        } else {
          alert("Failed to delete panelist: " + (response.data.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting panelist:", error);
        alert("Failed to delete panelist. Please check your connection and try again.");
      }
    }
  };

  const updatePanelist = async (panelistId, updateData) => {
    try {
      const response = await axios.put(`${API_BASE}/panelist/${panelistId}`, updateData);

      if (response.data.success) {
        await fetchPanelists();
        return true;
      }

      alert("Failed to update panelist: " + (response.data.error || "Unknown error"));
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

    const success = await updatePanelist(selectedPanelist.id, {
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
    const success = await updatePanelist(selectedPanelist.id, {
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

  const uniqueExpertise = [
    ...new Set(panelists.map((panelist) => panelist.expertise).filter(Boolean)),
  ].sort();

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/HR/dashboard")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
          {"<-"} Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.stonewash }}>
            Manage Panelists
          </h1>
          <p className="text-gray-600">
            Create and manage interview panelists for recruitment
          </p>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {fetchError}
          </div>
        )}

        {panelistsError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <strong>Warning:</strong> {panelistsError}
          </div>
        )}

        <PanelistFormCard
          newPanelist={newPanelist}
          setNewPanelist={setNewPanelist}
          createPanelist={createPanelist}
          colors={colors}
        />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <PanelistsTableHeader
            filteredPanelistsCount={filteredPanelists.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            expertiseFilter={expertiseFilter}
            setExpertiseFilter={setExpertiseFilter}
            uniqueExpertise={uniqueExpertise}
            assignmentFilter={assignmentFilter}
            setAssignmentFilter={setAssignmentFilter}
            colors={colors}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Panelist
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Designation
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Expertise
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Assigned Jobs
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {panelistsLoading ? (
                  <tr>
                    <td colSpan="5" className="py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-3"></div>
                        <p className="font-medium text-gray-500">Loading panelists...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPanelists.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12">
                      <EmptyState
                        icon={Users}
                        title="No panelists found"
                        message="Try adjusting your filters or create a new panelist"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredPanelists.map((panelist) => (
                    <PanelistTableRow
                      key={panelist.id}
                      panelist={panelist}
                      openAssignModal={openAssignModal}
                      openScheduleModal={openScheduleModal}
                      deletePanelist={deletePanelist}
                      colors={colors}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AssignCandidatesModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedPanelist={selectedPanelist}
        jobs={fetchedJobs}
        jobsLoading={jobsLoading}
        selectedJobs={selectedJobsForAssignment}
        toggleJobSelection={toggleJobSelection}
        saveAssignments={saveAssignments}
        colors={colors}
      />

      <ScheduleRoundModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        selectedPanelist={selectedPanelist}
        candidates={fetchedCandidates}
        candidatesLoading={candidatesLoading}
        scheduleData={scheduleData}
        setScheduleData={setScheduleData}
        scheduleRound={scheduleRound}
        getCandidateName={getCandidateName}
        colors={colors}
      />
    </div>
  );
}
