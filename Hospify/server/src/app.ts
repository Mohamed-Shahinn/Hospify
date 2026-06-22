import express from "express";

import { configureExpress } from "./config/express";

export const app = express();

configureExpress(app);
