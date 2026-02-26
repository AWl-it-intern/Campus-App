import { useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Feature-specific components
import {
  UserFormCard,
  UsersTableHeader,
  UserTableRow,
} from "../../Components/users/index.js";

// Reusable modal for assigning jobs
import AssignJobModal from "../../Components/users/AssignJobModal.jsx"; // <-- adjust path if needed

// Common
import EmptyState from "../../Components/common/EmptyState.jsx";


export default function CreateUsers({ drives: drivesProp = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDrives = location.state?.fromDrives || false;
  const fileInputRef = useRef(null);

  // Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
  };

  // ---------------------- Data state ----------------------
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState(drivesProp || []);

  // ---------------------- UI state ------------------------
  const [importing, setImporting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    college: "",
    AssignedJobs: [], // <-- array from day one
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");

  // Assign Job modal state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignCtx, setAssignCtx] = useState({
    candidateId: null,
    filterKeys: [], // from the candidate's drive JobsOpening
    filterBy: "JobName", // "JobName" today; switch to "JobID" if you store JobIDs in Drives.JobsOpening
  });

  // ---------------------- Fetchers ------------------------
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`/print-candidates?limit=5000`); // add api baase here 
      const fetchedCandidates = (res.data.data || []).map((c) => {
        // STRICT: only use AssignedJobs array; do not derive from AssignedJob
        const AssignedJobs = Array.isArray(c.AssignedJobs)
          ? c.AssignedJobs.filter(Boolean).map(String)
          : [];
        return { ...c, AssignedJobs };
      });
      setCandidates(fetchedCandidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobsRes = await axios.get(`/print-jobs?limit=5000`); // add api baase here 
      const jobsData = (jobsRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));
      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    }
  };

  const fetchDrives = async () => {
    try {
      const drivesRes = await axios.get(`/print-drives?limit=5000`); // add api baase here 
      const drivesData = (drivesRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        JobsOpening: Array.isArray(doc.JobsOpening) ? doc.JobsOpening : [],
      }));
      setDrives(drivesData);
    } catch (err) {
      console.error("Error fetching drives:", err);
      // keep whatever came from props as a fallback
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchCandidates();
    fetchJobs();
    fetchDrives();
  }, []);

  // ---------------------- Create / Delete -----------------
  const createCandidate = async () => {
    if (!newUser.name || !newUser.email || !newUser.college) {
      alert("Please fill in Name, Email, and College fields");
      return;
    }

    try {
      // Ensure AssignedJobs is an array in the payload
      const payload = {
        ...newUser,
        AssignedJobs: Array.isArray(newUser.AssignedJobs)
          ? newUser.AssignedJobs
          : [],
      };

      await axios.post(`/candidate`, payload); // add api baase here 
      await fetchCandidates();

      alert("New Candidate Inserted Successfully!");
      setNewUser({
        name: "",
        email: "",
        college: "",
        AssignedJobs: [], // reset to empty array
      });
    } catch (err) {
      console.error("Error creating candidate:", err);
      alert("Failed to create candidate");
    }
  };

  const deleteCandidate = async (candidateId) => {
    try {
      await axios.delete(`/candidate/${candidateId}`); // add api baase here 

      setCandidates((prev) => prev.filter((c) => c._id !== candidateId));
      alert("Candidate Deleted Successfully!");
    } catch (err) {
      console.error("Error deleting candidate:", err);
      alert("Failed to delete candidate");
    }
  };

  // ---------------------- Assign Job (Modal) --------------
  // Open the modal with a filtered list based on the candidate's assigned drive
  const onOpenAssign = (candidate) => {
    const candidateDriveId = String(candidate.driveId || "");
    const driveMap = drivesMap; // from useMemo below
    const drive = driveMap[candidateDriveId];

    const filterKeys = Array.isArray(drive?.JobsOpening)
      ? drive.JobsOpening
      : [];

    setAssignCtx({
      candidateId: candidate._id,
      filterKeys,
      filterBy: "JobName", // if later Drives.JobsOpening holds JobIDs, change to "JobID"
    });

    setIsAssignOpen(true);
  };

  // After success from modal → optimistic update
  const  handleAssigned = async ({ jobs, candidateId }) => {
    // Convert selected job objects to strings to store in client state
    const names = (jobs || [])
      .map((j) => String(j?.[assignCtx.filterBy] ?? ""))
      .filter(Boolean);

    setCandidates((prev) =>
      prev.map((c) =>
        c._id === candidateId
          ? {
              ...c,
              // Store an array in client state to match the row’s expectation
              AssignedJobs: names,
            }
          : c,
      ),
    );
    await fetchCandidates();
  };

  // ---------------------- Filters & helpers ----------------
  const uniqueColleges = useMemo(
    () =>
      [...new Set(candidates.map((c) => c.college).filter(Boolean))].sort(),
    [candidates],
  );

  const uniqueJobs = useMemo(() => {
    const flat = candidates.flatMap((c) =>
      Array.isArray(c.AssignedJobs) ? c.AssignedJobs : [],
    );
    return [...new Set(flat.filter(Boolean).map(String))].sort();
  }, [candidates]);

  // Fast lookup: driveId -> drive doc
  const drivesMap = useMemo(() => {
    return Object.fromEntries(
      (drives || []).map((d) => [
        String(d._id || d.id || d.DriveID || ""),
        d,
      ]),
    );
  }, [drives]);

  const getDriveName = (driveId) => {
    const drive = drivesMap[String(driveId || "")];
    if (!drive) return null;

    const driveCode = drive.DriveID || drive.driveId || "";
    const collegeName = drive.CollegeName || drive.collegeName || "";
    return `${driveCode} - ${collegeName}`.trim();
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    const name = String(candidate.name || "").toLowerCase();
    const email = String(candidate.email || "").toLowerCase();
    const college = String(candidate.college || "").toLowerCase();

    const matchesSearch =
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      college.includes(searchLower);

    const matchesCollege =
      collegeFilter === "" || college === collegeFilter.toLowerCase();

    // Array-based job filter (exact, case-insensitive match on any item)
    const jobsArr = Array.isArray(candidate.AssignedJobs)
      ? candidate.AssignedJobs.map((s) => String(s).toLowerCase())
      : [];

    const matchesJob =
      jobFilter === "" || jobsArr.includes(jobFilter.toLowerCase());

    return matchesSearch && matchesCollege && matchesJob;
  });

  // ---------------------- CSV import / export --------------
  const parseCsvLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const readIndex = (headers, keys) =>
    headers.findIndex((header) => keys.includes(header));

  const readValue = (row, index) =>
    index === -1 ? "" : String(row[index] || "").trim();

  // Parse "AssignedJobs" (array). Supports JSON array or delimited string ("HR;Finance" or "HR,Finance").
  const parseAssignedJobsCell = (raw) => {
    if (!raw) return [];
    const text = String(raw).trim();
    // Try JSON array
    if (text.startsWith("[") && text.endsWith("]")) {
      try {
        const arr = JSON.parse(text);
        return Array.isArray(arr)
          ? arr.filter(Boolean).map(String)
          : [];
      } catch {
        // fallthrough to delimiter-based parsing
      }
    }
    // Fallback: split by semicolon first, then comma
    const delim = text.includes(";") ? ";" : ",";
    return text
      .split(delim)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parseCsvCandidates = (text) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV file must include a header and at least one row");
    }

    const headers = parseCsvLine(lines[0])
      .map((h) => h.replace(/^\uFEFF/, "").trim().toLowerCase());

    const nameIdx = readIndex(headers, ["name", "full name", "candidate name"]);
    const emailIdx = readIndex(headers, ["email", "email address", "mail"]);
    const collegeIdx = readIndex(headers, ["college", "college name", "university"]);
    const assignedJobsIdx = readIndex(headers, ["assignedjobs", "assigned jobs"]); // <-- new
    const driveIdIdx = readIndex(headers, ["driveid", "drive id", "assigneddriveid", "assigned drive id"]);

    const candidatesPayload = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);

      const name = readValue(values, nameIdx);
      const email = readValue(values, emailIdx);
      const college = readValue(values, collegeIdx);
      const driveId = readValue(values, driveIdIdx);
      const assignedJobsRaw = readValue(values, assignedJobsIdx);

      return {
        name,
        email,
        college,
        AssignedJobs: parseAssignedJobsCell(assignedJobsRaw), // always array
        driveId,
      };
    });

    return candidatesPayload.filter((candidate) => candidate.email);
  };

  const formatCsvCell = (value) =>
    `"${String(value ?? "")
      .replaceAll('"', '""')
      .replaceAll("\n", " ")}"`;

  const exportCandidatesToCsv = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available to export.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "College",
      "AssignedJobs", // array column
      "DriveID",
      "CreatedAt",
    ];

    const rows = filteredCandidates.map((candidate) => [
      candidate.name || "",
      candidate.email || "",
      candidate.college || "",
      // serialize as JSON array for round-tripping
      JSON.stringify(
        Array.isArray(candidate.AssignedJobs) ? candidate.AssignedJobs : []
      ),
      candidate.driveId || candidate.DriveID || "",
      candidate.createdAt
        ? new Date(candidate.createdAt).toLocaleString("en-IN")
        : "",
    ]);

    const csvString = [headers, ...rows]
      .map((row) => row.map(formatCsvCell).join(","))
      .join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const fileDate = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `candidates_${fileDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (event) => {
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

      const response = await axios.post(`/candidate/bulk`, {      // add api baase here 
        candidates: parsedCandidates,
      });

      if (response.data.success) {
        await fetchCandidates();
        alert(
          `Imported ${
            response.data.insertedCount || parsedCandidates.length
          } candidate(s) successfully.`,
        );
      } else {
        alert("Import failed: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error importing candidates:", error);
      alert(error?.response?.data?.error || "Failed to import candidates.");
    } finally {
      setImporting(false);
      if (event.target) event.target.value = "";
    }
  };

  // ---------------------- Render --------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(fromDrives ? "/HR/dashboard/Drives" : "/HR/dashboard")
          }
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
          ← Back to {fromDrives ? "Drive Management" : "Dashboard"}
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.stonewash }}
          >
            Manage Candidates
          </h1>
          <p className="text-gray-600">Create and manage candidate profiles</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileChange}
        />

        {/* Create User Form */}
        <div className="relative">
          <UserFormCard
            newUser={newUser}
            setNewUser={setNewUser}
            createCandidate={createCandidate}
            onImportClick={onImportClick}
            importing={importing}
            colors={colors}
            // (Removed job-related props; the form no longer shows Assign Jobs)
          />
        </div>

        {/* Candidates Overview Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ">
          {/* Table Header */}
          <UsersTableHeader
            filteredCandidates={filteredCandidates.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            collegeFilter={collegeFilter}
            setCollegeFilter={setCollegeFilter}
            jobFilter={jobFilter}
            setJobFilter={setJobFilter}
            uniqueColleges={uniqueColleges}
            uniqueJobs={uniqueJobs}
            onExportCsv={exportCandidatesToCsv}
            colors={colors}
          />

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
                    Assigned Jobs
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12">
                      <EmptyState
                        icon={Users}
                        title="No candidates found"
                        message="Try adjusting your filters or create a new candidate"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <UserTableRow
                      key={candidate._id}
                      candidate={candidate}
                      getDriveName={getDriveName}
                      colors={colors}
                      deleteCandidate={deleteCandidate}
                      onOpenAssign={onOpenAssign} // <-- open modal from row
                    />
                  ))
                )}
              </tbody>
            </table>

            {/* Assign Job Modal (global, controlled here) */}
            <AssignJobModal
              isOpen={isAssignOpen}
              onClose={() => setIsAssignOpen(false)}
              candidateId={assignCtx.candidateId}
              allJobs={jobs}
              filterKeys={assignCtx.filterKeys}
              filterBy={assignCtx.filterBy}
              onAssigned={handleAssigned}
            />
          </div>
        </div>
      </div>
    </div>
  );
}