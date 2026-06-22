import express, { type Express } from "express";

import { errorHandler } from "../middleware/error-handler";
import { registerRoutes } from "../routes";

export const configureExpress = (app: Express): void => {
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  registerRoutes(app);
  app.use(errorHandler);
};
