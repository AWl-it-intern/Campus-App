import { useEffect, useMemo, useState } from "react";
import MultiSelectDropdown from "../common/MultiSelectDropdown.jsx";

const getFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const normalizeStatus = (value) => {
  const status = String(value || "Draft").trim().toLowerCase();
  if (status === "live") return "Live";
  if (status === "closed") return "Closed";
  return "Draft";
};

const normalizeJobsOpening = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeDateForInput = (value) => {
  if (!value) return "";
  const stringValue = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) return stringValue;
  if (stringValue.includes("T")) return stringValue.slice(0, 10);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

export default function EditDriveModal({
  isOpen,
  drive,
  jobs = [],
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    DriveID: "",
    CollegeName: "",
    StartDate: "",
    EndDate: "",
    JobsOpening: [],
    Status: "Draft",
  });

  useEffect(() => {
    if (drive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        DriveID: String(
          getFirstDefined(drive.DriveID, drive.driveId, drive.driveID, ""),
        ).trim(),
        CollegeName: String(
          getFirstDefined(drive.CollegeName, drive.collegeName, drive.college, ""),
        ).trim(),
        StartDate: normalizeDateForInput(
          getFirstDefined(drive.StartDate, drive.startDate, drive.start_date, ""),
        ),
        EndDate: normalizeDateForInput(
          getFirstDefined(drive.EndDate, drive.endDate, drive.end_date, ""),
        ),
        JobsOpening: normalizeJobsOpening(
          getFirstDefined(
            drive.JobsOpening,
            drive.jobsOpening,
            drive.JobOpening,
            drive.jobOpening,
            [],
          ),
        ),
        Status: normalizeStatus(getFirstDefined(drive.Status, drive.status, "Draft")),
      });
    }
  }, [drive]);

  const jobOptions = useMemo(
    () =>
      [...new Set((jobs || []).map((job) => job.JobName).filter(Boolean))].sort(
        (left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }),
      ),
    [jobs],
  );

  const handleSave = () => {
    if (!drive) return;
    onSave?.(drive.id || drive._id, {
      DriveID: formData.DriveID.trim(),
      CollegeName: formData.CollegeName.trim(),
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      JobsOpening: Array.isArray(formData.JobsOpening) ? formData.JobsOpening : [],
      Status: formData.Status,
    });
  };

  if (!isOpen || !drive) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
      aria-labelledby="edit-drive-title"
    >
      <div className="modal-surface bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 id="edit-drive-title" className="text-lg sm:text-xl font-semibold">
            Edit Drive
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drive ID</label>
              <input
                value={formData.DriveID}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, DriveID: event.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
              <input
                value={formData.CollegeName}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, CollegeName: event.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.StartDate}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, StartDate: event.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.EndDate}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, EndDate: event.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.Status}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, Status: event.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Live">Live</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jobs Opening
            </label>
            <MultiSelectDropdown
              options={jobOptions}
              selectedValues={formData.JobsOpening}
              onChange={(values) =>
                setFormData((prev) => ({ ...prev, JobsOpening: values }))
              }
              placeholder="Select one or more job openings"
              emptyMessage="No jobs available in Job table."
              accentColor="#00988D"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-white flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: "#00988D" }}
            onClick={handleSave}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
