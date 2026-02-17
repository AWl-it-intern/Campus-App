// components/drivemanagement/DrivesTableHeader.jsx
import React from 'react';
import { MapPin, Search, Filter } from 'lucide-react';

/**
 * DrivesTableHeader Component
 * Table header with filters for the drives table
 * 
 * @param {number} filteredDrivesCount - Count of filtered drives
 * @param {string} searchTerm - Current search term
 * @param {function} setSearchTerm - Search term setter
 * @param {string} statusFilter - Selected status filter
 * @param {function} setStatusFilter - Status filter setter
 * @param {string} collegeFilter - Selected college filter
 * @param {function} setCollegeFilter - College filter setter
 * @param {array} uniqueColleges - List of unique colleges
 * @param {object} colors - Color palette object
 */
export const DrivesTableHeader = ({ 
  filteredDrivesCount,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  collegeFilter,
  setCollegeFilter,
  uniqueColleges,
  colors 
}) => {
  const statusOptions = [
    'Draft',
    'Live', 
    'GD Completed',
    'PI Completed',
    'Results Released',
    'closed'
  ];

  return (
    <div 
      className="p-6 text-white"
      style={{ backgroundColor: colors.stonewash }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <MapPin size={24} />
          <div>
            <h2 className="text-xl font-bold">Campus Drives Overview</h2>
            <p className="text-sm opacity-90">
              Total: {filteredDrivesCount} drive{filteredDrivesCount !== 1 ? 's' : ''}
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
              placeholder="Search drives..."
              className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60 min-w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backdropFilter: 'blur(10px)' }}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <option value="" className="text-gray-800">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status} className="text-gray-800">
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DrivesTableHeader;
