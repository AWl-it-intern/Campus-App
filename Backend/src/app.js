// src/app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import registerRoutes from "./routes/index.js";

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";

// Resolve __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core middleware
app.use(express.json());

if (NODE_ENV === "development") {
  app.use(cors({ origin: ["http://localhost:5173"] }));
} else {
  // In production same-origin, you can remove CORS entirely or restrict it.
  app.use(cors());
}

// Health route (keep this; useful for probes)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server running" });
});

// --- API routes FIRST ---
registerRoutes(app); // ensure it mounts at "/api" inside, or do: app.use("/api", registerRoutes);

// And change the ENV variable in .env to: NODE_ENV=production to disable CORS in production, or adjust as needed for your deployment setup.
//And remember to set the HOST variable in .env to your server's IP or hostname if you want to bind to a specific interface, or leave it out to bind to all interfaces .
//Add add dist folder from frontend in the clint/dist and uncomment the lines in the server.js to serve the frontend in production.

// --- Serve Vite build --- uncomment this when you have a production build of the frontend in ../client/dist
// const clientDist = path.join(__dirname, "..", "client", "dist");    
// app.use(express.static(clientDist)); 

// --- Robust SPA fallback for Express 5 --- uncomment this when you have a production build of the frontend in ../client/dist
// This RegExp matches any path that does NOT start with /api
// app.get(/^\/(?!api)(.*)/, (req, res) => {
//   res.sendFile(path.join(clientDist, "index.html"));
// });

export default app;
