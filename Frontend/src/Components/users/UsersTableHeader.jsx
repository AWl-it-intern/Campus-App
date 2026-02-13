// components/users/UsersTableHeader.jsx
import React from 'react';
import { Users, Search } from 'lucide-react';

/**
 * UsersTableHeader Component
 * Table header with search and filters for the candidates table
 * 
 * @param {number} filteredCandidates - Count of filtered candidates
 * @param {string} searchTerm - Current search term
 * @param {function} setSearchTerm - Search term setter
 * @param {string} collegeFilter - Selected college filter
 * @param {function} setCollegeFilter - College filter setter
 * @param {string} jobFilter - Selected job filter
 * @param {function} setJobFilter - Job filter setter
 * @param {array} uniqueColleges - List of unique colleges
 * @param {array} uniqueJobs - List of unique jobs
 * @param {object} colors - Color palette object
 */
export const UsersTableHeader = ({ 
  filteredCandidates,
  searchTerm,
  setSearchTerm,
  collegeFilter,
  setCollegeFilter,
  jobFilter,
  setJobFilter,
  uniqueColleges,
  uniqueJobs,
  colors 
}) => {
  return (
    <div 
      className="p-6 text-white"
      style={{ backgroundColor: colors.stonewash }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Users size={24} />
          <div>
            <h2 className="text-xl font-bold">Candidates Overview</h2>
            <p className="text-sm opacity-90">
              Total: {filteredCandidates} candidate{filteredCandidates !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60 min-w-50px"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backdropFilter: 'blur(10px)'}}
            />
          </div>

          <select
            className="px-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <option value="" className="text-gray-800">All Colleges</option>
            {uniqueColleges.map(college => (
              <option key={college} value={college} className="text-gray-800">
                {college}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <option value="" className="text-gray-800">All Jobs</option>
            {uniqueJobs.map(job => (
              <option key={job} value={job} className="text-gray-800">
                {job}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default UsersTableHeader;
