import { Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  UserFormCard,
  UsersTableHeader,
  UserTableRow,
} from "../../Components/users/index.js";
import AssignJobModal from "../../Components/users/AssignJobModal.jsx";
import EditCandidateModal from "../../Components/users/EditCandidateModal.jsx";
import EmptyState from "../../Components/common/EmptyState.jsx";
import useCreateUsers from "../../hooks/useCreateUsers";
import HR_COLORS from "../../theme/hrPalette";

export default function CreateUsers({ drives: drivesProp = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDrives = location.state?.fromDrives || false;
  const colors = HR_COLORS;

  const {
    fileInputRef,
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
    onOpenAssign,
    handleAssigned,
    exportCandidatesToCsv,
    onImportClick,
    onFileChange,
    openEditCandidate,
    closeEditCandidate,
    saveCandidateEdits,
  } = useCreateUsers({ drivesProp });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() =>
            navigate(fromDrives ? "/HR/dashboard/Drives" : "/HR/dashboard")
          }
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
           Back to {fromDrives ? "Drive Management" : "Dashboard"}
        </button>

        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.stonewash }}
          >
            Manage Candidates
          </h1>
          <p className="text-gray-600">Create and manage candidate profiles</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="relative">
          <UserFormCard
            newUser={newUser}
            setNewUser={setNewUser}
            createCandidate={handleCreateCandidate}
            onImportClick={onImportClick}
            importing={importing}
            colors={colors}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ">
          <UsersTableHeader
            filteredCandidates={filteredCandidates.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            collegeFilter={collegeFilter}
            setCollegeFilter={setCollegeFilter}
            jobFilter={jobFilter}
            setJobFilter={setJobFilter}
            uniqueColleges={uniqueColleges}
            uniqueJobs={uniqueJobs}
            onExportCsv={exportCandidatesToCsv}
            colors={colors}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Candidate ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    College
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Assigned Drive
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
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12">
                      <EmptyState
                        icon={Users}
                        title="No candidates found"
                        message="Try adjusting your filters or create a new candidate"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <UserTableRow
                      key={candidate._id}
                      candidate={candidate}
                      getDriveName={getDriveName}
                      colors={colors}
                      deleteCandidate={handleDeleteCandidate}
                      onOpenAssign={onOpenAssign}
                      onEdit={openEditCandidate}
                    />
                  ))
                )}
              </tbody>
            </table>

            <AssignJobModal
              isOpen={isAssignOpen}
              onClose={() => setIsAssignOpen(false)}
              candidateId={assignCtx.candidateId}
              allJobs={jobs}
              filterKeys={assignCtx.filterKeys}
              filterBy={assignCtx.filterBy}
              onAssigned={handleAssigned}
            />

            <EditCandidateModal
              isOpen={isEditOpen}
              candidate={editingCandidate}
              drives={drives}
              onClose={closeEditCandidate}
              onSave={saveCandidateEdits}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
