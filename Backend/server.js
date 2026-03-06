import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB, closeDB } from "./src/db/core.js";
export * from "./src/db/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST; // optional

(async function startServer() {
  try {
    await connectDB();

    if (HOST) {
      app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error(" Server failed to start", err);
    process.exit(1);
  }
})();

process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});