/**
 * File Type: UI/UX Component
 * Business Logic File Used: ./useAptitudeTestManagement.js
 * Fields Used: dispatchLog
 * Input Type: { dispatchLog: AptitudeDispatchRow[], colors: HrPalette }
 * Output Type: ReactElement
 */
import { CheckCircle2, Link2 } from "lucide-react";

import EmptyState from "../../../Components/common/EmptyState.jsx";

export default function AptitudeListView({ dispatchLog, colors }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.stonewash }}>
          Ongoing Aptitude Dispatches
        </h3>
        <span className="text-sm text-gray-600">{dispatchLog.length} tracked</span>
      </div>

      {dispatchLog.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={Link2}
            title="No aptitude dispatch records"
            message="Dispatch aptitude links from the Aptitude Dispatch tab to start tracking."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aptitude ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Candidate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Drive</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Job ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Job</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sent At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {dispatchLog.map((entry) => (
                <tr key={`${entry.aptitudeId}-${entry.candidateKey}-${entry.sentAt}`} className="border-t border-gray-100">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{entry.aptitudeId || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700"><p className="font-medium">{entry.candidateName || "-"}</p><p className="text-xs text-gray-500">{entry.candidateId || "-"}</p></td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.driveLabel || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.jobId || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.jobName || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.sentAt ? new Date(entry.sentAt).toLocaleString("en-IN") : "-"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={12} />
                      {entry.status || "Queued"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
