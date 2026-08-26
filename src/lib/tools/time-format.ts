/**
 * Clock formatting for the stopwatch (shared shape with the Pomodoro timer).
 */

/** Milliseconds → "MM:SS.cc", with an hour prefix past one hour. */
export function formatClock(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "00:00.00";
  const centiseconds = Math.floor(ms / 10) % 100;
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const cs = String(centiseconds).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}.${cs}` : `${mm}:${ss}.${cs}`;
}

/** Compact "1m 23s" style durations for lap deltas. */
export function formatLapDelta(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
