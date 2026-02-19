import { Briefcase, Users, UserCheck } from "lucide-react";

export default function DriveJobBreakdown({ jobRows, colors }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-xl font-bold" style={{ color: colors.stonewash }}>
          Job-wise Candidate and Panelist View
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Candidate count and assigned panelists under this drive
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Job
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Candidate Count
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Assigned Panelists
              </th>
            </tr>
          </thead>
          <tbody>
            {jobRows.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                  No job openings configured for this drive.
                </td>
              </tr>
            ) : (
              jobRows.map((job) => (
                <tr key={job.jobName} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                      <Briefcase size={16} style={{ color: colors.rainShadow }} />
                      <span>{job.jobName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-700">
                      <Users size={16} />
                      <span className="font-semibold">{job.candidateCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {job.panelists.length === 0 ? (
                      <span className="text-sm text-gray-400 italic">
                        No panelist assigned
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {job.panelists.map((panelist) => (
                          <div
                            key={panelist.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium border"
                            style={{
                              backgroundColor: `${colors.goldenHour}25`,
                              borderColor: `${colors.goldenHour}60`,
                              color: colors.stonewash,
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <UserCheck size={12} />
                              <span>{panelist.name}</span>
                            </div>
                            <p className="text-[11px] mt-0.5 text-gray-700">
                              {panelist.designation || panelist.expertise || "Panelist"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
