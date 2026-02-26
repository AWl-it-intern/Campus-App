import apiClient from "./apiClient";

export async function fetchJobs({ limit = 5000 } = {}) {
  const suffix = Number.isFinite(limit) ? `?limit=${limit}` : "";
  const { data } = await apiClient.get(`/print-jobs${suffix}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function createJob(payload) {
  const { data } = await apiClient.post("/job", payload);
  return data;
}

export async function deleteJob(jobId) {
  const { data } = await apiClient.delete(`/job/${jobId}`);
  return data;
}
