import { useEffect, useMemo, useState } from "react";
import { updateCandidate } from "../../services/candidatesService";

export default function AssignJobModal({
  isOpen,
  onClose,
  candidateId,
  allJobs = [],
  filterKeys = [],
  filterBy = "JobID",
  onAssigned,
  loading = false,
}) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

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
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const clearSelected = () => setSelected([]);

  const deleteAllAssigned = async () => {
    if (!candidateId) return;
    setSaving(true);
    try {
      const response = await updateCandidate(candidateId, {
        AssignedJobs: [],
        clearAssignedJobs: true,
      });
      onAssigned?.({ jobs: [], response, mode: "clear" });
      onClose?.();
    } catch (error) {
      const msg = error?.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to clear jobs: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!candidateId || selected.length === 0) return;
    setSaving(true);
    try {
      const payload = { AssignedJobs: selected };
      const response = await updateCandidate(candidateId, payload);

      const selectedJobs = filteredByKeys.filter((job) => selected.includes(jobValue(job)));
      onAssigned?.({ jobs: selectedJobs, response, mode: "append" });
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
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-labelledby="assign-jobs-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 id="assign-jobs-title" className="text-lg sm:text-xl font-semibold">
            Assign Jobs
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ?
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              type="button"
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              onClick={clearSelected}
              disabled={selected.length === 0 || saving}
            >
              Clear selected
            </button>
            <button
              type="button"
              className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              onClick={deleteAllAssigned}
              disabled={saving}
            >
              Delete all
            </button>
            <div role="status" aria-live="polite" className="ml-auto text-sm text-gray-600">
              Selected: <strong>{selected.length}</strong>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="max-h-72 overflow-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center text-center py-16 gap-2">
                  <div className="text-3xl">?</div>
                  <div className="text-sm font-medium text-gray-900">Loading jobs...</div>
                  <div className="text-xs text-gray-500">Please wait while we fetch jobs.</div>
                </div>
              ) : filteredByKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 gap-2">
                  <div className="text-3xl">??</div>
                  <div className="text-sm font-medium text-gray-900">No jobs found</div>
                  <div className="text-xs text-gray-500">No jobs available for assignment.</div>
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredByKeys.map((job) => {
                    const value = jobValue(job);
                    const id = `job-${job._id || job.JobID || value}`;
                    const checked = selected.includes(value);
                    const labelMain = job?.JobID
                      ? `${job.JobID} - ${job.JobName || job.JobTitle || ""}`
                      : job?.JobName || job?.JobTitle || "Unnamed";

                    return (
                      <li key={id} className="px-4 py-3 hover:bg-gray-50">
                        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
                          <input
                            id={id}
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            checked={checked}
                            onChange={() => toggleOne(value)}
                            disabled={!value || saving}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{labelMain}</div>
                            {value && (
                              <div className="text-xs text-gray-500">
                                store as: <code className="font-mono">{value}</code>
                              </div>
                            )}
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-white sticky bottom-0 flex items-center justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white disabled:opacity-60"
            style={{ backgroundColor: "#00988D" }}
            onClick={submit}
            disabled={selected.length === 0 || saving}
          >
            {saving ? "Assigning..." : `Assign (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
