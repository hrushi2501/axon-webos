import { create } from "zustand";

export interface SystemStats {
  cpuUsagePercent: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  observedAt: string;
}

export type MetricsSource = "live" | "simulated" | "unavailable";

interface MetricsEvent {
  type: "metrics.updated";
  data: SystemStats;
}

interface SocketStore {
  isConnected: boolean;
  stats: SystemStats | null;
  metricsSource: MetricsSource;
  connect: () => void;
  disconnect: () => void;
}

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const SIMULATION_INTERVAL_MS = 1_000;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let simulationTimer: ReturnType<typeof setInterval> | undefined;
let reconnectAttempt = 0;
let shouldReconnect = false;

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
};

const clearSimulationTimer = () => {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = undefined;
  }
};

const getWebSocketUrl = (): string => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_WS_URL?.trim();
  if (configuredUrl) return configuredUrl;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:3001/ws`;
};

const createSimulatedStats = (): SystemStats => {
  const memoryTotalBytes = 16 * 1024 * 1024 * 1024;

  return {
    cpuUsagePercent: Math.round((15 + Math.random() * 30) * 10) / 10,
    memoryUsedBytes:
      4 * 1024 * 1024 * 1024 + Math.round(Math.random() * 500 * 1024 * 1024),
    memoryTotalBytes,
    observedAt: new Date().toISOString(),
  };
};

const parseMetricsEvent = (value: unknown): MetricsEvent | null => {
  if (!value || typeof value !== "object") return null;

  const event = value as { type?: unknown; data?: unknown };
  if (
    event.type !== "metrics.updated" ||
    !event.data ||
    typeof event.data !== "object"
  )
    return null;

  const data = event.data as Record<string, unknown>;
  if (
    typeof data.cpuUsagePercent !== "number" ||
    typeof data.memoryUsedBytes !== "number" ||
    typeof data.memoryTotalBytes !== "number" ||
    typeof data.observedAt !== "string"
  ) {
    return null;
  }

  return {
    type: "metrics.updated",
    data: {
      cpuUsagePercent: data.cpuUsagePercent,
      memoryUsedBytes: data.memoryUsedBytes,
      memoryTotalBytes: data.memoryTotalBytes,
      observedAt: data.observedAt,
    },
  };
};

export const useSocketStore = create<SocketStore>((set, get) => {
  const startSimulation = () => {
    if (simulationTimer) return;

    const publish = () => {
      set({
        isConnected: false,
        metricsSource: "simulated",
        stats: createSimulatedStats(),
      });
    };

    publish();
    simulationTimer = setInterval(publish, SIMULATION_INTERVAL_MS);
  };

  const scheduleReconnect = () => {
    if (!shouldReconnect || reconnectTimer) return;

    const cappedDelay = Math.min(
      MAX_RECONNECT_DELAY_MS,
      INITIAL_RECONNECT_DELAY_MS * 2 ** reconnectAttempt,
    );
    const jitter = Math.round(Math.random() * 250);
    reconnectAttempt += 1;

    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      get().connect();
    }, cappedDelay + jitter);
  };

  return {
    isConnected: false,
    stats: null,
    metricsSource: "unavailable",

    connect: () => {
      shouldReconnect = true;
      if (socket) return;

      clearReconnectTimer();

      let nextSocket: WebSocket;
      try {
        nextSocket = new WebSocket(getWebSocketUrl());
      } catch {
        startSimulation();
        scheduleReconnect();
        return;
      }

      socket = nextSocket;

      nextSocket.onopen = () => {
        if (socket !== nextSocket) return;

        reconnectAttempt = 0;
        clearSimulationTimer();
        set({ isConnected: true, metricsSource: "live" });
      };

      nextSocket.onmessage = (event) => {
        try {
          const metricsEvent = parseMetricsEvent(JSON.parse(event.data));
          if (metricsEvent) {
            set({ stats: metricsEvent.data, metricsSource: "live" });
          }
        } catch {
          // Ignore malformed telemetry instead of corrupting the dashboard state.
        }
      };

      nextSocket.onclose = () => {
        if (socket === nextSocket) {
          socket = null;
        }

        set({ isConnected: false });

        if (shouldReconnect) {
          startSimulation();
          scheduleReconnect();
        }
      };
    },

    disconnect: () => {
      shouldReconnect = false;
      reconnectAttempt = 0;
      clearReconnectTimer();
      clearSimulationTimer();

      const currentSocket = socket;
      socket = null;
      currentSocket?.close();

      set({ isConnected: false, metricsSource: "unavailable", stats: null });
    },
  };
});
