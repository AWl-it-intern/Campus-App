import { useEffect, useMemo, useState } from "react";

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
    NumberOfCandidates: 0,
  });

  useEffect(() => {
    if (drive) {
      setFormData({
        DriveID: drive.DriveID || "",
        CollegeName: drive.CollegeName || "",
        StartDate: drive.StartDate || "",
        EndDate: drive.EndDate || "",
        JobsOpening: Array.isArray(drive.JobsOpening) ? drive.JobsOpening : [],
        Status: drive.Status || "Draft",
        NumberOfCandidates: Number(drive.NumberOfCandidates) || 0,
      });
    }
  }, [drive]);

  const jobOptions = useMemo(
    () => [...new Set((jobs || []).map((job) => job.JobName).filter(Boolean))],
    [jobs],
  );

  const handleJobsOpeningChange = (event) => {
    const selectedValues = Array.from(event.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, JobsOpening: selectedValues }));
  };

  const handleSave = () => {
    if (!drive) return;
    onSave?.(drive.id || drive._id, {
      DriveID: formData.DriveID.trim(),
      CollegeName: formData.CollegeName.trim(),
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      JobsOpening: Array.isArray(formData.JobsOpening) ? formData.JobsOpening : [],
      Status: formData.Status,
      NumberOfCandidates: Number(formData.NumberOfCandidates) || 0,
    });
  };

  if (!isOpen || !drive) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-labelledby="edit-drive-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Candidates
              </label>
              <input
                value={formData.NumberOfCandidates}
                disabled
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jobs Opening
            </label>
            <select
              multiple
              value={formData.JobsOpening}
              onChange={handleJobsOpeningChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 min-h-[120px]"
            >
              {jobOptions.map((jobName) => (
                <option key={jobName} value={jobName}>
                  {jobName}
                </option>
              ))}
            </select>
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
