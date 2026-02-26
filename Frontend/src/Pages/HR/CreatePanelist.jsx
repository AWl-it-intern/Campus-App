import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  PanelistFormCard,
  PanelistsTableHeader,
  PanelistTableRow,
  AssignJobModal,
  ScheduleRoundModal,
} from "../../Components/panelists/index.js";
import EmptyState from "../../Components/common/EmptyState.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useCreatePanelist from "../../hooks/useCreatePanelist";

export default function CreatePanelist({ onPanelistsUpdate }) {
  const navigate = useNavigate();
  const colors = HR_COLORS;

  const {
    fetchedCandidates,
    candidatesLoading,
    fetchedJobs,
    jobsLoading,
    fetchError,
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
  } = useCreatePanelist({ onPanelistsUpdate });

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
          createPanelist={handleCreatePanelist}
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
                      deletePanelist={handleDeletePanelist}
                      colors={colors}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AssignJobModal
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
