export default function JobCandidatesModal({ isOpen, onClose, job, candidates = [] }) {
  if (!isOpen || !job) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
      aria-labelledby="job-candidates-title"
    >
      <div className="modal-surface bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 id="job-candidates-title" className="text-lg sm:text-xl font-semibold">
              Assigned Candidates
            </h2>
            <p className="text-sm text-gray-500">
              {job.JobName} ({job.JobID})
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-auto">
          {candidates.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-10">
              No candidates assigned yet.
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {candidate.name || "Candidate"}
                    </p>
                    <p className="text-sm text-gray-600">{candidate.email || "-"}</p>
                    <p className="text-xs text-gray-500">{candidate.college || "-"}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    {candidate.CandidateID || "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
