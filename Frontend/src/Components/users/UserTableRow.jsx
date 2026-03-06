import { Building2, Mail, Briefcase, MapPin, Pencil } from "lucide-react";

export const UserTableRow = ({
  candidate,
  candidateKey,
  isSelected = false,
  onToggleSelect,
  getDriveName,
  colors,
  onEdit,
}) => {
  const jobList = Array.isArray(candidate.AssignedJobs)
    ? candidate.AssignedJobs.filter(Boolean).map(String)
    : [];

  const hasMultipleJobs = jobList.length > 1;
  const driveName = getDriveName ? getDriveName(candidate.driveId || candidate.DriveID) : null;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect?.(candidateKey)}
        />
      </td>

      <td className="px-6 py-4 text-sm text-gray-700 font-mono">
        {candidate.CandidateID || "-"}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white shrink-0"
            style={{ backgroundColor: colors.softFlow }}
          >
            {String(candidate.name || "")
              .split(" ")
              .map((n) => n?.[0] || "")
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{candidate.name}</p>
            {hasMultipleJobs && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: colors.marigoldFlame + "20",
                  color: colors.marigoldFlame,
                }}
              >
                {jobList.length} jobs
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Building2 size={16} className="text-gray-400" />
          {candidate.college}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Mail size={16} className="text-gray-400" />
          {candidate.email}
        </div>
      </td>

      <td className="px-6 py-4">
        {driveName ? (
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: colors.rainShadow }} />
            <span className="text-sm font-medium" style={{ color: colors.rainShadow }}>
              {driveName}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm italic">Not assigned</span>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {jobList.length === 0 ? (
            <span className="text-gray-400 text-sm italic">Not assigned</span>
          ) : (
            jobList.map((job, idx) => (
              <span
                key={`${job}-${idx}`}
                className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                style={{ backgroundColor: colors.clayPot + "60", color: colors.stonewash }}
              >
                <Briefcase size={12} />
                {job}
              </span>
            ))
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <button
          onClick={() => onEdit?.(candidate)}
          className="px-3 py-1 rounded-lg text-sm text-white transition cursor-pointer"
          style={{ backgroundColor: colors.rainShadow }}
        >
          <span className="inline-flex items-center gap-1">
            <Pencil size={14} /> Edit
          </span>
        </button>
      </td>
    </tr>
  );
};

export default UserTableRow;
