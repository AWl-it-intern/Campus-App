import { createJob, listJobs, removeJob } from "../services/jobService.js";

/* -------- Insert Job -------- */
export async function insertJobHandler(req, res) {
  try {
    const result = await createJob(req.body);

    // DEV ONLY: print after insert
    await listJobs({ limit: 5, debug: true });

    res.status(201).json({
      success: true,
      id: result.insertedId,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Delete Job -------- */
export async function deleteJobHandler(req, res) {
  try {
    const result = await removeJob(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Print Jobs API -------- */
export async function printJobsHandler(req, res) {
  try {
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : 0;
    const data = await listJobs({ limit, debug: true });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
