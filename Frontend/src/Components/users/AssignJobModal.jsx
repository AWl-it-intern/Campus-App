import { useEffect, useMemo, useState } from "react";
import { Briefcase, CheckCircle2, Trash2, X } from "lucide-react";
import { updateCandidate } from "../../services/candidatesService";

export default function AssignJobModal({
  isOpen,
  onClose,
  candidateId,
  candidateIds = [],
  candidateName = "",
  candidateEmail = "",
  allJobs = [],
  filterKeys = [],
  filterBy = "JobID",
  onAssigned,
  loading = false,
  colors = {},
}) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const accentColor = colors.softFlow || "#00988D";
  const headerColor = colors.stonewash || "#005A56";
  const iconColor = colors.rainShadow || "#2B6777";
  const targetCandidateIds = useMemo(() => {
    const ids = Array.isArray(candidateIds)
      ? candidateIds
      : candidateId
        ? [candidateId]
        : [];
    return Array.from(
      new Set(ids.map((value) => String(value || "").trim()).filter(Boolean)),
    );
  }, [candidateId, candidateIds]);

  const candidateCount = targetCandidateIds.length;
  const isBulkMode = candidateCount > 1;

  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
    }
  }, [isOpen]);

  const filteredByKeys = useMemo(() => {
    if (!Array.isArray(allJobs)) return [];
    const keys = new Set((filterKeys || []).map((key) => String(key).toLowerCase().trim()));
    if (keys.size === 0) return allJobs;
    return allJobs.filter((job) =>
      keys.has(String(job?.[filterBy] || "").toLowerCase().trim()),
    );
  }, [allJobs, filterKeys, filterBy]);

  const jobValue = (job) => String(job?.[filterBy] ?? "");

  const toggleOne = (value) => {
    setSelected((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  };

  const clearSelected = () => setSelected([]);

  const deleteAllAssigned = async () => {
    if (targetCandidateIds.length === 0) return;

    setSaving(true);
    try {
      const results = await Promise.allSettled(
        targetCandidateIds.map((id) =>
          updateCandidate(id, {
            AssignedJobs: [],
            clearAssignedJobs: true,
          }),
        ),
      );
      const failedCount = results.filter((result) => result.status === "rejected").length;
      if (failedCount > 0) {
        alert(`Failed to clear jobs for ${failedCount} candidate(s).`);
      }
      onAssigned?.({
        jobs: [],
        response: results,
        mode: "clear",
        candidateIds: targetCandidateIds,
        filterBy,
      });
      onClose?.();
    } catch (error) {
      const msg = error?.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to clear jobs: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (targetCandidateIds.length === 0 || selected.length === 0) return;

    setSaving(true);
    try {
      const results = await Promise.allSettled(
        targetCandidateIds.map((id) =>
          updateCandidate(id, { AssignedJobs: selected }),
        ),
      );
      const failedCount = results.filter((result) => result.status === "rejected").length;
      if (failedCount > 0) {
        alert(`Failed to assign jobs for ${failedCount} candidate(s).`);
      }
      const selectedJobs = filteredByKeys.filter((job) => selected.includes(jobValue(job)));
      onAssigned?.({
        jobs: selectedJobs,
        response: results,
        mode: "append",
        candidateIds: targetCandidateIds,
        filterBy,
      });
      onClose?.();
    } catch (error) {
      const msg = error?.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to assign jobs: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="modal-surface bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 text-white" style={{ backgroundColor: headerColor }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 id="assign-jobs-title" className="text-2xl font-bold">
                {isBulkMode ? "Assign Jobs (Bulk)" : "Assign Jobs"}
              </h3>
              <p className="text-sm opacity-90 mt-1">
                {isBulkMode
                  ? `${candidateCount} candidate(s) selected`
                  : `${candidateName || "Candidate"}${candidateEmail ? ` (${candidateEmail})` : ""}`}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <p className="text-gray-700">
              <span className="font-semibold">{selected.length}</span> job(s) selected
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                onClick={clearSelected}
                disabled={selected.length === 0 || saving}
              >
                Clear selected
              </button>

              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 inline-flex items-center gap-1"
                onClick={deleteAllAssigned}
                disabled={saving || targetCandidateIds.length === 0}
              >
                <Trash2 size={14} />
                Delete all
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-3"></div>
                <p className="font-medium">Loading jobs...</p>
              </div>
            ) : filteredByKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No jobs available</p>
                <p className="text-sm">Please add jobs in Job Management first</p>
              </div>
            ) : (
              filteredByKeys.map((job) => {
                const value = jobValue(job);
                const labelMain = job?.JobName || job?.JobTitle || value || "Unnamed Job";
                const labelSub = job?.JobID || "-";
                const checked = selected.includes(value);
                const itemKey = job._id || job.id || job.JobID || value;

                return (
                  <label
                    key={itemKey}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      checked
                        ? "border-opacity-100 shadow-md"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    style={{
                      borderColor: checked ? accentColor : undefined,
                      backgroundColor: checked ? `${accentColor}10` : undefined,
                    }}
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded accent-green-600"
                      checked={checked}
                      onChange={() => toggleOne(value)}
                      disabled={!value || saving}
                    />
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                      style={{ backgroundColor: iconColor }}
                    >
                      <Briefcase size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{labelMain}</p>
                      <p className="text-sm text-gray-600">Job ID: {labelSub}</p>
                    </div>
                    {checked && <CheckCircle2 size={24} style={{ color: accentColor }} />}
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div
          className="p-6 border-t border-gray-200 flex items-center justify-end gap-3"
          style={{ backgroundColor: `${accentColor}10` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
            disabled={selected.length === 0 || saving}
          >
            {saving ? "Saving..." : "Save Assignments"}
          </button>
        </div>
      </div>
    </div>
  );
}
