import { useEffect, useMemo, useState } from "react";

export default function EditCandidateModal({
  isOpen,
  candidate,
  drives = [],
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    driveId: "",
  });

  useEffect(() => {
    if (candidate) {
      const rawDriveId =
        candidate.driveId || candidate.DriveID || candidate.assignedDriveId || "";
      const matchedDrive = (drives || []).find(
        (drive) =>
          String(drive._id || drive.id || "") === String(rawDriveId) ||
          String(drive.DriveID || "") === String(rawDriveId),
      );

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: candidate.name || "",
        email: candidate.email || "",
        college: candidate.college || "",
        driveId: matchedDrive ? String(matchedDrive._id || matchedDrive.id || "") : rawDriveId,
      });
    }
  }, [candidate, drives]);

  const driveOptions = useMemo(
    () =>
      (drives || []).map((drive) => ({
        id: String(drive._id || drive.id || ""),
        label: `${drive.DriveID || ""} - ${drive.CollegeName || ""}`.trim(),
      })),
    [drives],
  );

  const handleSave = () => {
    if (!candidate) return;
    onSave?.(candidate._id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      college: formData.college.trim(),
      driveId: formData.driveId || "",
    });
  };

  if (!isOpen || !candidate) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
      aria-labelledby="edit-candidate-title"
    >
      <div className="modal-surface bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 id="edit-candidate-title" className="text-lg sm:text-xl font-semibold">
            Edit Candidate
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate ID</label>
            <input
              value={candidate.CandidateID || "-"}
              disabled
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <input
              value={formData.college}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, college: event.target.value }))
              }
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drive</label>
            <select
              value={formData.driveId}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, driveId: event.target.value }))
              }
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white"
            >
              <option value="">Not assigned</option>
              {driveOptions.map((drive) => (
                <option key={drive.id} value={drive.id}>
                  {drive.label || drive.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-white flex items-center justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            onClick={onClose}
          >
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
