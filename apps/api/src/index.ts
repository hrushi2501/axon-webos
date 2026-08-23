import { config as loadEnvironment } from "dotenv";
import { readApiConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createApiServer } from "./server.js";

loadEnvironment({ quiet: true });

const configuration = readApiConfig();
const logger = createLogger(configuration.logLevel);
const apiServer = createApiServer({
  allowedOrigins: configuration.allowedOrigins,
  logger,
  maxWebSocketClients: configuration.maxWebSocketClients,
  trustProxy: configuration.trustProxy,
});

let shutdownStarted = false;

const shutdown = async (signal: string, exitCode = 0) => {
  if (shutdownStarted) {
    logger.fatal({ signal }, "second shutdown signal received; forcing exit");
    process.exit(1);
  }

  shutdownStarted = true;
  logger.info({ signal }, "shutting down Axon API");

  const deadline = setTimeout(() => {
    logger.fatal("shutdown deadline exceeded");
    process.exit(1);
  }, configuration.shutdownTimeoutMs);
  deadline.unref();

  try {
    await apiServer.close();
    clearTimeout(deadline);
    logger.info("Axon API shutdown complete");
    process.exit(exitCode);
  } catch (error) {
    logger.fatal({ err: error }, "Axon API shutdown failed");
    process.exit(1);
  }
};

apiServer.httpServer.on("error", (error) => {
  logger.fatal({ err: error }, "Axon API server error");
  void shutdown("server-error", 1);
});

apiServer.httpServer.listen(configuration.port, configuration.host, () => {
  logger.info(
    {
      allowedOriginCount: configuration.allowedOrigins.size,
      host: configuration.host,
      maxWebSocketClients: configuration.maxWebSocketClients,
      nodeEnv: configuration.nodeEnv,
      port: configuration.port,
    },
    "Axon API listening",
  );
});

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "uncaught exception");
  void shutdown("uncaughtException", 1);
});
process.on("unhandledRejection", (error) => {
  logger.fatal({ err: error }, "unhandled rejection");
  void shutdown("unhandledRejection", 1);
});
