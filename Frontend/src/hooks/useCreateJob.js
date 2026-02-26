import { useEffect, useMemo, useState } from "react";
import { createJob, deleteJob, fetchJobs } from "../services/jobsService";
import { fetchCandidates } from "../services/candidatesService";

export default function useCreateJob({ onJobAssignment, onJobsUpdate } = {}) {
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newJob, setNewJob] = useState({
    JobID: "",
    JobName: "",
  });
  const [jobSearchTerm, setJobSearchTerm] = useState("");

  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      const data = await fetchJobs({ limit: 5000 });
      const jobsData = (data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        assignedCandidates: doc.assignedCandidates || [],
      }));
      setJobs(jobsData);
      setJobsError(null);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobsError("Failed to fetch jobs from database. Please try again.");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    fetchCandidates({ limit: 5000 })
      .then((data) => {
        setCandidates(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching candidates:", error);
        setCandidates([]);
      });
  }, []);

  useEffect(() => {
    if (onJobAssignment) {
      const candidateJobMap = {};

      jobs.forEach((job) => {
        (job.assignedCandidates || []).forEach((candidateId) => {
          if (!candidateJobMap[candidateId]) {
            candidateJobMap[candidateId] = [];
          }
          candidateJobMap[candidateId].push(job.JobName);
        });
      });

      onJobAssignment(candidateJobMap);
    }

    if (onJobsUpdate) {
      onJobsUpdate(jobs);
    }
  }, [jobs, onJobAssignment, onJobsUpdate]);

  const handleCreateJob = async () => {
    const jobId = newJob.JobID.trim();
    const jobName = newJob.JobName.trim();

    if (!jobId || !jobName) {
      alert("Please fill in all fields");
      return;
    }

    if (jobs.some((job) => job.JobID.toLowerCase() === jobId.toLowerCase())) {
      alert("Job ID already exists!");
      return;
    }

    try {
      const response = await createJob({
        JobID: jobId,
        JobName: jobName,
        assignedCandidates: [],
      });

      if (response?.success) {
        setNewJob({ JobID: "", JobName: "" });
        await loadJobs();
        alert("Job Created Successfully!");
      } else {
        alert("Failed to create job: " + (response?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please check your connection and try again.");
    }
  };

  const handleDeleteJob = async (jobToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${jobToDelete.JobName}" (${jobToDelete.JobID})?`,
      )
    ) {
      const jobId = jobToDelete.id || jobToDelete._id;
      if (!jobId) {
        alert("Unable to delete job: missing job id.");
        return;
      }

      try {
        const response = await deleteJob(jobId);
        if (response?.success) {
          await loadJobs();
          alert("Job deleted successfully!");
        } else {
          alert("Failed to delete job: " + (response?.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job. Please check your connection and try again.");
      }
    }
  };

  const filteredJobs = useMemo(
    () =>
      jobs
        .filter((job) => {
          const searchLower = jobSearchTerm.toLowerCase();
          return (
            job.JobID.toLowerCase().includes(searchLower) ||
            job.JobName.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) =>
          String(a.JobID || "").localeCompare(String(b.JobID || ""), undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        ),
    [jobs, jobSearchTerm],
  );

  const candidateMap = useMemo(() => {
    const map = new Map();
    (candidates || []).forEach((candidate) => {
      map.set(String(candidate._id), candidate);
    });
    return map;
  }, [candidates]);

  const getCandidatesForJob = (job) => {
    const assigned = Array.isArray(job.assignedCandidates) ? job.assignedCandidates : [];
    return assigned
      .map((candidateId) => candidateMap.get(String(candidateId)))
      .filter(Boolean);
  };

  return {
    jobs,
    jobsLoading,
    jobsError,
    newJob,
    setNewJob,
    jobSearchTerm,
    setJobSearchTerm,
    filteredJobs,
    candidates,
    getCandidatesForJob,
    handleCreateJob,
    handleDeleteJob,
    reloadJobs: loadJobs,
  };
}
