// Components/candidates/AssignJobModal.jsx
import { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";

// const API_BASE = "http://localhost:5000"; 

export default function AssignJobModal({
  isOpen,
  onClose,
  candidateId,
  allJobs = [],
  filterKeys = [],
  filterBy = "JobID", // 👈 Default to JobID for consistency
  onAssigned,
  loading = false, // optional: pass true while jobs are fetching
}) {
  const [selected, setSelected] = useState([]); // array of JobID/JobName
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Focus search when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSelected([]);
      setQuery("");
    }
  }, [isOpen]);

  // 1) Restrict by filterKeys if provided
  const filteredByKeys = useMemo(() => {
    if (!Array.isArray(allJobs)) return [];
    const keys = new Set((filterKeys || []).map((k) => String(k).toLowerCase().trim()));
    if (keys.size === 0) return allJobs;
    return allJobs.filter((job) =>
      keys.has(String(job?.[filterBy] || "").toLowerCase().trim())
    );
  }, [allJobs, filterKeys, filterBy]);

  // 2) Search
  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredByKeys;
    return filteredByKeys.filter((job) => {
      const id = String(job?.JobID ?? "").toLowerCase();
      const name = String(job?.JobName ?? "").toLowerCase();
      const title = String(job?.JobTitle ?? "").toLowerCase();
      return id.includes(q) || name.includes(q) || title.includes(q);
    });
  }, [filteredByKeys, query]);

  // Group for better scanning (with / without JobID)
  const groups = useMemo(() => {
    const withId = [];
    const withoutId = [];
    for (const job of visibleJobs) {
      if (job?.JobID) withId.push(job);
      else withoutId.push(job);
    }
    return { withId, withoutId };
  }, [visibleJobs]);

  const jobValue = (job) => String(job?.[filterBy] ?? "");

  const toggleOne = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleAllVisible = () => {
    const visibleValues = visibleJobs.map(jobValue).filter(Boolean);
    const setVisible = new Set(visibleValues);
    const allSelected = visibleValues.length > 0 && visibleValues.every((v) => selected.includes(v));
    if (allSelected) {
      setSelected((prev) => prev.filter((v) => !setVisible.has(v)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...visibleValues])));
    }
  };

  const clearAll = () => setSelected([]);

  const submit = async () => {
    if (!candidateId || selected.length === 0) return;
    setSaving(true);
    try {
      const payload = { AssignedJobs: selected }; // array of JobID or JobName
      const { data } = await axios.patch(`/candidate/${candidateId}`, payload); // add api baase here 

      const selectedJobs = filteredByKeys.filter((j) => selected.includes(jobValue(j)));
      onAssigned?.({ jobs: selectedJobs, response: data });
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Unknown error";
      alert(`Failed to assign jobs: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const allVisibleSelected =
    visibleJobs.length > 0 &&
    visibleJobs.map(jobValue).filter(Boolean).every((v) => selected.includes(v));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-labelledby="assign-jobs-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 id="assign-jobs-title" className="text-lg sm:text-xl font-semibold">
            Assign Jobs
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-2">
          {/* Search + counts */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                className="w-full border rounded-xl px-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Search by Job ID, Name, or Title…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={saving}
                aria-label="Search jobs"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
              {query && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Showing <strong>{visibleJobs.length}</strong> of {filteredByKeys.length}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              type="button"
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              onClick={toggleAllVisible}
              disabled={visibleJobs.length === 0 || saving}
            >
              {allVisibleSelected ? "Unselect visible" : "Select visible"}
            </button>
            <button
              type="button"
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              onClick={clearAll}
              disabled={selected.length === 0 || saving}
            >
              Clear selected
            </button>
            <div
              role="status"
              aria-live="polite"
              className="ml-auto text-sm text-gray-600"
            >
              Selected: <strong>{selected.length}</strong>
            </div>
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selected.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 text-xs"
                >
                  {val}
                  <button
                    type="button"
                    className="text-teal-700/80 hover:text-teal-900"
                    aria-label={`Remove ${val}`}
                    onClick={() => setSelected((prev) => prev.filter((x) => x !== val))}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* List */}
          <div className="rounded-xl border overflow-hidden">
            <div className="max-h-72 overflow-auto">
              {loading ? (
                <EmptyState
                  icon="⏳"
                  title="Loading jobs…"
                  description="Please wait while we fetch the latest jobs."
                />
              ) : visibleJobs.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="No jobs found"
                  description="Try adjusting your search or filters."
                />
              ) : (
                <div role="list" aria-label="Jobs list" className="divide-y">
                  {/* With JobID */}
                  {groups.withId.length > 0 && (
                    <Section
                      title="Jobs with ID"
                      jobs={groups.withId}
                      selected={selected}
                      onToggle={toggleOne}
                      filterBy={filterBy}
                      query={query}
                    />
                  )}
                  {/* Without JobID */}
                  {groups.withoutId.length > 0 && (
                    <Section
                      title="Others"
                      jobs={groups.withoutId}
                      selected={selected}
                      onToggle={toggleOne}
                      filterBy={filterBy}
                      query={query}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Helper note */}
          <p className="mt-2 text-xs text-gray-500">
            Storing as: <code className="font-mono">{filterBy}</code>. You can change this via <code>filterBy</code> to use <code>JobID</code> or <code>JobName</code>.
          </p>
        </div>

        {/* Sticky footer */}
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
            {saving ? "Assigning…" : `Assign (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small presentational helpers ---------- */

function Section({ title, jobs, selected, onToggle, filterBy, query }) {
  return (
    <div role="group" aria-label={title}>
      <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 sticky top-0 z-10">
        {title} <span className="text-gray-400">({jobs.length})</span>
      </div>
      <ul className="divide-y">
        {jobs.map((job) => {
          const value = String(job?.[filterBy] ?? "");
          const labelMain = job?.JobID
            ? `${job.JobID} — ${job.JobName || job.JobTitle || ""}`
            : job?.JobName || job?.JobTitle || "Unnamed";
          const labelSub =
            filterBy === "JobID"
              ? job?.JobName || job?.JobTitle
              : job?.JobID;

          const id = `job-${job._id || job.JobID || value}`;
          const checked = selected.includes(value);

          return (
            <li key={id} role="listitem" className="px-4 py-3 hover:bg-gray-50">
              <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
                <input
                  id={id}
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={checked}
                  onChange={() => onToggle(value)}
                  disabled={!value}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    <Highlight text={labelMain} query={query} />
                  </div>
                  {(labelSub || value) && (
                    <div className="text-xs text-gray-500">
                      {labelSub && (
                        <>
                          <Highlight text={String(labelSub)} query={query} /> ·{" "}
                        </>
                      )}
                      store as: <code className="font-mono">{value || "(empty)"}</code>
                    </div>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyState({ icon = "ℹ️", title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-2">
      <div className="text-3xl">{icon}</div>
      <div className="text-sm font-medium text-gray-900">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const q = query.trim();
  if (!q) return <>{text}</>;
  const parts = String(text).split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}