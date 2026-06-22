import type { Express } from "express";

import { authRouter } from "./auth.routes";
import { healthRouter } from "./health.routes";

export const registerRoutes = (app: Express): void => {
  app.use("/auth", authRouter);
  app.use("/health", healthRouter);
};
