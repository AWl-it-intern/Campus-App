import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import HrShell from "../../Components/common/HrShell.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useDriveCandidates from "../../hooks/useDriveCandidates";
import { bulkInsertCandidates } from "../../services/candidatesService";
import { resolveRecruitmentFlowTemplate } from "../../utils/recruitmentFlowTemplates";
import { parseCsvCandidates } from "../../utils/csvCandidates";

export default function DriveCandidatesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { driveId, jobId } = useParams();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const jobName = location.state?.JobName || decodeURIComponent(jobId || "") || "Job";
  const collegeName = location.state?.CollegeName || "College";

  const colors = HR_COLORS;

  const {
    loading,
    error,
    filteredCandidates,
    getDriveName,
    splitAssignedJobs,
    reload,
  } = useDriveCandidates({ jobName, driveId });

  const flowTemplate = useMemo(
    () =>
      resolveRecruitmentFlowTemplate({
        driveRefs: [driveId],
        jobName,
      }),
    [driveId, jobName],
  );

  const flowStages = useMemo(
    () =>
      Array.from(
        new Set(
          (flowTemplate?.stages || [])
            .map((stage) => String(stage || "").trim())
            .filter(Boolean),
        ),
      ),
    [flowTemplate],
  );

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const fileText = await file.text();
      const parsedCandidates = parseCsvCandidates(fileText);

      if (parsedCandidates.length === 0) {
        alert("No valid candidate rows found in the file.");
        return;
      }

      const response = await bulkInsertCandidates(parsedCandidates, {
        forceDriveId: driveId,
        forceJobName: jobName,
      });

      if (!response?.success) {
        throw new Error(response?.error || "Import failed");
      }

      reload();
      alert(`Imported ${response.insertedCount || parsedCandidates.length} candidate(s).`);
    } catch (error) {
      alert(error?.response?.data?.error || error?.message || "Failed to import candidates.");
    } finally {
      setImporting(false);
      if (event.target) event.target.value = "";
    }
  };

  const headerActions = (
    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
      style={{ backgroundColor: colors.stonewash }}
    >
      Back
    </button>
  );

  return (
    <HrShell
      title={`Drive ${collegeName} - ${jobName}`}
      subtitle="Candidates mapped to this drive and job combination. Imports here are auto-assigned to this drive and job."
      headerActions={headerActions}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.stonewash }}>
          Assigned Recruitment Flow
        </h3>
        {flowStages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No custom flow assigned to this drive-job. Create one from Recruitment Pipeline.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {flowStages.map((stage, index) => (
              <div key={`${stage}-${index}`} className="inline-flex items-center gap-2">
                <span
                  className="px-3 py-1.5 rounded-full border text-sm font-medium"
                  style={{
                    borderColor: `${colors.rainShadow}55`,
                    backgroundColor: `${colors.softFlow}24`,
                    color: colors.stonewash,
                  }}
                >
                  {stage}
                </span>
                {index < flowStages.length - 1 ? (
                  <span className="text-gray-400 text-sm font-semibold">{"->"}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Candidates List</h2>

          <button
            onClick={handleImportClick}
            className="px-5 py-2 rounded-lg text-white font-semibold shadow hover:opacity-90 transition-all disabled:opacity-70"
            style={{ backgroundColor: colors.stonewash }}
            disabled={importing}
          >
            {importing ? "Importing..." : "Import Candidates"}
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
    </HrShell>
  );
}
