import candidateRoutes from "./candidateRoutes.js";
import panelistRoutes from "./panelistRoutes.js";
import jobRoutes from "./jobRoutes.js";
import driveRoutes from "./driveRoutes.js";
import userRoutes from "./userRoutes.js";

export default function registerRoutes(app) {
  app.use(candidateRoutes);
  app.use(panelistRoutes);
  app.use(jobRoutes);
  app.use(driveRoutes);
  app.use(userRoutes);
}
