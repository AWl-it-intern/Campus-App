// components/drivemanagement/DriveSelector.jsx
import React from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';

/**
 * DriveSelector Component
 * Dropdown selector for filtering drives by job
 * 
 * @param {string} selectedJob - Currently selected job ID
 * @param {function} setSelectedJob - Job selection setter
 * @param {array} jobs - List of available jobs
 * @param {object} colors - Color palette object
 */
export const DriveSelector = ({ 
  selectedJob, 
  setSelectedJob, 
  jobs,
  colors 
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Job Opening to View Drives
      </label>
      <div className="relative">
        <Briefcase 
          size={20} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" 
        />
        <select
          className="w-full md:w-96 border-2 border-gray-300 rounded-xl pl-12 pr-10 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 transition-all appearance-none bg-white shadow-sm hover:border-gray-400"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          style={{ 
            focusRingColor: colors.rainShadow,
            borderColor: selectedJob ? colors.rainShadow : undefined
          }}
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job.JobID} value={job.JobID}>
              {job.JobID} - {job.JobName}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={20} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  );
};

export default DriveSelector;
