import express from "express";
import dotenv from "dotenv";
import cors from 'cors';

import {
  connectDB,
  closeDB,
  insertCandidate,
  deleteCandidate,
  printCandidates,
  insertJob,
  printJobs,
  insertUsers,
  insertPanelist,
  deletePanelist,
  updatePanelist,
  printPanelists
} from "./db.js";


dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server running 🚀" });
});

/* -------- Insert Candidate -------- */
app.post("/candidate", async (req, res) => {
  try {
    const result = await insertCandidate(req.body);

    // 👇 DEV ONLY: print after insert
    await printCandidates(5);

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
});

/* -------- Delete Candidate -------- */
app.delete("/candidate/:id", async (req, res) => {
  try {
    const result = await deleteCandidate(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }
    res.json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* -------- Print Candidates API -------- */
app.get("/print-candidates", async (req, res) => {
  try {
    const data = await printCandidates(10, true);

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
});

/* ---------Insert Panelist --------- */
app.post("/panelist", async (req, res) => {
  try {
    const result = await insertPanelist(req.body);
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
});

/* -------- Delete Panelist --------- */
app.delete("/panelist/:id", async (req, res) => {
  try {
    const result = await deletePanelist(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Panelist not found",
      });
    }
    res.json({
      success: true,
      message: "Panelist deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* -------- Update Panelist --------- */
app.put("/panelist/:id", async (req, res) => {
  try {
    const result = await updatePanelist(req.params.id, req.body);
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Panelist not found or no changes made",
      });
    }
    res.json({
      success: true,
      message: "Panelist updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

/* -------- Print Panelists API -------- */
app.get("/print-panelists", async (req, res) => {
  try {
    const data = await printPanelists(10, true);

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
});

/* -------- Insert Job -------- */
app.post("/job", async (req, res) => {
  try {
    const result = await insertJob(req.body);

    // 👇 DEV ONLY: print after insert
    await printJobs(5);

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
});

/* -------- Print Jobs API -------- */
app.get("/print-jobs", async (req, res) => {
  try {
    const data = await printJobs(10, true);

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
});

// Insert Users ----------------------------
app.post("/Users", async (req, res) => {
  try {
    const result = await insertUsers(req.body);
    res.status(201).json({
      success: true,
      id: result.insertedId,
    });
  }
  catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    })
  }
});

/* -------- Start Server -------- */
(async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start");
    process.exit(1);
  }
})();

/* -------- Graceful Shutdown -------- */
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});


