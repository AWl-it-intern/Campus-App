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

const parseAssignedJobsCell = (raw) => {
  if (!raw) return [];
  const text = String(raw).trim();

  if (text.startsWith("[") && text.endsWith("]")) {
    try {
      const arr = JSON.parse(text);
      return Array.isArray(arr) ? arr.filter(Boolean).map(String) : [];
    } catch {
      // fall back to delimiter parsing
    }
  }

  const delim = text.includes(";") ? ";" : ",";
  return text
    .split(delim)
    .map((value) => value.trim())
    .filter(Boolean);
};

export function parseCsvCandidates(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV file must include a header and at least one row");
  }

  const headers = parseCsvLine(lines[0])
    .map((header) => header.replace(/^\uFEFF/, "").trim().toLowerCase());

  const nameIdx = readIndex(headers, ["name", "full name", "candidate name"]);
  const emailIdx = readIndex(headers, ["email", "email address", "mail"]);
  const collegeIdx = readIndex(headers, ["college", "college name", "university"]);
  const assignedJobsIdx = readIndex(headers, ["assignedjobs", "assigned jobs"]);
  const driveIdIdx = readIndex(headers, [
    "driveid",
    "drive id",
    "assigneddriveid",
    "assigned drive id",
  ]);

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
      AssignedJobs: parseAssignedJobsCell(assignedJobsRaw),
      driveId,
    };
  });

  return candidatesPayload.filter((candidate) => candidate.email);
}

const formatCsvCell = (value) =>
  `"${String(value ?? "").replaceAll('"', '""').replaceAll("\n", " ")}"`;

export function buildCandidatesCsv(candidates, { locale = "en-IN" } = {}) {
  const headers = ["Name", "Email", "College", "AssignedJobs", "DriveID", "CreatedAt"];

  const rows = (candidates || []).map((candidate) => [
    candidate.name || "",
    candidate.email || "",
    candidate.college || "",
    JSON.stringify(
      Array.isArray(candidate.AssignedJobs) ? candidate.AssignedJobs : [],
    ),
    candidate.driveId || candidate.DriveID || "",
    candidate.createdAt ? new Date(candidate.createdAt).toLocaleString(locale) : "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map(formatCsvCell).join(","))
    .join("\n");
}
