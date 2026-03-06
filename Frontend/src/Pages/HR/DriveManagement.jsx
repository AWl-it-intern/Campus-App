/**
 * File Type: UI/UX Page
 * Business Logic File Used: ../../hooks/useDriveManagement.js
 * Logic Fields Used: drive/job datasets, filters, stats, edit modal state, create/delete/edit handlers
 * Input Type: { onDrivesUpdate?: Function }
 * Output Type: ReactElement
 */
import { useMemo } from "react";
import {
  MapPin,
  TrendingUp,
  UserCheck,
  Award,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  DriveFormCard,
  DrivesTableHeader,
  DriveTableRow,
} from "../../Components/drivemanagement/index.js";

import StatsCard from "../../Components/common/StatsCard.jsx";
import EmptyState from "../../Components/common/EmptyState.jsx";
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useDriveManagement from "../../hooks/useDriveManagement";
import EditDriveModal from "../../Components/drivemanagement/EditDriveModal.jsx";

export default function DriveManagement({ onDrivesUpdate }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const colors = HR_COLORS;

  const DRIVE_VIEWS = {
    HOME: "home",
    CREATE: "create-drive",
    LIST: "drives",
  };

  const activeViewRaw = String(searchParams.get("view") || "").trim().toLowerCase();
  const activeView = Object.values(DRIVE_VIEWS).includes(activeViewRaw)
    ? activeViewRaw
    : DRIVE_VIEWS.HOME;

  const {
    jobs,
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
  } = useDriveManagement({ onDrivesUpdate });

  const openDriveDetails = (drive) => {
    const driveObjectId = drive.id || drive._id;
    if (!driveObjectId) return;
    navigate(`/HR/dashboard/Drives/${driveObjectId}`);
  };

  const statsData = useMemo(
    () => [
      {
        title: "Candidates",
        count: stats.totalCandidates,
        icon: TrendingUp,
        bgColor: colors.rainShadow,
        lightBg: "#E8F9F0",
      },
      {
        title: "Selected",
        count: stats.totalSelected,
        icon: UserCheck,
        bgColor: colors.softFlow,
        lightBg: "#E6F9F5",
      },
      {
        title: "Active Drives",
        count: stats.liveDrives,
        icon: MapPin,
        bgColor: colors.marigoldFlame,
        lightBg: "#FFF9E6",
      },
      {
        title: "Total Drives",
        count: stats.totalDrives,
        icon: Award,
        bgColor: colors.mossRock,
        lightBg: "#E8F9E8",
      },
    ],
    [
      stats.totalCandidates,
      stats.totalSelected,
      stats.liveDrives,
      stats.totalDrives,
      colors.rainShadow,
      colors.softFlow,
      colors.marigoldFlame,
      colors.mossRock,
    ],
  );

  const driveNavItems = [
    { key: DRIVE_VIEWS.HOME, label: "Home" },
    { key: DRIVE_VIEWS.CREATE, label: "Create Drive" },
    { key: DRIVE_VIEWS.LIST, label: "Drives" },
  ];

  const viewHeader = {
    [DRIVE_VIEWS.HOME]: {
      title: "Drive Management",
      subtitle:
        "Create drives, track execution status, and navigate directly to drive-level insights.",
    },
    [DRIVE_VIEWS.CREATE]: {
      title: "Create Drive",
      subtitle: "Set up a new campus drive with schedule, status, and job openings.",
    },
    [DRIVE_VIEWS.LIST]: {
      title: "Drives",
      subtitle: "Browse, filter, and manage all campus drives.",
    },
  }[activeView];

  const switchDriveView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === DRIVE_VIEWS.HOME) {
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
          items={driveNavItems}
          activeKey={activeView}
          onChange={switchDriveView}
        />
      }
    >
      {drivesError && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <strong>Warning:</strong> {drivesError}
        </div>
      )}

      {activeView === DRIVE_VIEWS.HOME ? (
        <>
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
        </>
      ) : null}

      {activeView === DRIVE_VIEWS.CREATE ? (
        <DriveFormCard
          newDrive={newDrive}
          setNewDrive={setNewDrive}
          createDrive={handleCreateDrive}
          jobs={jobs}
          colors={colors}
        />
      ) : null}

      {activeView === DRIVE_VIEWS.LIST ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <DrivesTableHeader
            filteredDrivesCount={filteredDrives.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            availableJobNames={availableJobNames}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            collegeFilter={collegeFilter}
            setCollegeFilter={setCollegeFilter}
            uniqueColleges={uniqueColleges}
            colors={colors}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Drive ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    College Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Jobs Opening
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Number of Candidates
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Selected
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {drivesLoading ? (
                  <tr>
                    <td colSpan="9" className="py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-3"></div>
                        <p className="font-medium text-gray-500">Loading drives...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12">
                      <EmptyState
                        icon={MapPin}
                        title="No drives found"
                        message="Try adjusting your filters or create a new drive"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((drive) => (
                    <DriveTableRow
                      key={drive.id || drive._id || drive.DriveID}
                      drive={drive}
                      deleteDrive={handleDeleteDrive}
                      colors={colors}
                      onRowClick={openDriveDetails}
                      onEdit={openEditDrive}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <EditDriveModal
        isOpen={isEditOpen}
        drive={editingDrive}
        jobs={jobs}
        onClose={closeEditDrive}
        onSave={saveDriveEdits}
      />
    </HrShell>
  );
}
