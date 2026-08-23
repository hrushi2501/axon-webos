import pino, { type Logger } from "pino";

export const createLogger = (level: string): Logger =>
  pino({
    base: {
      service: "axon-api",
      version: process.env.APP_VERSION ?? "1.0.0",
    },
    level,
    redact: {
      censor: "[Redacted]",
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers.set-cookie",
      ],
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
