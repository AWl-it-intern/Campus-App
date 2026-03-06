/**
 * File Type: Feature Utilities
 * Input Type: Drive/job/template records
 * Output Type: Normalized strings and filtered job arrays
 */
export const safeText = (value) => String(value || "").trim();

export const safeLower = (value) => safeText(value).toLowerCase();

export const getJobKey = (job = {}) => safeText(job._id || job.id || job.JobID || job.JobName);

export const getDriveKey = (drive = {}) => String(drive._id || drive.id || drive.DriveID || "");

export const resolveAvailableJobs = ({ selectedDrive, jobs }) => {
  if (!selectedDrive) return [];

  const driveCode = safeText(selectedDrive.DriveID);
  const configuredOpenings = new Set(
    (Array.isArray(selectedDrive.JobsOpening) ? selectedDrive.JobsOpening : [])
      .map((job) => safeLower(job))
      .filter(Boolean),
  );

  return jobs.filter((job) => {
    const jobName = safeText(job.JobName);
    if (!jobName) return false;
    if (configuredOpenings.has(safeLower(jobName))) return true;

    const driveMap = job.Drive && typeof job.Drive === "object" ? job.Drive : {};
    return driveCode ? Object.prototype.hasOwnProperty.call(driveMap, driveCode) : false;
  });
};

export const uniqueJobTemplateCount = (savedTemplates = []) =>
  new Set(savedTemplates.map((item) => safeLower(item.jobId || item.jobName)).filter(Boolean)).size;
