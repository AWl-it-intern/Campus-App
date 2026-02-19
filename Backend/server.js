import dotenv from "dotenv";
import app from "./src/app.js";
import {
  connectDB,
  closeDB,
} from "./db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

/* -------- Start Server -------- */
(async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" Server failed to start");
    process.exit(1);
  }
})();

/* -------- Graceful Shutdown -------- */
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});
