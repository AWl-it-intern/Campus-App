/**
 * File Type: UI/UX Component
 * Business Logic File Used: ./useAptitudeTestManagement.js
 * Fields Used: targetCandidates, selectedCandidateSet, allVisibleSelected
 * Input Type: Candidate list + selection handlers
 * Output Type: ReactElement
 */
export default function AptitudeCandidatesTable({
  loading,
  targetCandidates,
  allVisibleSelected,
  selectedCandidateSet,
  getCandidateKey,
  toggleSelectAllVisible,
  toggleCandidateSelection,
  colors,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full">
        <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                disabled={targetCandidates.length === 0}
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Candidate</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                Loading candidates...
              </td>
            </tr>
          ) : null}
          {!loading && targetCandidates.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                No candidates found for selected drive-job.
              </td>
            </tr>
          ) : null}
          {!loading
            ? targetCandidates.map((candidate) => {
                const candidateKey = getCandidateKey(candidate);
                return (
                  <tr key={candidateKey} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidateSet.has(candidateKey)}
                        onChange={() => toggleCandidateSelection(candidateKey)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{candidate.name || "-"}</p>
                      <p className="text-xs text-gray-500">{candidate.CandidateID || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{candidate.email || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {candidate.ApplicationStatus || "Under Review"}
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
}
