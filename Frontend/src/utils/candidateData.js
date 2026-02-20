import axios from "axios";

export const API_BASE = "http://localhost:5000";
export const CANDIDATE_APPLICATION_KEY = "candidate_application";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export async function fetchLoggedInCandidate() {
  const response = await axios.get(`${API_BASE}/print-candidates?limit=5000`);
  const candidates = Array.isArray(response.data?.data) ? response.data.data : [];

  if (candidates.length === 0) return null;

  const loggedInEmail = normalizeEmail(localStorage.getItem("candidate_email"));
  const matchedCandidate = candidates.find(
    (candidate) => normalizeEmail(candidate.email) === loggedInEmail,
  );

  return matchedCandidate || candidates[0];
}

export function readSavedCandidateApplication() {
  try {
    const raw = localStorage.getItem(CANDIDATE_APPLICATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCandidateApplication(payload) {
  localStorage.setItem(CANDIDATE_APPLICATION_KEY, JSON.stringify(payload));
}

