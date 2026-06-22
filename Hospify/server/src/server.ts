import { createServer } from "node:http";

import { app } from "./app";
import { env } from "./config/env";

const httpServer = createServer(app);

httpServer.listen(env.port, () => {
  console.info(`Hospify server listening on port ${env.port}`);
});

httpServer.on("error", (error) => {
  console.error("Unable to start Hospify server", error);
  process.exitCode = 1;
});

let isShuttingDown = false;

const shutdown = (signal: NodeJS.Signals): void => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.info(`${signal} received; shutting down gracefully`);

  const forceShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10_000);
  forceShutdownTimer.unref();

  httpServer.close((error) => {
    clearTimeout(forceShutdownTimer);

    if (error) {
      console.error("Error while closing the HTTP server", error);
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
