# Task: Implement run_shell_monitored CPU & RSS Process Kill Monitor (Sub-Epic: 07_Resource Quotas & Constraints)

## Covered Requirements
- [3_MCP-REQ-SEC-002]

## 1. Initial Test Written
- [ ] In `packages/mcp-server/src/__tests__/run-shell-monitored.test.ts`, write unit tests for a `runShellMonitored(command: string, opts: MonitoredShellOptions): Promise<ShellResult>` function:
  - Assert that if a spawned process exceeds `rssLimitBytes` (default `4 * 1024 ** 3` = 4 GB) for at least one polling interval, it is killed with `SIGKILL` and a `ResourceLimitExceededError` is thrown with `reason: 'rss'`.
  - Assert that if a spawned process holds CPU usage ≥ 100% (single core saturation) for longer than `cpuSustainedMs` (default `10_000` ms = 10 seconds), it is killed with `SIGKILL` and a `ResourceLimitExceededError` is thrown with `reason: 'cpu'`.
  - Assert that if the process exits normally before any limit is exceeded, `runShellMonitored` resolves with `{ exitCode, stdout, stderr }`.
  - Assert that the polling interval defaults to `1_000` ms and can be overridden via `opts.pollIntervalMs`.
  - Assert that when the process is killed, the monitor polling loop is stopped (no further `setInterval` callbacks fire after kill).
  - Use Jest fake timers and mock `process-stats` (or `pidusage`) to simulate RSS and CPU readings without spawning real processes.
- [ ] Write a separate test asserting that `ResourceLimitExceededError` includes `{ pid, reason, value, limit }` fields for downstream telemetry.

## 2. Task Implementation
- [ ] Create `packages/mcp-server/src/tools/run-shell-monitored.ts`:
  - Export `interface MonitoredShellOptions { rssLimitBytes?: number; cpuSustainedMs?: number; pollIntervalMs?: number; }`.
  - Export `class ResourceLimitExceededError extends Error { constructor(public pid: number, public reason: 'rss' | 'cpu', public value: number, public limit: number) { super(`Process ${pid} exceeded ${reason} limit: ${value} > ${limit}`); } }`.
  - Implement `runShellMonitored` using Node.js `child_process.spawn` to launch the command.
  - Use the `pidusage` npm package (or equivalent) to sample `{ cpu, memory }` at each `pollIntervalMs` tick via `setInterval`.
  - Track consecutive CPU-over-limit ticks: maintain a `cpuOverCount` counter; reset to 0 when CPU drops below 100%; kill when `cpuOverCount * pollIntervalMs >= cpuSustainedMs`.
  - On any limit breach: call `child.kill('SIGKILL')`, clear the `setInterval`, and reject with `ResourceLimitExceededError`.
  - Accumulate stdout/stderr in buffers; resolve with `{ exitCode, stdout, stderr }` on normal exit.
  - Apply defaults: `rssLimitBytes = 4 * 1024 ** 3`, `cpuSustainedMs = 10_000`, `pollIntervalMs = 1_000`.
- [ ] Register `run_shell_monitored` as an MCP tool handler in `packages/mcp-server/src/index.ts` using the existing tool registration pattern, accepting `{ command: string }` as input.
- [ ] Add `pidusage` to `packages/mcp-server/package.json` dependencies.

## 3. Code Review
- [ ] Verify the `cpuSustainedMs` check uses cumulative time (counter × interval), not a single instantaneous reading, to avoid spurious kills from momentary CPU spikes.
- [ ] Confirm RSS limit is exactly `4 * 1024 ** 3` bytes (4 GiB) per `3_MCP-REQ-SEC-002`.
- [ ] Confirm sustained CPU threshold is `cpuOverCount * pollIntervalMs >= 10_000` ms (10 seconds at 100% CPU).
- [ ] Verify `setInterval` handle is always cleared on process exit, error, or kill to prevent timer leaks.
- [ ] Confirm `ResourceLimitExceededError` is exported from `packages/mcp-server/src/index.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="run-shell-monitored"` and confirm all tests pass.
- [ ] Verify with `pnpm --filter @devs/mcp-server test --coverage` that `run-shell-monitored.ts` achieves ≥ 90% branch coverage.

## 5. Update Documentation
- [ ] Add a `run_shell_monitored` entry to `packages/mcp-server/README.md` documenting:
  - Input schema: `{ command: string }`.
  - Kill conditions: 4 GB RSS exceeded OR CPU ≥ 100% sustained for 10 s.
  - Error type returned on kill: `ResourceLimitExceededError` with fields `pid`, `reason`, `value`, `limit`.
- [ ] Update `.agent/decisions.md` with: "`pidusage` is used for cross-platform process stats sampling in `run_shell_monitored`; `procfs` is not used directly to maintain macOS/Windows compatibility."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server build` and confirm compilation succeeds with zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="run-shell-monitored" --ci` in the CI pipeline; confirm exit code is 0.
