import { useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Import feature-specific components
import {
  UserFormCard,
  UsersTableHeader,
  UserTableRow,
} from "../../Components/users/index.js";

// Import common components
import EmptyState from "../../Components/common/EmptyState.jsx";

const API_BASE = "http://localhost:5000";

export default function CreateUsers({ drives = [] }) {
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

  const [candidates, setCandidates] = useState([]);
  const [importing, setImporting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    college: "",
    AssignedJob: "",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");

  /* ---------------- Insert Functions ---------------- */

  const createCandidate = async () => {
    if (!newUser.name || !newUser.email || !newUser.college) {
      alert("Please fill in Name, Email, and College fields");
      return;
    }

    try {
      await axios.post(`${API_BASE}/candidate`, newUser);
      await fetchCandidates();

      alert("New Candidate Inserted Successfully!");
      setNewUser({
        name: "",
        email: "",
        college: "",
        AssignedJob: "",
      });
    } catch (err) {
      console.error("Error creating candidate:", err);
      alert("Failed to create candidate");
    }
  };

  // ---------------------------Delete func---------------
  const deleteCandidate = async (candidateId) => {
    try {
      await axios.delete(`${API_BASE}/candidate/${candidateId}`);

      setCandidates((prev) =>
        prev.filter((candidate) => candidate._id !== candidateId),
      );

      alert("Candidate Deleted Successfully!");
    } catch (err) {
      console.error("Error deleting candidate:", err);
      alert("Failed to delete candidate");
    }
  };


  /* ---------------- Fetch Functions ---------------- */

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/print-candidates?limit=5000`);
      const fetchedCandidates = res.data.data || [];
      setCandidates(fetchedCandidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchCandidates();
  }, []);


  /* ---------------- Filter Logic ---------------- */

  const uniqueColleges = useMemo(() => {
    return [...new Set(candidates.map((c) => c.college).filter(Boolean))].sort();
  }, [candidates]);

  const uniqueJobs = useMemo(() => {
    return [
      ...new Set(candidates.map((c) => c.AssignedJob).filter(Boolean)),
    ].sort();
  }, [candidates]);

  // Helper functions for drive and panelist
  const getDriveName = (driveId) => {
    const drive = drives.find(
      (d) =>
        d.driveId === driveId ||
        d.DriveID === driveId ||
        d.id === driveId ||
        d._id === driveId,
    );

    if (!drive) return null;

    const driveCode = drive.DriveID || drive.driveId;
    const collegeName = drive.CollegeName || drive.collegeName;
    return `${driveCode} - ${collegeName}`;
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    const name = String(candidate.name || "").toLowerCase();
    const email = String(candidate.email || "").toLowerCase();
    const college = String(candidate.college || "").toLowerCase();
    const assignedJob = String(candidate.AssignedJob || "");

    const matchesSearch =
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      college.includes(searchLower);

    const matchesCollege =
      collegeFilter === "" || college === collegeFilter.toLowerCase();

    const matchesJob =
      jobFilter === "" || assignedJob.toLowerCase() === jobFilter.toLowerCase();

    return matchesSearch && matchesCollege && matchesJob;
  });

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

  const readValue = (row, headers, keys) => {
    const index = headers.findIndex((header) => keys.includes(header));
    return index === -1 ? "" : String(row[index] || "").trim();
  };

  const parseCsvCandidates = (text) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV file must include a header and at least one row");
    }

    const headers = parseCsvLine(lines[0]).map((h) =>
      h.replace(/^\uFEFF/, "").trim().toLowerCase(),
    );

    const candidatesPayload = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      return {
        name: readValue(values, headers, ["name", "full name", "candidate name"]),
        email: readValue(values, headers, ["email", "email address", "mail"]),
        college: readValue(values, headers, ["college", "college name", "university"]),
        AssignedJob: readValue(values, headers, [
          "assignedjob",
          "assigned job",
          "job",
          "job name",
        ]),
        driveId: readValue(values, headers, [
          "driveid",
          "drive id",
          "assigneddriveid",
          "assigned drive id",
        ]),
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
      "AssignedJob",
      "DriveID",
      "CreatedAt",
    ];

    const rows = filteredCandidates.map((candidate) => [
      candidate.name || "",
      candidate.email || "",
      candidate.college || "",
      candidate.AssignedJob || "",
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

      const response = await axios.post(`${API_BASE}/candidate/bulk`, {
        candidates: parsedCandidates,
      });

      if (response.data.success) {
        await fetchCandidates();
        alert(
          `Imported ${response.data.insertedCount || parsedCandidates.length} candidate(s) successfully.`,
        );
      } else {
        alert("Import failed: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error importing candidates:", error);
      alert(error?.response?.data?.error || "Failed to import candidates.");
    } finally {
      setImporting(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(
              fromDrives ? "/HR/dashboard/Drives" : "/HR/dashboard",
            )
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

        {/* Create User Form - Using Component */}
        <div className="relative">
          <UserFormCard
            newUser={newUser}
            setNewUser={setNewUser}
            createCandidate={createCandidate}
            onImportClick={onImportClick}
            importing={importing}
            colors={colors}
          />
        </div>

        {/* Candidates Overview Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ">
          {/* Table Header - Using Component */}
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
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
