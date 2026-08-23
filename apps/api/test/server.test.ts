import assert from "node:assert/strict";
import { once } from "node:events";
import type { IncomingMessage } from "node:http";
import test from "node:test";
import type { AddressInfo } from "node:net";
import { WebSocket } from "ws";
import {
  calculateCpuUsage,
  type MetricsService,
  type SystemMetrics,
} from "../src/metrics.js";
import { parseAllowedOrigins, readApiConfig } from "../src/config.js";
import { createApiServer, isOriginAllowed } from "../src/server.js";

const testMetrics: SystemMetrics = {
  cpuUsagePercent: 37.5,
  memoryUsedBytes: 8_589_934_592,
  memoryTotalBytes: 17_179_869_184,
  observedAt: "2026-08-23T00:00:00.000Z",
};

const metricsService: MetricsService = {
  isReady: () => true,
  sample: () => testMetrics,
  snapshot: () => testMetrics,
};

test("calculates CPU utilization from consecutive samples", () => {
  const usage = calculateCpuUsage(
    { idle: 80, total: 200 },
    { idle: 100, total: 300 },
  );

  assert.equal(usage, 80);
});

test("allows only configured WebSocket origins", () => {
  const allowedOrigins = new Set(["https://portfolio.example.com"]);

  assert.equal(
    isOriginAllowed("https://portfolio.example.com", allowedOrigins),
    true,
  );
  assert.equal(
    isOriginAllowed("https://attacker.example.com", allowedOrigins),
    false,
  );
  assert.equal(isOriginAllowed(undefined, allowedOrigins), false);
});

test("requires and validates exact production origins", () => {
  assert.throws(
    () => readApiConfig({ NODE_ENV: "production" }),
    /ALLOWED_ORIGINS is required/,
  );
  assert.throws(
    () => parseAllowedOrigins("https://example.com/path", "production"),
    /exact HTTP\(S\) origins/,
  );
  assert.deepEqual(
    parseAllowedOrigins("https://example.com/,http://localhost:3000", "test"),
    new Set(["https://example.com", "http://localhost:3000"]),
  );
});

test("serves health, REST metrics, and origin-validated WebSocket telemetry", async () => {
  const apiServer = createApiServer({
    allowedOrigins: new Set(["http://localhost:3000"]),
    metricsService,
  });

  await new Promise<void>((resolve) =>
    apiServer.httpServer.listen(0, "127.0.0.1", resolve),
  );
  const address = apiServer.httpServer.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    assert.equal(healthResponse.status, 200);
    const health = (await healthResponse.json()) as Record<string, unknown>;
    assert.equal(health.service, "axon-api");
    assert.equal(health.status, "ready");
    assert.equal(typeof health.uptimeSeconds, "number");
    assert.equal(healthResponse.headers.get("cache-control"), "no-store");
    assert.equal(
      healthResponse.headers.get("x-content-type-options"),
      "nosniff",
    );
    assert.ok(healthResponse.headers.get("x-request-id"));

    const liveResponse = await fetch(`${baseUrl}/livez`);
    assert.equal(liveResponse.status, 200);
    assert.deepEqual(await liveResponse.json(), {
      service: "axon-api",
      status: "alive",
    });

    const metricsResponse = await fetch(`${baseUrl}/api/metrics`);
    assert.equal(metricsResponse.status, 200);
    assert.deepEqual(await metricsResponse.json(), {
      type: "metrics.updated",
      data: testMetrics,
    });

    const rejectedSocket = new WebSocket(
      baseUrl.replace("http", "ws") + "/ws",
      { headers: { origin: "https://attacker.example.com" } },
    );
    const [, rejectedResponse] = (await once(
      rejectedSocket,
      "unexpected-response",
    )) as [unknown, IncomingMessage];
    assert.equal(rejectedResponse.statusCode, 403);
    rejectedResponse.resume();

    const socket = new WebSocket(baseUrl.replace("http", "ws") + "/ws", {
      headers: { origin: "http://localhost:3000" },
    });
    const [payload] = await once(socket, "message");

    assert.deepEqual(JSON.parse(String(payload)), {
      type: "metrics.updated",
      data: testMetrics,
    });

    const closePromise = once(socket, "close");
    socket.send("client payloads are forbidden");
    const [closeCode] = await closePromise;
    assert.equal(closeCode, 1008);
  } finally {
    assert.equal(apiServer.isReady(), true);
    const closePromise = apiServer.close();
    assert.equal(apiServer.isReady(), false);
    await closePromise;
  }
});
