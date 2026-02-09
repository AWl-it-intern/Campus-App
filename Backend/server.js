import express from "express";
import dotenv from "dotenv";
import cors from 'cors';


import {
  connectDB,
  closeDB,
  insertCandidate,
  printCandidates,
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

/* -------- Print Candidates API -------- */
app.get("/print-candidates", async (req, res) => {
  try {
    const data = await printCandidates(10);

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
