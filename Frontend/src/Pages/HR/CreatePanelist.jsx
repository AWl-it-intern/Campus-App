/**
 * File Type: UI/UX Page
 * Business Logic File Used: ../../hooks/useCreatePanelist.js
 * Logic Fields Used: panelist/job/candidate datasets, filters, modal states, assignment/schedule handlers
 * Input Type: { onPanelistsUpdate?: Function }
 * Output Type: ReactElement
 */
import { useMemo } from "react";
import { Users, UserCheck, Briefcase, CalendarClock } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  PanelistFormCard,
  PanelistsTableHeader,
  PanelistTableRow,
  AssignJobModal,
  ScheduleRoundModal,
} from "../../Components/panelists/index.js";
import EmptyState from "../../Components/common/EmptyState.jsx";
import StatsCard from "../../Components/common/StatsCard.jsx";
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useCreatePanelist from "../../hooks/useCreatePanelist";

export default function CreatePanelist({ onPanelistsUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const colors = HR_COLORS;

  const PANELIST_VIEWS = {
    HOME: "home",
    CREATE: "create-panelist",
    LIST: "panelist-list-assignment",
  };

  const activeViewRaw = String(searchParams.get("view") || "").trim().toLowerCase();
  const activeView = Object.values(PANELIST_VIEWS).includes(activeViewRaw)
    ? activeViewRaw
    : PANELIST_VIEWS.HOME;

  const {
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
  } = useCreatePanelist({ onPanelistsUpdate });

  const assignedPanelistsCount = useMemo(
    () => panelists.filter((panelist) => (panelist.assignedJobs || []).length > 0).length,
    [panelists],
  );

  const scheduledRoundsCount = useMemo(
    () =>
      panelists.reduce(
        (sum, panelist) => sum + (Array.isArray(panelist.scheduledRounds) ? panelist.scheduledRounds.length : 0),
        0,
      ),
    [panelists],
  );

  const statsData = useMemo(
    () => [
      {
        title: "Total Panelists",
        count: panelists.length,
        icon: Users,
        bgColor: colors.rainShadow,
        lightBg: "#E8F9F0",
      },
      {
        title: "Assigned Panelists",
        count: assignedPanelistsCount,
        icon: Briefcase,
        bgColor: colors.softFlow,
        lightBg: "#E6F9F5",
      },
      {
        title: "Unassigned Panelists",
        count: Math.max(0, panelists.length - assignedPanelistsCount),
        icon: UserCheck,
        bgColor: colors.marigoldFlame,
        lightBg: "#FFF9E6",
      },
      {
        title: "Scheduled Rounds",
        count: scheduledRoundsCount,
        icon: CalendarClock,
        bgColor: colors.mossRock,
        lightBg: "#E8F9E8",
      },
    ],
    [
      panelists.length,
      assignedPanelistsCount,
      scheduledRoundsCount,
      colors.rainShadow,
      colors.softFlow,
      colors.marigoldFlame,
      colors.mossRock,
    ],
  );

  const panelistNavItems = [
    { key: PANELIST_VIEWS.HOME, label: "Home" },
    { key: PANELIST_VIEWS.CREATE, label: "Create Panelist" },
    { key: PANELIST_VIEWS.LIST, label: "Panelist List-Assignment" },
  ];

  const viewHeader = {
    [PANELIST_VIEWS.HOME]: {
      title: "Panelist Management",
      subtitle: "Track panelist assignment readiness and interview scheduling coverage.",
    },
    [PANELIST_VIEWS.CREATE]: {
      title: "Create Panelist",
      subtitle: "Add new panelists with role details and expertise focus.",
    },
    [PANELIST_VIEWS.LIST]: {
      title: "Panelist List-Assignment",
      subtitle: "Manage panelist assignments, schedules, and active panel capacity.",
    },
  }[activeView];

  const switchPanelistView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === PANELIST_VIEWS.HOME) {
      nextParams.delete("view");
    } else {
      nextParams.set("view", nextView);
    }
    setSearchParams(nextParams);
  };

  return (
    <HrShell
      title={viewHeader.title}
      subtitle={viewHeader.subtitle}
      topNav={
        <SectionNavBar
          items={panelistNavItems}
          activeKey={activeView}
          onChange={switchPanelistView}
        />
      }
    >
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

      {activeView === PANELIST_VIEWS.HOME ? (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                count={stat.count}
                icon={stat.icon}
                bgColor={stat.bgColor}
                lightBg={stat.lightBg}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeView === PANELIST_VIEWS.CREATE ? (
        <PanelistFormCard
          newPanelist={newPanelist}
          setNewPanelist={setNewPanelist}
          createPanelist={handleCreatePanelist}
          colors={colors}
        />
      ) : null}

      {activeView === PANELIST_VIEWS.LIST ? (
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
      ) : null}

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
    </HrShell>
  );
}
