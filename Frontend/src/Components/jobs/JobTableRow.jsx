// components/jobs/JobTableRow.jsx
import { Briefcase, Trash2 } from 'lucide-react';

/**
 * JobTableRow Component
 * Single row in the jobs table
 * 
 * @param {object} job - Job data object
 * @param {function} deleteJob - Delete job function
 * @param {object} colors - Color palette object
 */
export const JobTableRow = ({ 
  job, 
  deleteJob,
  colors 
}) => {
  const assignedCandidates = job.assignedCandidates || [];

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
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {assignedCandidates.length === 0 ? (
            <span className="text-gray-400 text-sm italic">No candidates assigned</span>
          ) : (
            <span>
              {assignedCandidates.length} candidate{assignedCandidates.length !== 1 ? 's' : ''} assigned
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
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
