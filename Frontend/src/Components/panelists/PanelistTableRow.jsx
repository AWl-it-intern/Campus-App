// components/panelists/PanelistTableRow.jsx
import React from 'react';
import { Building2, UserCheck, Calendar, Trash2, Briefcase } from 'lucide-react';

/**
 * PanelistTableRow Component
 * Single row in the panelists table
 * 
 * @param {object} panelist - Panelist data object
 * @param {function} openAssignModal - Open assignment modal
 * @param {function} openScheduleModal - Open schedule modal
 * @param {function} deletePanelist - Delete panelist function
 * @param {object} colors - Color palette object
 */
export const PanelistTableRow = ({ 
  panelist, 
  openAssignModal,
  openScheduleModal,
  deletePanelist,
  colors 
}) => {
  const assignedJobs = Array.isArray(panelist.assignedJobs)
    ? panelist.assignedJobs
    : [];

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white shrink-0"
            style={{ backgroundColor: colors.softFlow }}
          >
            {panelist.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{panelist.name}</p>
            <p className="text-sm text-gray-600">{panelist.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Building2 size={16} className="text-gray-400" />
          {panelist.designation}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className="px-3 py-1 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: colors.goldenHour + "30",
            color: colors.stonewash,
          }}
        >
          {panelist.expertise}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {assignedJobs.length === 0 ? (
            <span className="text-gray-400 text-sm italic">No jobs assigned</span>
          ) : (
            <>
              <div className="flex flex-wrap gap-1">
                {assignedJobs.slice(0, 3).map((jobName) => (
                  <span
                    key={jobName}
                    className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                    style={{
                      backgroundColor: colors.softFlow + "20",
                      color: colors.stonewash,
                    }}
                    title={jobName}
                  >
                    <Briefcase size={12} />
                    {jobName}
                  </span>
                ))}
                {assignedJobs.length > 3 && (
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: colors.stonewash,
                      color: "white",
                    }}
                  >
                    +{assignedJobs.length - 3}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {assignedJobs.length} job{assignedJobs.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAssignModal(panelist)}
            className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: colors.softFlow }}
          >
            <div className="flex items-center gap-2">
              <UserCheck size={16} />
              <span>Assign</span>
            </div>
          </button>
          <button
            onClick={() => openScheduleModal(panelist)}
            className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: colors.marigoldFlame }}
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Schedule</span>
            </div>
          </button>
          <button
            onClick={() => deletePanelist(panelist)}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            title="Delete Panelist"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PanelistTableRow;
