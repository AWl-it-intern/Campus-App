// components/drivemanagement/CreateJobModal.jsx
import React from 'react';
import { X, Briefcase } from 'lucide-react';

/**
 * CreateJobModal Component
 * Modal for creating new jobs inline from Drive Management
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close modal function
 * @param {object} newJobData - New job form data
 * @param {function} setNewJobData - Job data setter
 * @param {function} createJob - Create job function
 * @param {object} colors - Color palette object
 */
export const CreateJobModal = ({
  isOpen,
  onClose,
  newJobData,
  setNewJobData,
  createJob,
  colors
}) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!newJobData.JobID || !newJobData.JobName) {
      alert("Please fill in all required fields");
      return;
    }
    createJob();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div 
          className="p-6 text-white"
          style={{ backgroundColor: colors.stonewash }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Create New Job Opening</h3>
              <p className="text-sm opacity-90 mt-1">
                Add a new job to assign to drives
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

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job ID *
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="e.g., JOB001"
                value={newJobData.JobID}
                onChange={(e) => setNewJobData({ ...newJobData, JobID: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="e.g., Software Engineer"
                value={newJobData.JobName}
                onChange={(e) => setNewJobData({ ...newJobData, JobName: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                placeholder="Job description..."
                rows="3"
                value={newJobData.description || ''}
                onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div 
          className="p-6 border-t border-gray-200 flex items-center justify-end gap-3"
          style={{ backgroundColor: colors.mossRock + "10" }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
            style={{ backgroundColor: colors.mossRock }}
          >
            <div className="flex items-center gap-2">
              <Briefcase size={18} />
              Create Job
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateJobModal;
