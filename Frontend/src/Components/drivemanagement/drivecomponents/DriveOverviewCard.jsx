import { CalendarDays, Building2, Hash, Activity } from "lucide-react";

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

export default function DriveOverviewCard({ drive, colors }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.stonewash }}>
            {drive.DriveID}
          </h2>
          <p className="text-gray-600 mt-1">{drive.CollegeName}</p>
        </div>
        <span
          className="px-4 py-1 rounded-full text-sm font-semibold"
          style={{
            backgroundColor:
              String(drive.Status || "").toLowerCase() === "live"
                ? `${colors.mossRock}25`
                : `${colors.clayPot}50`,
            color: colors.stonewash,
          }}
        >
          {drive.Status || "Draft"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">Drive ID</p>
          <p className="font-semibold text-gray-800 flex items-center gap-2">
            <Hash size={16} />
            {drive.DriveID || "-"}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">College</p>
          <p className="font-semibold text-gray-800 flex items-center gap-2">
            <Building2 size={16} />
            {drive.CollegeName || "-"}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">Start Date</p>
          <p className="font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays size={16} />
            {formatDate(drive.StartDate)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">End Date</p>
          <p className="font-semibold text-gray-800 flex items-center gap-2">
            <Activity size={16} />
            {formatDate(drive.EndDate)}
          </p>
        </div>
      </div>
    </section>
  );
}
