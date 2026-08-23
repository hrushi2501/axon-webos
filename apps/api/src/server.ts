import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import express, { type Express } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import type { Logger } from "pino";
import { pinoHttp } from "pino-http";
import { WebSocket, WebSocketServer } from "ws";
import { createLogger } from "./logger.js";
import {
  createMetricsService,
  type MetricsService,
  type SystemMetrics,
} from "./metrics.js";

const TELEMETRY_INTERVAL_MS = 1_000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const MAX_BUFFERED_BYTES = 1_048_576;
const MAX_WEBSOCKET_PAYLOAD_BYTES = 1_024;
const APP_VERSION = process.env.APP_VERSION ?? "1.0.0";

export interface ApiServer {
  app: Express;
  close: () => Promise<void>;
  httpServer: Server;
  isReady: () => boolean;
}

interface ApiServerOptions {
  allowedOrigins?: Set<string>;
  logger?: Logger;
  maxWebSocketClients?: number;
  metricsService?: MetricsService;
  trustProxy?: boolean;
}

type MetricsEvent = {
  type: "metrics.updated";
  data: SystemMetrics;
};

const defaultAllowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

export const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigins: Set<string>,
): boolean => Boolean(origin && allowedOrigins.has(origin));

const toMetricsEvent = (metrics: SystemMetrics): MetricsEvent => ({
  type: "metrics.updated",
  data: metrics,
});

const rejectUpgrade = (
  socket: NodeJS.WritableStream & { destroy: () => void },
  status: 400 | 403 | 404 | 503,
) => {
  const reason = {
    400: "Bad Request",
    403: "Forbidden",
    404: "Not Found",
    503: "Service Unavailable",
  }[status];

  socket.write(
    `HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`,
  );
  socket.destroy();
};

const createApp = (
  metricsService: MetricsService,
  isReady: () => boolean,
  logger: Logger,
  trustProxy: boolean,
): Express => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", trustProxy ? 1 : false);
  app.use(
    pinoHttp({
      autoLogging: {
        ignore: (request) =>
          ["/health", "/livez", "/readyz"].includes(
            request.url?.split("?")[0] ?? "",
          ),
      },
      genReqId: (request, response) => {
        const providedRequestId = request.headers["x-request-id"];
        const requestId =
          typeof providedRequestId === "string" &&
          /^[A-Za-z0-9._-]{1,64}$/.test(providedRequestId)
            ? providedRequestId
            : randomUUID();
        response.setHeader("x-request-id", requestId);
        return requestId;
      },
      logger,
      quietReqLogger: true,
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { frameAncestors: ["'none'"] },
      },
    }),
  );
  app.use((_request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "16kb", strict: true }));

  app.get("/", (_request, response) => {
    response.json({ service: "axon-api", status: "ok", version: APP_VERSION });
  });

  app.get("/livez", (_request, response) => {
    response.json({ service: "axon-api", status: "alive" });
  });

  const readinessHandler: express.RequestHandler = (_request, response) => {
    const ready = isReady();
    response.status(ready ? 200 : 503).json({
      service: "axon-api",
      status: ready ? "ready" : "draining",
      uptimeSeconds: Math.round(process.uptime()),
      version: APP_VERSION,
    });
  };

  app.get("/health", readinessHandler);
  app.get("/readyz", readinessHandler);

  app.use(
    "/api",
    rateLimit({
      legacyHeaders: false,
      limit: 120,
      message: { error: "rate_limit_exceeded" },
      standardHeaders: "draft-8",
      windowMs: 60_000,
    }),
  );

  app.get("/api/metrics", (_request, response) => {
    response.json(toMetricsEvent(metricsService.snapshot()));
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "not_found" });
  });

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      void next;
      logger.warn({ err: error }, "request rejected");
      response.status(400).json({ error: "invalid_request" });
    },
  );

  return app;
};

export const createApiServer = (options: ApiServerOptions = {}): ApiServer => {
  const metricsService = options.metricsService ?? createMetricsService();
  const allowedOrigins = options.allowedOrigins ?? defaultAllowedOrigins;
  const logger = options.logger ?? createLogger("silent");
  const maxWebSocketClients = options.maxWebSocketClients ?? 100;
  let acceptingTraffic = true;
  let closePromise: Promise<void> | undefined;

  const isReady = () => acceptingTraffic && metricsService.isReady();
  const app = createApp(
    metricsService,
    isReady,
    logger,
    options.trustProxy ?? false,
  );
  const httpServer = createServer(app);
  const webSocketServer = new WebSocketServer({
    clientTracking: true,
    maxPayload: MAX_WEBSOCKET_PAYLOAD_BYTES,
    noServer: true,
    perMessageDeflate: false,
  });
  const aliveClients = new WeakSet<WebSocket>();

  httpServer.headersTimeout = 10_000;
  httpServer.keepAliveTimeout = 5_000;
  httpServer.maxHeadersCount = 100;
  httpServer.requestTimeout = 15_000;
  httpServer.timeout = 30_000;

  httpServer.on("clientError", (error, socket) => {
    logger.warn({ err: error }, "invalid HTTP client request");
    if (socket.writable) rejectUpgrade(socket, 400);
  });

  httpServer.on("upgrade", (request, socket, head) => {
    if (!acceptingTraffic) {
      rejectUpgrade(socket, 503);
      return;
    }

    let requestUrl: URL;
    try {
      requestUrl = new URL(request.url ?? "/", "http://internal.invalid");
    } catch {
      rejectUpgrade(socket, 400);
      return;
    }

    if (requestUrl.pathname !== "/ws") {
      rejectUpgrade(socket, 404);
      return;
    }

    if (!isOriginAllowed(request.headers.origin, allowedOrigins)) {
      logger.warn("rejected WebSocket origin");
      rejectUpgrade(socket, 403);
      return;
    }

    if (webSocketServer.clients.size >= maxWebSocketClients) {
      logger.warn("rejected WebSocket connection limit");
      rejectUpgrade(socket, 503);
      return;
    }

    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      webSocketServer.emit("connection", webSocket, request);
    });
  });

  webSocketServer.on("connection", (socket) => {
    aliveClients.add(socket);
    logger.info(
      { activeWebSocketClients: webSocketServer.clients.size },
      "WebSocket connected",
    );

    socket.on("pong", () => aliveClients.add(socket));
    socket.on("message", () => {
      socket.close(1008, "Client messages are not accepted");
    });
    socket.on("error", (error) => {
      logger.warn({ err: error }, "WebSocket client error");
    });
    socket.on("close", () => {
      logger.info(
        { activeWebSocketClients: webSocketServer.clients.size },
        "WebSocket disconnected",
      );
    });

    socket.send(JSON.stringify(toMetricsEvent(metricsService.snapshot())));
  });

  const telemetryInterval = setInterval(() => {
    const payload = JSON.stringify(toMetricsEvent(metricsService.sample()));

    for (const client of webSocketServer.clients) {
      if (client.readyState !== WebSocket.OPEN) continue;
      if (client.bufferedAmount > MAX_BUFFERED_BYTES) {
        logger.warn("terminating slow WebSocket client");
        client.terminate();
        continue;
      }
      client.send(payload);
    }
  }, TELEMETRY_INTERVAL_MS);

  const heartbeatInterval = setInterval(() => {
    for (const client of webSocketServer.clients) {
      if (!aliveClients.has(client)) {
        logger.warn("terminating unresponsive WebSocket client");
        client.terminate();
        continue;
      }

      aliveClients.delete(client);
      client.ping();
    }
  }, HEARTBEAT_INTERVAL_MS);

  const close = (): Promise<void> => {
    if (closePromise) return closePromise;

    closePromise = (async () => {
      acceptingTraffic = false;
      clearInterval(heartbeatInterval);
      clearInterval(telemetryInterval);

      for (const client of webSocketServer.clients) {
        client.close(1001, "Server shutting down");
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      for (const client of webSocketServer.clients) client.terminate();

      await Promise.all([
        new Promise<void>((resolve) => {
          webSocketServer.close(() => resolve());
        }),
        new Promise<void>((resolve, reject) => {
          httpServer.close((error) => (error ? reject(error) : resolve()));
          httpServer.closeIdleConnections();
        }),
      ]);
    })();

    return closePromise;
  };

  return { app, close, httpServer, isReady };
};
