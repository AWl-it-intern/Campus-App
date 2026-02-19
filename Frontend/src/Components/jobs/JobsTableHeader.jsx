// components/jobs/JobsTableHeader.jsx

import { Briefcase, Search } from 'lucide-react';

/**
 * JobsTableHeader Component
 * Table header with search and filters for the jobs table
 * 
 * @param {number} filteredJobsCount - Count of filtered jobs
 * @param {string} jobSearchTerm - Current search term
 * @param {function} setJobSearchTerm - Search term setter
 * @param {object} colors - Color palette object
 */
export const JobsTableHeader = ({ 
  filteredJobsCount,
  jobSearchTerm,
  setJobSearchTerm,
  colors 
}) => {
  return (
    <div 
      className="p-6 text-white"
      style={{ backgroundColor: colors.stonewash }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Briefcase size={24} />
          <div>
            <h2 className="text-xl font-bold">Jobs Overview</h2>
            <p className="text-sm opacity-90">
              Total: {filteredJobsCount} job{filteredJobsCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" 
            />
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              style={{ backdropFilter: 'blur(10px)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsTableHeader;
