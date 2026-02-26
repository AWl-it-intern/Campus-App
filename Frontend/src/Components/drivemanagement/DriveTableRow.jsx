import { Pencil } from "lucide-react";

export default function DriveTableRow({ drive, deleteDrive, colors, onRowClick, onEdit }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <span
          className="px-3 py-1 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: colors.rainShadow + "20", color: colors.rainShadow }}
        >
          {drive.DriveID}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{drive.CollegeName}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{drive.StartDate}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{drive.EndDate}</td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {(drive.JobsOpening || []).join(", ") || "-"}
      </td>
      <td className="px-6 py-4 text-sm">
        <span
          className="px-2 py-1 rounded-lg text-xs font-semibold"
          style={{ backgroundColor: colors.softFlow + "30", color: colors.stonewash }}
        >
          {drive.Status || "Draft"}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
        {drive.NumberOfCandidates ?? 0}
      </td>
      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
        {drive.Selected ?? 0}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onRowClick?.(drive)}
            className="px-3 py-1 rounded-lg text-sm text-white"
            style={{ backgroundColor: colors.mossRock }}
          >
            View
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(drive);
            }}
            className="px-3 py-1 rounded-lg text-sm text-white"
            style={{ backgroundColor: colors.rainShadow }}
          >
            <span className="inline-flex items-center gap-1">
              <Pencil size={14} /> Edit
            </span>
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              deleteDrive(drive);
            }}
            className="px-3 py-1 rounded-lg text-sm text-white"
            style={{ backgroundColor: "#F87171" }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
