import * as os from "node:os";

export interface SystemMetrics {
  cpuUsagePercent: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  observedAt: string;
}

export interface CpuSample {
  idle: number;
  total: number;
}

export interface MetricsService {
  isReady: () => boolean;
  sample: () => SystemMetrics;
  snapshot: () => SystemMetrics;
}

interface MetricsDependencies {
  cpuInfo?: () => os.CpuInfo[];
  freeMemory?: () => number;
  totalMemory?: () => number;
  now?: () => Date;
}

export const readCpuSample = (cpuInfo: os.CpuInfo[]): CpuSample =>
  cpuInfo.reduce<CpuSample>(
    (sample, cpu) => {
      const total = Object.values(cpu.times).reduce(
        (sum, value) => sum + value,
        0,
      );

      return {
        idle: sample.idle + cpu.times.idle,
        total: sample.total + total,
      };
    },
    { idle: 0, total: 0 },
  );

export const calculateCpuUsage = (
  previous: CpuSample | undefined,
  current: CpuSample,
): number => {
  if (!previous) return 0;

  const totalDelta = current.total - previous.total;
  const idleDelta = current.idle - previous.idle;

  if (totalDelta <= 0) return 0;

  return Math.max(
    0,
    Math.min(100, ((totalDelta - idleDelta) / totalDelta) * 100),
  );
};

export const createMetricsService = (
  dependencies: MetricsDependencies = {},
): MetricsService => {
  const cpuInfo = dependencies.cpuInfo ?? os.cpus;
  const freeMemory = dependencies.freeMemory ?? os.freemem;
  const totalMemory = dependencies.totalMemory ?? os.totalmem;
  const now = dependencies.now ?? (() => new Date());
  let previousCpuSample: CpuSample | undefined;
  let latestMetrics: SystemMetrics | undefined;

  const sample = (): SystemMetrics => {
    const currentCpuSample = readCpuSample(cpuInfo());
    const cpuUsage = calculateCpuUsage(previousCpuSample, currentCpuSample);
    previousCpuSample = currentCpuSample;

    const memoryTotalBytes = totalMemory();
    const memoryUsedBytes = Math.max(0, memoryTotalBytes - freeMemory());

    latestMetrics = {
      cpuUsagePercent: Math.round(cpuUsage * 10) / 10,
      memoryUsedBytes,
      memoryTotalBytes,
      observedAt: now().toISOString(),
    };

    return latestMetrics;
  };

  sample();

  return {
    isReady: () => latestMetrics !== undefined,
    sample,
    snapshot: () => latestMetrics!,
  };
};
