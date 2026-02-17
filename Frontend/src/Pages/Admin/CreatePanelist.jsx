// pages/CreatePanelist.jsx
// Updated with React Router navigation

import { useMemo, useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import feature-specific components
import {
  PanelistFormCard,
  PanelistsTableHeader,
  PanelistTableRow,
  AssignCandidatesModal,
  ScheduleRoundModal,
} from "../../Components/panelists/index.js";

// Import common components
import EmptyState from "../../Components/common/EmptyState.jsx";

/**
 * CreatePanelist Component - Now integrated with AdminDashboard state management
 * @param {Function} onPanelistsUpdate - Callback to update parent state with panelists
 */
export default function CreatePanelist({ onPanelistsUpdate }) {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000";

  // State for candidates
  const [fetchedCandidates, setFetchedCandidates] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  // State for panelists - only from database
  const [panelists, setPanelists] = useState([]);
  const [panelistsLoading, setPanelistsLoading] = useState(true);
  const [panelistsError, setPanelistsError] = useState(null);

  // Fetch candidates and panelists on mount and when needed
  const fetchCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const candidatesRes = await axios.get(`${API_BASE}/print-candidates`);
      const candidatesData = (candidatesRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));
      setFetchedCandidates(candidatesData);
      setFetchError(null);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setFetchError(
        "Failed to fetch candidates from database. Please try again.",
      );
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchPanelists = async () => {
    try {
      setPanelistsLoading(true);
      const panelistsRes = await axios.get(`${API_BASE}/print-panelists`);
      const panelistsData = (panelistsRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        assignedCandidates: doc.assignedCandidates || [],
        scheduledRounds: doc.scheduledRounds || [],
      }));
      setPanelists(panelistsData);
      setPanelistsError(null);
    } catch (err) {
      console.error("Error fetching panelists:", err);
      setPanelistsError(
        "Failed to fetch panelists from database. Please try again.",
      );
      setPanelists([]);
    } finally {
      setPanelistsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCandidates();
    fetchPanelists();
  }, []);

  // Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

  // Use candidates from database only
  const candidatesList = useMemo(() => {
    return fetchedCandidates;
  }, [fetchedCandidates]);

  // Notify parent component when panelists change
  useEffect(() => {
    if (onPanelistsUpdate) {
      onPanelistsUpdate(panelists);
    }
  }, [panelists, onPanelistsUpdate]);

  // Create Panelist form state
  const [newPanelist, setNewPanelist] = useState({
    name: "",
    email: "",
    designation: "",
    expertise: "",
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPanelist, setSelectedPanelist] = useState(null);
  const [selectedCandidatesForAssignment, setSelectedCandidatesForAssignment] =
    useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // NEW

  // Schedule modal state
  const [scheduleData, setScheduleData] = useState({
    candidateId: "",
    type: "GD",
    date: "",
    time: "",
  });

  // Create Panelist
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
        // Clear form and refetch panelists from database
        setNewPanelist({ name: "", email: "", designation: "", expertise: "" });
        await fetchPanelists();
        alert("Panelist Created Successfully!");
      } else {
        alert(
          "Failed to create panelist: " +
            (response.data.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error creating panelist:", error);
      alert(
        "Failed to create panelist. Please check your connection and try again.",
      );
    }
  };

  // Delete Panelist
  const deletePanelist = async (panelistToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${panelistToDelete.name}"?`,
      )
    ) {
      try {
        const response = await axios.delete(
          `${API_BASE}/panelist/${panelistToDelete.id}`,
        );

        if (response.data.success) {
          // Refetch panelists from database
          await fetchPanelists();
          alert("Panelist deleted successfully!");
        } else {
          alert(
            "Failed to delete panelist: " +
              (response.data.error || "Unknown error"),
          );
        }
      } catch (error) {
        console.error("Error deleting panelist:", error);
        alert(
          "Failed to delete panelist. Please check your connection and try again.",
        );
      }
    }
  };

  // Update Panelist
  const updatePanelist = async (panelistId, updateData) => {
    try {
      const response = await axios.put(
        `${API_BASE}/panelist/${panelistId}`,
        updateData,
      );

      if (response.data.success) {
        // Refetch panelists from database to ensure data consistency
        await fetchPanelists();
        return true;
      } else {
        alert(
          "Failed to update panelist: " +
            (response.data.error || "Unknown error"),
        );
        return false;
      }
    } catch (error) {
      console.error("Error updating panelist:", error);
      alert(
        "Failed to update panelist. Please check your connection and try again.",
      );
      return false;
    }
  };

  // Assign Candidates
  const openAssignModal = (panelist) => {
    setSelectedPanelist(panelist);
    setSelectedCandidatesForAssignment(panelist.assignedCandidates);
    setShowAssignModal(true);
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidatesForAssignment((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId],
    );
  };

  const saveAssignments = async () => {
    if (!selectedPanelist) return;

    const success = await updatePanelist(selectedPanelist.id, {
      assignedCandidates: selectedCandidatesForAssignment,
    });

    if (success) {
      setPanelists((prev) =>
        prev.map((p) =>
          p.id === selectedPanelist.id
            ? { ...p, assignedCandidates: selectedCandidatesForAssignment }
            : p,
        ),
      );

      setShowAssignModal(false);
      setSelectedPanelist(null);
      setSelectedCandidatesForAssignment([]);
      alert("Candidate assignments updated successfully!");
    }
  };

  // Schedule Round
  const openScheduleModal = (panelist) => {
    setSelectedPanelist(panelist);
    setScheduleData({ candidateId: "", type: "GD", date: "", time: "" });
    setShowScheduleModal(true);
  };

 const scheduleRound = async () => {
  if (
    !scheduleData.candidateId ||
    !scheduleData.date ||
    !scheduleData.time ||
    !selectedPanelist
  ) {
    alert("Please fill in all fields");
    return;
  }

  const cid = scheduleData.candidateId; // ✅ FIXED

  if (!selectedPanelist.assignedCandidates.includes(cid)) {
    alert("Please assign this candidate to the panelist first");
    return;
  }

  const newRound = {
    candidateId: cid,
    type: scheduleData.type,
    date: scheduleData.date,
    time: scheduleData.time,
    status: "Scheduled",
  };

  const updatedScheduledRounds = [
    ...selectedPanelist.scheduledRounds,
    newRound,
  ];

  const success = await updatePanelist(selectedPanelist.id, {
    scheduledRounds: updatedScheduledRounds,
  });

  if (success) {
    setPanelists((prev) =>
      prev.map((p) =>
        p.id === selectedPanelist.id
          ? { ...p, scheduledRounds: updatedScheduledRounds }
          : p,
      ),
    );

    setShowScheduleModal(false);
    setSelectedPanelist(null);
    alert("Interview round scheduled successfully!");
  }
};


  // Helpers
  const getCandidateName = (id) => {
    const candidate = candidatesList.find((c) => c.id === id);
    return candidate?.name || "Unknown";
  };

  const getAvatarColor = (id) => {
    const avatarColors = [
      colors.softFlow,
      colors.mossRock,
      colors.goldenHour,
      colors.marigoldFlame,
      colors.clayPot,
    ];
    // Simple hash for string IDs
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const uniqueExpertise = [
    ...new Set(panelists.map((p) => p.expertise)),
  ].sort();
  const filteredPanelists = panelists.filter((panelist) => {
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      panelist.name.toLowerCase().includes(q) ||
      panelist.email.toLowerCase().includes(q) ||
      panelist.designation.toLowerCase().includes(q);

    const matchesExpertise =
      expertiseFilter === "" || panelist.expertise === expertiseFilter;

    // NEW: Assignment Filter
    const isAssigned = panelist.assignedCandidates?.length > 0;

    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && isAssigned) ||
      (assignmentFilter === "unassigned" && !isAssigned);

    return matchesSearch && matchesExpertise && matchesAssignment;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/Admin/dashboard")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.stonewash }}
          >
            Manage Panelists
          </h1>
          <p className="text-gray-600">
            Create and manage interview panelists for recruitment
          </p>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {fetchError}
          </div>
        )}

        {/* Panelists Error Message */}
        {panelistsError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <strong>Warning:</strong> {panelistsError}
          </div>
        )}

        {/* Create Panelist Form - Using Component */}
        <PanelistFormCard
          newPanelist={newPanelist}
          setNewPanelist={setNewPanelist}
          createPanelist={createPanelist}
          colors={colors}
        />

        {/* Panelists Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Table Header - Using Component */}
          <PanelistsTableHeader
            filteredPanelistsCount={filteredPanelists.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            expertiseFilter={expertiseFilter}
            setExpertiseFilter={setExpertiseFilter}
            uniqueExpertise={uniqueExpertise}
            assignmentFilter={assignmentFilter} // NEW
            setAssignmentFilter={setAssignmentFilter} // NEW
            colors={colors}
          />

          {/* Table */}
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
                    Assigned Candidates
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
                        <p className="font-medium text-gray-500">
                          Loading panelists...
                        </p>
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
                      getCandidateName={getCandidateName}
                      getAvatarColor={getAvatarColor}
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

      {/* Assignment Modal - Using Component */}
      <AssignCandidatesModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedPanelist={selectedPanelist}
        candidates={candidatesList}
        candidatesLoading={candidatesLoading}
        selectedCandidates={selectedCandidatesForAssignment}
        toggleCandidateSelection={toggleCandidateSelection}
        saveAssignments={saveAssignments}
        getAvatarColor={getAvatarColor}
        colors={colors}
      />

      {/* Schedule Round Modal - Using Component */}
      <ScheduleRoundModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        selectedPanelist={selectedPanelist}
        scheduleData={scheduleData}
        setScheduleData={setScheduleData}
        scheduleRound={scheduleRound}
        getCandidateName={getCandidateName}
        colors={colors}
      />
    </div>
  );
}
