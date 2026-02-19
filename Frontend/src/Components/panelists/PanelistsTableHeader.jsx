// components/panelists/PanelistsTableHeader.jsx

import { Users, Search } from "lucide-react";

/**
 * PanelistsTableHeader Component
 * Table header with search and filters for the panelists table
 *
 * @param {number} filteredPanelistsCount - Count of filtered panelists
 * @param {string} searchTerm - Current search term
 * @param {function} setSearchTerm - Search term setter
 * @param {string} expertiseFilter - Selected expertise filter
 * @param {function} setExpertiseFilter - Expertise filter setter
 * @param {array} uniqueExpertise - List of unique expertise areas
 * @param {object} colors - Color palette object
 */
export const PanelistsTableHeader = ({
  filteredPanelistsCount,
  searchTerm,
  setSearchTerm,
  expertiseFilter,
  setExpertiseFilter,
  uniqueExpertise,
  colors,
  assignmentFilter,
  setAssignmentFilter
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
            <h2 className="text-xl font-bold">Panelists Overview</h2>
            <p className="text-sm opacity-90">
              Total: {filteredPanelistsCount} panelist
              {filteredPanelistsCount !== 1 ? "s" : ""}
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
              placeholder="Search panelists..."
              className="pl-10 pr-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black placeholder-black placeholder-opacity-70 focus:outline-none focus:bg-opacity-40 focus:border-opacity-60 min-w-50px"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backdropFilter: "blur(10px)" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white opacity-90">
              Job Assignment:
            </label>

            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
             className="px-4 py-2 rounded-lg border-white border-opacity-40 bg-white bg-opacity-30 text-black focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
              style={{ borderColor: colors.softFlow }}
            >
              <option value="all">All</option>
              <option value="assigned">Assigned Jobs</option>
              <option value="unassigned">Unassigned Jobs</option>
            </select>
          </div>

          <select
            className="px-4 py-2 rounded-lg border-2 border-white border-opacity-40 bg-white bg-opacity-30 text-black focus:outline-none focus:bg-opacity-40 focus:border-opacity-60"
            value={expertiseFilter}
            onChange={(e) => setExpertiseFilter(e.target.value)}
            style={{ backdropFilter: "blur(10px)" }}
          >
            <option value="" className="text-gray-800">
              All Expertise
            </option>
            {uniqueExpertise.map((expertise) => (
              <option
                key={expertise}
                value={expertise}
                className="text-gray-800"
              >
                {expertise}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PanelistsTableHeader;
