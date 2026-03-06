import { useEffect, useMemo, useRef, useState } from "react";
import { Users, Briefcase, AlertTriangle, MapPin } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  UserFormCard,
  UsersTableHeader,
  UserTableRow,
} from "../../Components/users/index.js";
import AssignJobModal from "../../Components/users/AssignJobModal.jsx";
import EditCandidateModal from "../../Components/users/EditCandidateModal.jsx";
import EmptyState from "../../Components/common/EmptyState.jsx";
import StatsCard from "../../Components/common/StatsCard.jsx";
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import useCreateUsers from "../../hooks/useCreateUsers";
import HR_COLORS from "../../theme/hrPalette";

export default function CreateUsers({ drives: drivesProp = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const colors = HR_COLORS;

  const CANDIDATE_VIEWS = {
    HOME: "home",
    IMPORT: "import-candidates",
    LIST: "candidates-list",
  };

  const activeViewRaw = String(searchParams.get("view") || "").trim().toLowerCase();
  const activeView = Object.values(CANDIDATE_VIEWS).includes(activeViewRaw)
    ? activeViewRaw
    : CANDIDATE_VIEWS.HOME;

  const {
    fileInputRef,
    candidates,
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
    isEditOpen,
    editingCandidate,
    uniqueColleges,
    uniqueJobs,
    filteredCandidates,
    getDriveName,
    handleCreateCandidate,
    handleDeleteCandidatesBulk,
    handleAssigned,
    exportCandidatesToCsv,
    onImportClick,
    onFileChange,
    openEditCandidate,
    closeEditCandidate,
    saveCandidateEdits,
  } = useCreateUsers({ drivesProp });
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const selectAllRef = useRef(null);

  const getCandidateKey = (candidate) =>
    String(candidate?._id || candidate?.id || candidate?.CandidateID || "").trim();

  const allCandidateIdSet = useMemo(
    () => new Set((candidates || []).map((candidate) => getCandidateKey(candidate)).filter(Boolean)),
    [candidates],
  );

  const activeSelectedCandidateIds = useMemo(
    () => selectedCandidateIds.filter((candidateId) => allCandidateIdSet.has(candidateId)),
    [selectedCandidateIds, allCandidateIdSet],
  );

  const selectedCandidateSet = useMemo(
    () => new Set(activeSelectedCandidateIds.map((value) => String(value))),
    [activeSelectedCandidateIds],
  );

  const visibleCandidateIds = useMemo(
    () => filteredCandidates.map((candidate) => getCandidateKey(candidate)).filter(Boolean),
    [filteredCandidates],
  );

  const selectedVisibleCount = useMemo(
    () => visibleCandidateIds.filter((candidateId) => selectedCandidateSet.has(candidateId)).length,
    [visibleCandidateIds, selectedCandidateSet],
  );

  const allVisibleSelected =
    visibleCandidateIds.length > 0 && selectedVisibleCount === visibleCandidateIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleCandidateSelection = (candidateId) => {
    const normalizedId = String(candidateId || "").trim();
    if (!normalizedId) return;
    setSelectedCandidateIds((prev) =>
      prev.includes(normalizedId)
        ? prev.filter((value) => value !== normalizedId)
        : [...prev, normalizedId],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleSet = new Set(visibleCandidateIds);
      setSelectedCandidateIds((prev) => prev.filter((candidateId) => !visibleSet.has(candidateId)));
      return;
    }

    setSelectedCandidateIds((prev) => {
      const merged = new Set(prev);
      visibleCandidateIds.forEach((candidateId) => merged.add(candidateId));
      return Array.from(merged);
    });
  };

  const openBulkAssign = () => {
    if (activeSelectedCandidateIds.length === 0) {
      alert("Select at least one candidate.");
      return;
    }
    setIsAssignOpen(true);
  };

  const handleBulkDelete = async () => {
    if (activeSelectedCandidateIds.length === 0) {
      alert("Select at least one candidate.");
      return;
    }

    const idsToDelete = [...activeSelectedCandidateIds];
    const confirmed = window.confirm(
      `Delete ${idsToDelete.length} selected candidate(s)? This action cannot be undone.`,
    );
    if (!confirmed) return;

    const result = await handleDeleteCandidatesBulk(idsToDelete);
    const failedSet = new Set(result.failedIds || []);
    setSelectedCandidateIds((prev) => prev.filter((candidateId) => failedSet.has(candidateId)));

    if (result.failedCount > 0) {
      alert(
        `Deleted ${result.deletedCount} candidate(s). Failed to delete ${result.failedCount} candidate(s).`,
      );
      return;
    }

    alert(`Deleted ${result.deletedCount} candidate(s) successfully.`);
  };

  const getAssignedJobs = (candidate) => {
    if (Array.isArray(candidate?.AssignedJobs)) {
      return candidate.AssignedJobs.filter(Boolean).map(String);
    }

    return String(candidate?.AssignedJob || "")
      .split(/[;,]/)
      .map((value) => value.trim())
      .filter(Boolean);
  };

  const assignedCandidatesCount = useMemo(
    () => (candidates || []).filter((candidate) => getAssignedJobs(candidate).length > 0).length,
    [candidates],
  );

  const statsData = useMemo(
    () => [
      {
        title: "Total Candidates",
        count: (candidates || []).length,
        icon: Users,
        bgColor: colors.rainShadow,
        lightBg: "#E8F9F0",
      },
      {
        title: "Assigned to Jobs",
        count: assignedCandidatesCount,
        icon: Briefcase,
        bgColor: colors.softFlow,
        lightBg: "#E6F9F5",
      },
      {
        title: "Pending Assignment",
        count: Math.max(0, (candidates || []).length - assignedCandidatesCount),
        icon: AlertTriangle,
        bgColor: colors.marigoldFlame,
        lightBg: "#FFF9E6",
      },
      {
        title: "Colleges Covered",
        count: uniqueColleges.length,
        icon: MapPin,
        bgColor: colors.mossRock,
        lightBg: "#E8F9E8",
      },
    ],
    [
      candidates,
      assignedCandidatesCount,
      uniqueColleges.length,
      colors.rainShadow,
      colors.softFlow,
      colors.marigoldFlame,
      colors.mossRock,
    ],
  );

  const candidateNavItems = [
    { key: CANDIDATE_VIEWS.HOME, label: "Home" },
    { key: CANDIDATE_VIEWS.IMPORT, label: "Import Candidates" },
    { key: CANDIDATE_VIEWS.LIST, label: "Candidates List" },
  ];

  const viewHeader = {
    [CANDIDATE_VIEWS.HOME]: {
      title: "Candidate Management",
      subtitle:
        "Track candidate pipeline health, assignment readiness, and college coverage at a glance.",
    },
    [CANDIDATE_VIEWS.IMPORT]: {
      title: "Import Candidates",
      subtitle: "Create individual candidates or import bulk candidates from CSV.",
    },
    [CANDIDATE_VIEWS.LIST]: {
      title: "Candidates List",
      subtitle: "Search, filter, assign jobs, and maintain candidate records.",
    },
  }[activeView];

  const switchCandidateView = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === CANDIDATE_VIEWS.HOME) {
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
          items={candidateNavItems}
          activeKey={activeView}
          onChange={switchCandidateView}
        />
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onFileChange}
      />

      {activeView === CANDIDATE_VIEWS.HOME ? (
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

      {activeView === CANDIDATE_VIEWS.IMPORT ? (
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
      ) : null}

      {activeView === CANDIDATE_VIEWS.LIST ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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

          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{activeSelectedCandidateIds.length}</span> selected
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={openBulkAssign}
                className="px-3 py-1.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: colors.mossRock }}
                disabled={activeSelectedCandidateIds.length === 0}
              >
                Assign Job to Selected
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg text-white text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-60"
                disabled={activeSelectedCandidateIds.length === 0}
              >
                Delete Selected
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      disabled={visibleCandidateIds.length === 0}
                    />
                  </th>
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
                    <td colSpan="8" className="py-12">
                      <EmptyState
                        icon={Users}
                        title="No candidates found"
                        message="Try adjusting your filters or create a new candidate"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    // Selection is keyed by stable candidate identifiers.
                    <UserTableRow
                      key={getCandidateKey(candidate)}
                      candidate={candidate}
                      candidateKey={getCandidateKey(candidate)}
                      isSelected={selectedCandidateSet.has(getCandidateKey(candidate))}
                      onToggleSelect={toggleCandidateSelection}
                      getDriveName={getDriveName}
                      colors={colors}
                      onEdit={openEditCandidate}
                    />
                  ))
                )}
              </tbody>
            </table>

            <AssignJobModal
              isOpen={isAssignOpen}
              onClose={() => setIsAssignOpen(false)}
              candidateId={activeSelectedCandidateIds[0] || null}
              candidateIds={activeSelectedCandidateIds}
              candidateName={`${activeSelectedCandidateIds.length} selected candidate(s)`}
              candidateEmail=""
              allJobs={jobs}
              filterKeys={[]}
              filterBy="JobName"
              onAssigned={async (payload) => {
                await handleAssigned(payload);
                setSelectedCandidateIds([]);
              }}
              colors={colors}
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
      ) : null}
    </HrShell>
  );
}
