import { useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import HR_COLORS from "../../theme/hrPalette";
import useDriveCandidates from "../../hooks/useDriveCandidates";

export default function DriveCandidatesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { driveId, jobId } = useParams();
  const fileInputRef = useRef(null);

  const jobName = location.state?.JobName || decodeURIComponent(jobId || "") || "Job";
  const collegeName = location.state?.CollegeName || "College";

  const colors = HR_COLORS;

  const {
    loading,
    error,
    filteredCandidates,
    getDriveName,
    splitAssignedJobs,
  } = useDriveCandidates({ jobName, driveId });

  const handleImportClick = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: colors.stonewash }}
        >
           Back
        </button>

        <h1
          className="text-3xl font-bold mb-6"
          style={{ color: colors.stonewash }}
        >
          Drive {collegeName} {jobName} Candidates
        </h1>

        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Candidates List</h2>

            <button
              onClick={handleImportClick}
              className="px-5 py-2 rounded-lg text-white font-semibold shadow hover:opacity-90 transition-all"
              style={{ backgroundColor: colors.stonewash }}
            >
              Import Candidates
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    College
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Assigned Drive
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Assigned Job(s)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      Loading candidates...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      No candidates available
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const jobsDisplay = splitAssignedJobs(candidate).join(", ");
                    return (
                      <tr key={candidate._id} className="border-b last:border-b-0">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {candidate.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {candidate.college || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {candidate.email || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {getDriveName(candidate.driveId || candidate.DriveID) || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {jobsDisplay || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <button
                            className="px-3 py-1 rounded-md text-white"
                            style={{ backgroundColor: colors.stonewash }}
                            onClick={() =>
                              alert(`Candidate: ${candidate.name || candidate.email}`)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
