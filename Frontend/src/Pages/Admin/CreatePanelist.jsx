// pages/CreatePanelist.jsx
// Updated to use modular components

import { useMemo, useState, useEffect } from "react";
import { Users } from "lucide-react";

// Import feature-specific components
import {
  PanelistFormCard,
  PanelistsTableHeader,
  PanelistTableRow,
  AssignCandidatesModal,
  ScheduleRoundModal,
} from "../../components/panelists/index.js";

// Import common components
import EmptyState from "../../components/common/EmptyState.jsx";

/**
 * CreatePanelist Component - Now integrated with AdminDashboard state management
 * @param {Array} candidates - List of candidates from parent
 * @param {Function} onPanelistsUpdate - Callback to update parent state with panelists
 */
export default function CreatePanelist({ candidates = [], onPanelistsUpdate }) {
  // Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

  // Use candidates from parent, or fallback to dummy data
  const candidatesList = useMemo(() => {
    if (candidates && candidates.length > 0) {
      return candidates;
    }
    // Fallback dummy data
    return [
      { id: 1, name: "Ananya Singh", college: "IIT Bombay" },
      { id: 2, name: "Harsh Mehta", college: "VJTI" },
      { id: 3, name: "Rohit Verma", college: "IISc" },
      { id: 4, name: "Ishita Rao", college: "NIT Trichy" },
      { id: 5, name: "Sana Qureshi", college: "BITS Pilani" },
      { id: 6, name: "Vikram Patil", college: "COEP" },
      { id: 7, name: "Nina Kapoor", college: "SPIT" },
      { id: 8, name: "Arjun Desai", college: "DA-IICT" },
    ];
  }, [candidates]);

  // Panelist state with initial dummy data
  const [panelists, setPanelists] = useState([
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@company.com",
      designation: "Senior Technical Manager",
      expertise: "Software Development",
      assignedCandidates: [1, 2, 3],
      scheduledRounds: [
        {
          candidateId: 1,
          type: "GD",
          date: "2026-02-15",
          time: "10:00",
          status: "Scheduled",
        },
        {
          candidateId: 2,
          type: "PI",
          date: "2026-02-16",
          time: "14:00",
          status: "Scheduled",
        },
      ],
    },
    {
      id: 2,
      name: "Ms. Priya Sharma",
      email: "priya.sharma@company.com",
      designation: "HR Director",
      expertise: "Behavioral Assessment",
      assignedCandidates: [4, 5],
      scheduledRounds: [
        {
          candidateId: 4,
          type: "GD",
          date: "2026-02-17",
          time: "11:00",
          status: "Scheduled",
        },
      ],
    },
    {
      id: 3,
      name: "Mr. Amit Patel",
      email: "amit.patel@company.com",
      designation: "Product Manager",
      expertise: "Product & Strategy",
      assignedCandidates: [6, 7, 8],
      scheduledRounds: [],
    },
  ]);

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

  // Schedule modal state
  const [scheduleData, setScheduleData] = useState({
    candidateId: "",
    type: "GD",
    date: "",
    time: "",
  });

  // Create Panelist
  const createPanelist = () => {
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

    const nextId =
      panelists.length > 0 ? Math.max(...panelists.map((p) => p.id)) + 1 : 1;
    const newRow = {
      id: nextId,
      ...newPanelist,
      assignedCandidates: [],
      scheduledRounds: [],
    };

    setPanelists((prev) => [...prev, newRow]);
    setNewPanelist({ name: "", email: "", designation: "", expertise: "" });
    alert("Panelist Created Successfully!");
  };

  // Delete Panelist
  const deletePanelist = (panelistToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${panelistToDelete.name}"?`,
      )
    ) {
      setPanelists((prev) => prev.filter((p) => p.id !== panelistToDelete.id));
      alert("Panelist deleted successfully!");
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

  const saveAssignments = () => {
    if (!selectedPanelist) return;

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
  };

  // Schedule Round
  const openScheduleModal = (panelist) => {
    setSelectedPanelist(panelist);
    setScheduleData({ candidateId: "", type: "GD", date: "", time: "" });
    setShowScheduleModal(true);
  };

  const scheduleRound = () => {
    if (
      !scheduleData.candidateId ||
      !scheduleData.date ||
      !scheduleData.time ||
      !selectedPanelist
    ) {
      alert("Please fill in all fields");
      return;
    }

    const cid = parseInt(scheduleData.candidateId, 10);
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

    setPanelists((prev) =>
      prev.map((p) =>
        p.id === selectedPanelist.id
          ? { ...p, scheduledRounds: [...p.scheduledRounds, newRound] }
          : p,
      ),
    );

    setShowScheduleModal(false);
    setSelectedPanelist(null);
    alert("Interview round scheduled successfully!");
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
    return avatarColors[id % avatarColors.length];
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
    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
                {filteredPanelists.length === 0 ? (
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
