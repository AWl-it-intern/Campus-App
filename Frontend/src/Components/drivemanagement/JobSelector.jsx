// components/drivemanagement/JobSelector.jsx
import React, { useState } from 'react';
import { Briefcase, ChevronDown, Plus } from 'lucide-react';

/**
 * JobSelector Component
 * Dropdown selector for filtering drives by job with create job option
 * 
 * @param {string} selectedJob - Currently selected job ID
 * @param {function} setSelectedJob - Job selection setter
 * @param {array} jobs - List of available jobs
 * @param {function} onCreateJob - Handler to open create job modal
 * @param {object} colors - Color palette object
 */
export const JobSelector = ({ 
  selectedJob, 
  setSelectedJob, 
  jobs,
  onCreateJob,
  colors 
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Job Opening to View Drives
      </label>
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Briefcase 
            size={20} 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" 
          />
          <select
            className="w-full border-2 border-gray-300 rounded-xl pl-12 pr-10 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 transition-all appearance-none bg-white shadow-sm hover:border-gray-400"
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

        <button
          onClick={onCreateJob}
          className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
          style={{ backgroundColor: colors.mossRock }}
        >
          <Plus size={20} />
          <span>Create Job</span>
        </button>
      </div>
    </div>
  );
};

export default JobSelector;
