
import { useMemo, useState } from "react";
import {
  Users,
  Building2,
  Mail,
  UserPlus,
  Search,
  Trash2,
  UserCheck,
  Calendar,
  MessageSquare,
  Video,
  X,
  CheckCircle2,
} from "lucide-react";

// Fully self-contained component (no AdminDataContext)
// - Uses hardcoded dummy data for panelists & candidates
// - Includes basic create, update (assign), and schedule logic in-memory
// - Responsive UI with Tailwind
export default function CreatePanelist() {
  // Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

  // ----- Dummy Candidates (hardcoded) -----
  const candidates = useMemo(
    () => [
      { id: 1, name: "Ananya Singh", college: "IIT Bombay" },
      { id: 2, name: "Harsh Mehta", college: "VJTI" },
      { id: 3, name: "Rohit Verma", college: "IISc" },
      { id: 4, name: "Ishita Rao", college: "NIT Trichy" },
      { id: 5, name: "Sana Qureshi", college: "BITS Pilani" },
      { id: 6, name: "Vikram Patil", college: "COEP" },
      { id: 7, name: "Nina Kapoor", college: "SPIT" },
      { id: 8, name: "Arjun Desai", college: "DA-IICT" },
    ],
    []
  );

  // ----- Dummy Panelists (hardcoded initial) -----
  const [panelists, setPanelists] = useState([
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@company.com",
      designation: "Senior Technical Manager",
      expertise: "Software Development",
      assignedCandidates: [1, 2, 3],
      scheduledRounds: [
        { candidateId: 1, type: "GD", date: "2026-02-15", time: "10:00", status: "Scheduled" },
        { candidateId: 2, type: "PI", date: "2026-02-16", time: "14:00", status: "Scheduled" },
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
        { candidateId: 4, type: "GD", date: "2026-02-17", time: "11:00", status: "Scheduled" },
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

  // ----- Create Panelist form state -----
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
  const [selectedCandidatesForAssignment, setSelectedCandidatesForAssignment] = useState([]);

  // Schedule modal state
  const [scheduleData, setScheduleData] = useState({ candidateId: "", type: "GD", date: "", time: "" });

  // ----- Create Panelist (local only) -----
  const createPanelist = () => {
    if (!newPanelist.name || !newPanelist.email || !newPanelist.designation || !newPanelist.expertise) return;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newPanelist.email)) return;

    const nextId = panelists.length > 0 ? Math.max(...panelists.map((p) => p.id)) + 1 : 1;
    const newRow = {
      id: nextId,
      ...newPanelist,
      assignedCandidates: [],
      scheduledRounds: [],
    };
    setPanelists((prev) => [...prev, newRow]);
    setNewPanelist({ name: "", email: "", designation: "", expertise: "" });
  };

  // ----- Delete Panelist (local only) -----
  const deletePanelist = (panelistToDelete) => {
    setPanelists((prev) => prev.filter((p) => p.id !== panelistToDelete.id));
  };

  // ----- Assign Candidates (local only) -----
  const openAssignModal = (panelist) => {
    setSelectedPanelist(panelist);
    setSelectedCandidatesForAssignment(panelist.assignedCandidates);
    setShowAssignModal(true);
  };
  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidatesForAssignment((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };
  const saveAssignments = () => {
    if (!selectedPanelist) return;
    setPanelists((prev) =>
      prev.map((p) => (p.id === selectedPanelist.id ? { ...p, assignedCandidates: selectedCandidatesForAssignment } : p))
    );
    setShowAssignModal(false);
    setSelectedPanelist(null);
    setSelectedCandidatesForAssignment([]);
  };

  // ----- Schedule Round (local only) -----
  const openScheduleModal = (panelist) => {
    setSelectedPanelist(panelist);
    setScheduleData({ candidateId: "", type: "GD", date: "", time: "" });
    setShowScheduleModal(true);
  };
  const scheduleRound = () => {
    if (!scheduleData.candidateId || !scheduleData.date || !scheduleData.time || !selectedPanelist) return;
    const cid = parseInt(scheduleData.candidateId, 10);
    if (!selectedPanelist.assignedCandidates.includes(cid)) return;

    const newRound = { candidateId: cid, type: scheduleData.type, date: scheduleData.date, time: scheduleData.time, status: "Scheduled" };
    setPanelists((prev) =>
      prev.map((p) => (p.id === selectedPanelist.id ? { ...p, scheduledRounds: [...p.scheduledRounds, newRound] } : p))
    );
    setShowScheduleModal(false);
    setSelectedPanelist(null);
  };

  // Helpers
  const getCandidateName = (id) => candidates.find((c) => c.id === id)?.name || "Unknown";
  const uniqueExpertise = [...new Set(panelists.map((p) => p.expertise))].sort();

  const filteredPanelists = panelists.filter((panelist) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      panelist.name.toLowerCase().includes(q) ||
      panelist.email.toLowerCase().includes(q) ||
      panelist.designation.toLowerCase().includes(q);
    const matchesExpertise = expertiseFilter === "" || panelist.expertise === expertiseFilter;
    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.stonewash }}>
            Panelist Management
          </h1>
          <p className="text-gray-600">Manage panelist , Assign Candidates and Manage Panelist Schedule </p>
        </div>

        {/* Create Panelist Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.goldenHour + "30" }}
            >
              <UserPlus size={24} style={{ color: colors.stonewash }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.stonewash }}>
                Add New Panelist
              </h2>
              <p className="text-sm text-gray-600">This form updates local state only</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="Enter full name"
                value={newPanelist.name}
                onChange={(e) => setNewPanelist({ ...newPanelist, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="email@company.com"
                value={newPanelist.email}
                onChange={(e) => setNewPanelist({ ...newPanelist, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="e.g., Senior Manager"
                value={newPanelist.designation}
                onChange={(e) => setNewPanelist({ ...newPanelist, designation: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expertise *</label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="e.g., Technical, HR"
                value={newPanelist.expertise}
                onChange={(e) => setNewPanelist({ ...newPanelist, expertise: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={createPanelist}
            className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
            style={{ backgroundColor: colors.goldenHour }}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus size={20} />
              <span>Create Panelist</span>
            </div>
          </button>
        </div>

        {/* Panelists Overview Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 text-white" style={{ backgroundColor: colors.stonewash }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Users size={24} />
                <div>
                  <h2 className="text-xl font-bold">Panelists Overview</h2>
                  <p className="text-sm opacity-90">
                    Total: {filteredPanelists.length} panelist{filteredPanelists.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
                  />
                  <input
                    type="text"
                    placeholder="Search panelists..."
                    className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60 min-w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ backdropFilter: "blur(10px)" }}
                  />
                </div>

                <select
                  className="px-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
                  value={expertiseFilter}
                  onChange={(e) => setExpertiseFilter(e.target.value)}
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <option value="" className="text-gray-800">
                    All Expertise
                  </option>
                  {uniqueExpertise.map((expertise) => (
                    <option key={expertise} value={expertise} className="text-gray-800">
                      {expertise}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Panelist</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Designation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Expertise</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned Candidates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Scheduled Rounds</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPanelists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No panelists found</p>
                        <p className="text-sm">Try adjusting your filters or create a new panelist</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPanelists.map((panelist) => (
                    <tr key={panelist.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white shrink-0"
                            style={{ backgroundColor: colors.goldenHour }}
                          >
                            {panelist.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{panelist.name}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail size={14} className="text-gray-400" />
                              {panelist.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 size={16} className="text-gray-400" />
                          {panelist.designation}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: colors.mossRock + "20", color: colors.mossRock }}
                        >
                          {panelist.expertise}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {panelist.assignedCandidates.length === 0 ? (
                            <span className="text-gray-400 text-sm italic">No candidates</span>
                          ) : (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: colors.softFlow + "30", color: colors.stonewash }}
                            >
                              {panelist.assignedCandidates.length} assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {panelist.scheduledRounds.length === 0 ? (
                            <span className="text-gray-400 text-sm italic">No rounds</span>
                          ) : (
                            <>
                              <Calendar size={16} style={{ color: colors.marigoldFlame }} />
                              <span className="text-sm font-medium" style={{ color: colors.marigoldFlame }}>
                                {panelist.scheduledRounds.length} scheduled
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openAssignModal(panelist)}
                            className="px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all"
                            style={{ backgroundColor: colors.softFlow }}
                            title="Assign Candidates"
                          >
                            <UserCheck size={16} />
                          </button>
                          <button
                            onClick={() => openScheduleModal(panelist)}
                            className="px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all"
                            style={{ backgroundColor: colors.marigoldFlame }}
                            title="Schedule Round"
                          >
                            <Calendar size={16} />
                          </button>
                          <button
                            onClick={() => deletePanelist(panelist)}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all"
                            title="Delete Panelist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Candidates Modal */}
      {showAssignModal && selectedPanelist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 text-white" style={{ backgroundColor: colors.stonewash }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Assign Candidates</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {selectedPanelist.name} - {selectedPanelist.designation}
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {candidates.map((candidate) => {
                  const isSelected = selectedCandidatesForAssignment.includes(candidate.id);
                  return (
                    <label
                      key={candidate.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected ? "border-opacity-100 shadow-md" : "border-gray-200 hover:bg-gray-50"
                      }`}
                      style={{
                        borderColor: isSelected ? colors.softFlow : undefined,
                        backgroundColor: isSelected ? colors.softFlow + "10" : undefined,
                      }}
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded accent-green-600"
                        checked={isSelected}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                      />
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: isSelected ? colors.softFlow : colors.clayPot }}
                      >
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{candidate.name}</p>
                        <p className="text-sm text-gray-600">{candidate.college}</p>
                      </div>
                      {isSelected && <CheckCircle2 size={24} style={{ color: colors.softFlow }} />}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between" style={{ backgroundColor: colors.softFlow + "10" }}>
              <p className="text-gray-700">
                <span className="font-semibold">{selectedCandidatesForAssignment.length}</span> candidate(s) selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAssignments}
                  className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
                  style={{ backgroundColor: colors.softFlow }}
                >
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Round Modal */}
      {showScheduleModal && selectedPanelist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 text-white" style={{ backgroundColor: colors.stonewash }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Schedule Interview Round</h3>
                  <p className="text-sm opacity-90 mt-1">{selectedPanelist.name}</p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedPanelist.assignedCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No candidates assigned</p>
                  <p className="text-sm">Please assign candidates first</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Candidate *</label>
                    <select
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                      value={scheduleData.candidateId}
                      onChange={(e) => setScheduleData({ ...scheduleData, candidateId: e.target.value })}
                    >
                      <option value="">Choose a candidate</option>
                      {selectedPanelist.assignedCandidates.map((candidateId) => (
                        <option key={candidateId} value={candidateId}>
                          {getCandidateName(candidateId)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Round Type *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="roundType"
                          value="GD"
                          checked={scheduleData.type === "GD"}
                          onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                          className="w-4 h-4"
                        />
                        <MessageSquare size={18} style={{ color: colors.mossRock }} />
                        <span className="text-gray-700">Group Discussion</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="roundType"
                          value="PI"
                          checked={scheduleData.type === "PI"}
                          onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                          className="w-4 h-4"
                        />
                        <Video size={18} style={{ color: colors.marigoldFlame }} />
                        <span className="text-gray-700">Personal Interview</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <input
                        type="date"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                        value={scheduleData.date}
                        onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                      <input
                        type="time"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                        value={scheduleData.time}
                        onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  {selectedPanelist.scheduledRounds.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: colors.clayPot + "30" }}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Existing Schedules:</p>
                      <div className="space-y-2">
                        {selectedPanelist.scheduledRounds.map((round, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: round.type === 'GD' ? colors.mossRock : colors.marigoldFlame }}
                            >
                              {round.type}
                            </span>
                            <span>{getCandidateName(round.candidateId)}</span>
                            <span className="text-gray-400">•</span>
                            <span>{round.date}</span>
                            <span>{round.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3" style={{ backgroundColor: colors.marigoldFlame + "10" }}>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={scheduleRound}
                className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
                style={{ backgroundColor: colors.marigoldFlame }}
                disabled={selectedPanelist?.assignedCandidates.length === 0}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  Schedule Round
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
