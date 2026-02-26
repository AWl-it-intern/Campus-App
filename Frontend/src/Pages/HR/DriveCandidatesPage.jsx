import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function DriveCandidatesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Values passed from parent navigation
  const collegeName = location.state?.CollegeName || "College";
  const jobName = location.state?.JobName || "Job";

  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [drives, setDrives] = useState([]);

  // --- helpers ---
  const safeLower = (v) => String(v || "").trim().toLowerCase();

  // Split AssignedJob string into an array. Supports comma/semicolon separation.
  const splitAssignedJobs = (assignedJob) => {
    const text = String(assignedJob || "").trim();
    if (!text) return [];
    // Prefer semicolon as higher precedence if present; otherwise comma
    const delim = text.includes(";") ? ";" : ",";
    return text
      .split(delim)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // --- data fetch ---
  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        const [candRes, drivesRes] = await Promise.all([
          axios.get(`/print-candidates`, {
            // We’ll filter on client because backend only has AssignedJob string
            params: { limit: 5000 },
          }),
          axios.get(`/print-drives`, { params: { limit: 5000 } }),
        ]);

        if (!isMounted) return;

        const fetchedCandidates = Array.isArray(candRes.data?.data)
          ? candRes.data.data
          : [];

        const drivesData = (drivesRes.data?.data || []).map((doc) => ({
          ...doc,
          id: doc._id,
          JobsOpening: Array.isArray(doc.JobsOpening) ? doc.JobsOpening : [],
        }));

        setCandidates(fetchedCandidates);
        setDrives(drivesData);
      } catch (e) {
        if (!isMounted) return;
        console.error("Failed to fetch candidates/drives:", e);
        setError(e?.response?.data?.error || "Failed to load data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [jobName, collegeName]);

  // --- drives lookup for "Assigned Drive" column ---
  const drivesMap = useMemo(() => {
    return Object.fromEntries(
      (drives || []).map((d) => [String(d._id || d.id || d.DriveID || ""), d])
    );
  }, [drives]);

  const getDriveName = (driveId) => {
    const drive = drivesMap[String(driveId || "")];
    if (!drive) return "";
    const driveCode = drive.DriveID || drive.driveId || "";
    const college = drive.CollegeName || drive.collegeName || "";
    return [driveCode, college].filter(Boolean).join(" - ");
  };

  // --- filter by parent job (and optional college) ---
  const filteredCandidates = useMemo(() => {
    const jobLower = safeLower(jobName);
    const collegeLower = safeLower(collegeName);

    if (!jobLower || jobName === "Job") return []; // no valid job passed

    return candidates.filter((c) => {
      // AssignedJob is a single string; split to array for matching
      const jobs = splitAssignedJobs(c.AssignedJob).map((j) => safeLower(j));
      const hasJob = jobs.includes(jobLower);

      // Only enforce college if a real CollegeName (not the placeholder) was passed
      const enforceCollege =
        collegeName && collegeName !== "College" && collegeLower.length > 0;

      const collegeMatches = enforceCollege
        ? safeLower(c.college) === collegeLower
        : true;

      return hasJob && collegeMatches;
    });
  }, [candidates, jobName, collegeName]);

  const handleImportClick = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: colors.stonewash }}
        >
          ← Back
        </button>

        {/* Title */}
        <h1
          className="text-3xl font-bold mb-6"
          style={{ color: colors.stonewash }}
        >
          Drive {collegeName} {jobName} Candidates
        </h1>

        {/* Hidden File Input */}
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Top Bar with Import Button */}
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Candidates List
            </h2>

            <button
              onClick={handleImportClick}
              className="px-5 py-2 rounded-lg text-white font-semibold shadow hover:opacity-90 transition-all"
              style={{ backgroundColor: colors.stonewash }}
            >
              Import Candidates
            </button>
          </div>

          {/* Table */}
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
                      Loading candidates…
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
                  filteredCandidates.map((c) => {
                    const jobsDisplay = splitAssignedJobs(c.AssignedJob).join(", ");
                    return (
                      <tr key={c._id} className="border-b last:border-b-0">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {c.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {c.college || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {c.email || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {getDriveName(c.driveId || c.DriveID) || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {jobsDisplay || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <button
                            className="px-3 py-1 rounded-md text-white"
                            style={{ backgroundColor: colors.stonewash }}
                            onClick={() =>
                              alert(`Candidate: ${c.name || c.email}`)
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