import { useMemo } from "react";
import {
  MapPin,
  TrendingUp,
  UserCheck,
  Award,
  Briefcase,
  Users as UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  DriveFormCard,
  DrivesTableHeader,
  DriveTableRow,
  DriveQuickActionCard,
} from "../../Components/drivemanagement/index.js";

import StatsCard from "../../Components/common/StatsCard.jsx";
import EmptyState from "../../Components/common/EmptyState.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useDriveManagement from "../../hooks/useDriveManagement";
import EditDriveModal from "../../Components/drivemanagement/EditDriveModal.jsx";

export default function DriveManagement({ onDrivesUpdate }) {
  const navigate = useNavigate();
  const colors = HR_COLORS;

  const {
    jobs,
    jobCount,
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
            Drive Management
          </h1>
          <p className="text-gray-600">Manage your Campus Drives</p>
        </div>

        {drivesError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <strong>Warning:</strong> {drivesError}
          </div>
        )}

        <section className="mb-8">
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.stonewash }}>
              Quick Actions
            </h3>
            <p className="text-gray-600">Manage jobs and candidates related to drives</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DriveQuickActionCard
              title="Job Management"
              subtitle={`${jobCount} ${jobCount === 1 ? "job" : "jobs"} available`}
              icon={Briefcase}
              color={colors.rainShadow}
              onClick={() =>
                navigate("/HR/dashboard/Create-Job", { state: { fromDrives: true } })
              }
            />
            <DriveQuickActionCard
              title="Candidate Management"
              subtitle="View and manage all candidates across drives"
              icon={UsersIcon}
              color={colors.mossRock}
              onClick={() =>
                navigate("/HR/dashboard/Create-Users", { state: { fromDrives: true } })
              }
            />
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <DriveFormCard
          newDrive={newDrive}
          setNewDrive={setNewDrive}
          createDrive={handleCreateDrive}
          jobs={jobs}
          colors={colors}
        />

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
      </div>

      <EditDriveModal
        isOpen={isEditOpen}
        drive={editingDrive}
        jobs={jobs}
        onClose={closeEditDrive}
        onSave={saveDriveEdits}
      />
    </div>
  );
}
