// components/drivemanagement/DriveTableRow.jsx
import { MapPin, Calendar, Trash2 } from "lucide-react";

/**
 * DriveTableRow Component
 * Single row in the drives table (MongoDB schema aligned)
 *
 * @param {object} drive - Drive data object
 * @param {function} deleteDrive - Delete drive function
 * @param {object} colors - Color palette object
 * @param {function} onRowClick - Row click callback
 */
export const DriveTableRow = ({ drive, deleteDrive, colors, onRowClick }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { bg: colors.clayPot + "40", text: colors.stonewash },
      Live: { bg: colors.mossRock + "40", text: colors.stonewash },
      Closed: { bg: "#E5E7EB", text: "#6B7280" },
    };

    const normalizedStatus =
      typeof status === "string" ? status.trim() : "Draft";
    const config = statusConfig[normalizedStatus] || statusConfig.Draft;

    return (
      <span
        className="px-3 py-1 rounded-lg text-xs font-medium"
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        {normalizedStatus}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const jobsOpening = Array.isArray(drive.JobsOpening) ? drive.JobsOpening : [];

  return (
    <tr
      className={`border-b border-gray-200 transition-colors ${
        onRowClick ? "hover:bg-gray-50 cursor-pointer" : "hover:bg-gray-50"
      }`}
      onClick={() => onRowClick?.(drive)}
    >
      <td className="px-6 py-4">
        <span
          className="px-3 py-1 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: colors.rainShadow + "20",
            color: colors.rainShadow,
          }}
        >
          {drive.DriveID}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} style={{ color: colors.mossRock }} />
          <span className="font-semibold text-gray-800">{drive.CollegeName}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={16} className="text-gray-400" />
          {formatDate(drive.StartDate)}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={16} className="text-gray-400" />
          {formatDate(drive.EndDate)}
        </div>
      </td>

      <td className="px-6 py-4">
        {jobsOpening.length === 0 ? (
          <span className="text-sm text-gray-400 italic">No jobs</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {jobsOpening.map((jobName) => (
              <span
                key={`${drive.DriveID}-${jobName}`}
                className="px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: colors.softFlow + "20",
                  color: colors.stonewash,
                }}
              >
                {jobName}
              </span>
            ))}
          </div>
        )}
      </td>

      <td className="px-6 py-4">{getStatusBadge(drive.Status)}</td>

      <td className="px-6 py-4 text-center">
        <span className="font-semibold text-gray-800">
          {Number(drive.NumberOfCandidates) || 0}
        </span>
      </td>

      <td className="px-6 py-4 text-center">
        <span className="font-semibold" style={{ color: colors.mossRock }}>
          {Number(drive.Selected) || 0}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center justify-center">
          <button
            onClick={(event) => {
              event.stopPropagation();
              deleteDrive(drive);
            }}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            title="Delete Drive"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DriveTableRow;
