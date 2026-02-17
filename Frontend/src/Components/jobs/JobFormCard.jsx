// components/jobs/JobFormCard.jsx
import { Plus, Briefcase } from 'lucide-react';

/**
 * JobFormCard Component
 * Form for creating new jobs in the CreateJob page
 * 
 * @param {object} newJob - Job form state object {JobID, JobName}
 * @param {function} setNewJob - State setter for job form
 * @param {function} createJob - Function to create new job
 * @param {object} colors - Color palette object
 */
export const JobFormCard = ({ 
  newJob, 
  setNewJob, 
  createJob, 
  colors 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.rainShadow + "20" }}
        >
          <Plus size={24} style={{ color: colors.rainShadow }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: colors.stonewash }}>
            Create New Job
          </h2>
          <p className="text-sm text-gray-600">Add a new job opening to the system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job ID *
          </label>
          <input
            type="text"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="e.g., JOB001"
            value={newJob.JobID}
            onChange={(e) => setNewJob({ ...newJob, JobID: e.target.value })}
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
            value={newJob.JobName}
            onChange={(e) => setNewJob({ ...newJob, JobName: e.target.value })}
          />
        </div>
      </div>

      <button
        onClick={createJob}
        className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
        style={{ backgroundColor: colors.rainShadow }}
      >
        <div className="flex items-center justify-center gap-2">
          <Briefcase size={20} />
          <span>Create Job</span>
        </div>
      </button>
    </div>
  );
};

export default JobFormCard;
