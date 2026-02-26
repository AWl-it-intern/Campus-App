import apiClient from "./apiClient";

export async function fetchDrives({ limit = 5000 } = {}) {
  const suffix = Number.isFinite(limit) ? `?limit=${limit}` : "";
  const { data } = await apiClient.get(`/print-drives${suffix}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function createDrive(payload) {
  const { data } = await apiClient.post("/drive", payload);
  return data;
}

export async function deleteDrive(driveId) {
  const { data } = await apiClient.delete(`/drive/${driveId}`);
  return data;
}

export async function fetchDriveById(driveId) {
  const { data } = await apiClient.get(`/drive/${driveId}`);
  return data?.data || null;
}
