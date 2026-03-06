/**
 * File Type: Feature Storage Helpers
 * Input Type: LocalStorage keys/dispatch rows
 * Output Type: Persisted aptitude log and generated aptitude IDs
 */
import { APTITUDE_COUNTER_STORAGE_KEY, APTITUDE_LOG_STORAGE_KEY } from "./constants";

const getStorage = () => (typeof window === "undefined" ? null : window.localStorage);

export const readAptitudeDispatchLog = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(APTITUDE_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeAptitudeDispatchLog = (nextLog = []) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(APTITUDE_LOG_STORAGE_KEY, JSON.stringify(nextLog));
};

export const nextAptitudeCustomId = () => {
  const storage = getStorage();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  if (!storage) return `APT-${today}-${String(Date.now()).slice(-4)}`;

  const previous = Number.parseInt(storage.getItem(APTITUDE_COUNTER_STORAGE_KEY) || "0", 10);
  const next = Number.isFinite(previous) ? previous + 1 : 1;
  storage.setItem(APTITUDE_COUNTER_STORAGE_KEY, String(next));
  return `APT-${today}-${String(next).padStart(4, "0")}`;
};
