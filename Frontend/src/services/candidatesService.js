import apiClient from "./apiClient";

export async function fetchCandidates({ limit = 5000 } = {}) {
  const { data } = await apiClient.get(`/print-candidates?limit=${limit}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function createCandidate(payload) {
  const { data } = await apiClient.post("/candidate", payload);
  return data;
}

export async function deleteCandidate(candidateId) {
  const { data } = await apiClient.delete(`/candidate/${candidateId}`);
  return data;
}

export async function bulkInsertCandidates(candidates) {
  const { data } = await apiClient.post("/candidate/bulk", { candidates });
  return data;
}

export async function updateCandidate(candidateId, payload) {
  const { data } = await apiClient.patch(`/candidate/${candidateId}`, payload);
  return data;
}
