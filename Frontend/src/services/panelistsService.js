import apiClient from "./apiClient";

export async function fetchPanelists({ limit = 5000 } = {}) {
  const suffix = Number.isFinite(limit) ? `?limit=${limit}` : "";
  const { data } = await apiClient.get(`/print-panelists${suffix}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function createPanelist(payload) {
  const { data } = await apiClient.post("/panelist", payload);
  return data;
}

export async function updatePanelist(panelistId, payload) {
  const { data } = await apiClient.put(`/panelist/${panelistId}`, payload);
  return data;
}

export async function deletePanelist(panelistId) {
  const { data } = await apiClient.delete(`/panelist/${panelistId}`);
  return data;
}
