// components/drivemanagement/EditDriveModal.jsx
import { X, MapPin, Calendar, Briefcase } from 'lucide-react';

/**
 * EditDriveModal Component
 * Modal for editing existing campus drives
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close modal function
 * @param {object} selectedDrive - Currently selected drive
 * @param {object} editData - Edit form data
 * @param {function} setEditData - Edit data setter
 * @param {function} saveDrive - Save drive function
 * @param {array} jobs - List of available jobs
 * @param {object} colors - Color palette object
 */
export const EditDriveModal = ({
  isOpen,
  onClose,
  selectedDrive,
  editData,
  setEditData,
  saveDrive,
  jobs,
  colors
}) => {
  if (!isOpen || !selectedDrive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div 
          className="p-6 text-white"
          style={{ backgroundColor: colors.stonewash }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Edit Campus Drive</h3>
              <p className="text-sm opacity-90 mt-1">
                {selectedDrive.driveId} - {selectedDrive.collegeName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive ID *
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all bg-gray-50"
                value={editData.driveId}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job *
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all appearance-none bg-white"
                  value={editData.jobId}
                  onChange={(e) => setEditData({ ...editData, jobId: e.target.value })}
                >
                  <option value="">Choose a job</option>
                  {jobs.map(job => (
                    <option key={job.JobID} value={job.JobID}>
                      {job.JobID} - {job.JobName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Name *
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                  value={editData.collegeName}
                  onChange={(e) => setEditData({ ...editData, collegeName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Date *
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                  value={editData.driveDate}
                  onChange={(e) => setEditData({ ...editData, driveDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all appearance-none bg-white"
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="Live">Live</option>
                <option value="GD Completed">GD Completed</option>
                <option value="PI Completed">PI Completed</option>
                <option value="Results Released">Results Released</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="e.g., Mumbai, Maharashtra"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registrations
              </label>
              <input
                type="number"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                value={editData.registrations}
                onChange={(e) => setEditData({ ...editData, registrations: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shortlisted
              </label>
              <input
                type="number"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                value={editData.shortlisted}
                onChange={(e) => setEditData({ ...editData, shortlisted: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected
              </label>
              <input
                type="number"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                value={editData.selected}
                onChange={(e) => setEditData({ ...editData, selected: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
        </div>

        <div 
          className="p-6 border-t border-gray-200 flex items-center justify-end gap-3"
          style={{ backgroundColor: colors.softFlow + "10" }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={saveDrive}
            className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
            style={{ backgroundColor: colors.rainShadow }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDriveModal;
