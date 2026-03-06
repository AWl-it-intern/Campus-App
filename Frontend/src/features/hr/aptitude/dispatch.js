/**
 * File Type: Feature Dispatch Helpers
 * Input Type: Selected candidate ids + selected entities + nextId callback
 * Output Type: Sent aptitude row records
 */
import { getCandidateKey, safeText } from "./utils";

export const buildSentRows = ({ selectedCandidateIds, targetCandidates, selectedDrive, selectedJob, aptitudeLink, nextId }) => {
  const sentAt = new Date().toISOString();
  const driveLabel = `${selectedDrive.DriveID || "-"} - ${selectedDrive.CollegeName || "-"}`;
  const selectedMap = new Map(targetCandidates.map((candidate) => [getCandidateKey(candidate), candidate]));
  const jobId = safeText(selectedJob.JobID || selectedJob._id || selectedJob.id) || "-";
  const jobName = safeText(selectedJob.JobName) || "-";

  return selectedCandidateIds
    .map((candidateKey) => selectedMap.get(candidateKey))
    .filter(Boolean)
    .map((candidate) => ({
      aptitudeId: nextId(),
      candidateKey: getCandidateKey(candidate),
      candidateId: safeText(candidate.CandidateID) || "-",
      candidateName: safeText(candidate.name) || "Unnamed Candidate",
      driveLabel,
      jobId,
      jobName,
      sentAt,
      link: aptitudeLink.trim(),
      status: "Queued",
    }));
};
