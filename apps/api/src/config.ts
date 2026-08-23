import { z } from "zod";

const LOCAL_DEVELOPMENT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const environmentSchema = z.object({
  ALLOWED_ORIGINS: z.string().optional(),
  HOST: z.string().min(1).default("0.0.0.0"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  MAX_WS_CLIENTS: z.coerce.number().int().min(1).max(10_000).default(100),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  SHUTDOWN_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(60_000)
    .default(10_000),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export interface ApiConfig {
  allowedOrigins: Set<string>;
  host: string;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  maxWebSocketClients: number;
  nodeEnv: "development" | "test" | "production";
  port: number;
  shutdownTimeoutMs: number;
  trustProxy: boolean;
}

export const parseAllowedOrigins = (
  rawOrigins: string | undefined,
  nodeEnv: ApiConfig["nodeEnv"],
): Set<string> => {
  const values = rawOrigins
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!values?.length) {
    if (nodeEnv === "production") {
      throw new Error("ALLOWED_ORIGINS is required in production.");
    }

    return new Set(LOCAL_DEVELOPMENT_ORIGINS);
  }

  return new Set(
    values.map((value) => {
      let parsed: URL;

      try {
        parsed = new URL(value);
      } catch {
        throw new Error(`Invalid ALLOWED_ORIGINS entry: ${value}`);
      }

      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        parsed.username ||
        parsed.password ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash
      ) {
        throw new Error(
          `ALLOWED_ORIGINS entries must be exact HTTP(S) origins: ${value}`,
        );
      }

      return parsed.origin;
    }),
  );
};

export const readApiConfig = (
  environment: NodeJS.ProcessEnv = process.env,
): ApiConfig => {
  const parsed = environmentSchema.parse(environment);

  return {
    allowedOrigins: parseAllowedOrigins(
      parsed.ALLOWED_ORIGINS,
      parsed.NODE_ENV,
    ),
    host: parsed.HOST,
    logLevel: parsed.LOG_LEVEL,
    maxWebSocketClients: parsed.MAX_WS_CLIENTS,
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    shutdownTimeoutMs: parsed.SHUTDOWN_TIMEOUT_MS,
    trustProxy: parsed.TRUST_PROXY,
  };
};
