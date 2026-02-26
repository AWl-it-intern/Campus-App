import { Briefcase, Trash2, Users } from "lucide-react";

export const JobTableRow = ({
  job,
  deleteJob,
  colors,
  recentCandidates = [],
  onRowClick,
}) => {
  const assignedCandidates = job.assignedCandidates || [];

  const handleDelete = (event) => {
    event.stopPropagation();
    deleteJob(job);
  };

  return (
    <tr
      className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onRowClick?.(job)}
    >
      <td className="px-6 py-4">
        <span
          className="px-3 py-1 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: colors.rainShadow + "20",
            color: colors.rainShadow,
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users size={16} className="text-gray-400" />
            {assignedCandidates.length === 0 ? (
              <span className="text-gray-400 text-sm italic">No candidates assigned</span>
            ) : (
              <span>
                {assignedCandidates.length} candidate{assignedCandidates.length !== 1 ? "s" : ""} assigned
              </span>
            )}
          </div>
          {recentCandidates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recentCandidates.map((candidate) => (
                <span
                  key={candidate._id}
                  className="px-2 py-1 rounded-lg text-xs font-medium border"
                  style={{
                    backgroundColor: colors.softFlow + "20",
                    borderColor: colors.softFlow,
                    color: colors.stonewash,
                  }}
                >
                  {candidate.name || candidate.email || "Candidate"}
                </span>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleDelete}
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
