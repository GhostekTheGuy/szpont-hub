// Lightweight perf logger. Active in dev, or in any env when PERF_LOG=1.
// Logs are server-side console only — never reach the client.
const enabled =
  process.env.NODE_ENV !== 'production' || process.env.PERF_LOG === '1';

export async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!enabled) return fn();
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const ms = performance.now() - start;
    console.log(`[perf] ${label} ${ms.toFixed(1)}ms`);
  }
}
