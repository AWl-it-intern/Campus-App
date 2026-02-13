// components/jobs/JobTableRow.jsx
import React from 'react';
import { Briefcase, UserCheck, Trash2 } from 'lucide-react';

/**
 * JobTableRow Component
 * Single row in the jobs table
 * 
 * @param {object} job - Job data object
 * @param {function} getCandidateInfo - Get candidate info by ID
 * @param {function} getCandidateName - Get candidate name by ID
 * @param {function} getAvatarColor - Get avatar color by ID
 * @param {function} openAssignModal - Open assignment modal
 * @param {function} deleteJob - Delete job function
 * @param {object} colors - Color palette object
 */
export const JobTableRow = ({ 
  job, 
  getCandidateInfo, 
  getCandidateName,
  getAvatarColor,
  openAssignModal,
  deleteJob,
  colors 
}) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <span 
          className="px-3 py-1 rounded-lg text-sm font-semibold"
          style={{ 
            backgroundColor: colors.rainShadow + '20',
            color: colors.rainShadow
          }}
        >
          {job.JobID}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Briefcase size={18} style={{ color: colors.mossRock }} />
          <span className="font-semibold text-gray-800">{job.JobName}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {job.assignedCandidates.length === 0 ? (
            <span className="text-gray-400 text-sm italic">No candidates assigned</span>
          ) : (
            <>
              <div className="flex -space-x-2">
                {job.assignedCandidates.slice(0, 3).map((candidateId) => {
                  const candidate = getCandidateInfo(candidateId);
                  const initials = candidate 
                    ? candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : '?';
                  
                  return (
                    <div
                      key={candidateId}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-xs border-2 border-white"
                      style={{ backgroundColor: getAvatarColor(candidateId) }}
                      title={getCandidateName(candidateId)}
                    >
                      {initials}
                    </div>
                  );
                })}
                {job.assignedCandidates.length > 3 && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-xs border-2 border-white"
                    style={{ backgroundColor: colors.stonewash }}
                  >
                    +{job.assignedCandidates.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {job.assignedCandidates.length} candidate{job.assignedCandidates.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => openAssignModal(job)}
            className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: colors.mossRock }}
          >
            <div className="flex items-center gap-2">
              <UserCheck size={16} />
              <span>Assign</span>
            </div>
          </button>
          <button
            onClick={() => deleteJob(job)}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            title="Delete Job"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default JobTableRow;
