# Task: Implement CPU & Resource Exhaustion Breach Detector (Sub-Epic: 11_Sandbox Security Monitoring & Breach Detection)

## Covered Requirements
- [4_USER_FEATURES-REQ-082], [9_ROADMAP-REQ-SEC-004]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/monitor/__tests__/CpuExhaustionDetector.test.ts`.
- [ ] Write a unit test that creates a `CpuExhaustionDetector` with a mock `ProcessStatsProvider` that returns 100% CPU usage for 10 consecutive seconds, and asserts `detectBreach()` returns `true` with `reason: 'CPU_EXHAUSTION'`.
- [ ] Write a unit test that asserts `detectBreach()` returns `false` when CPU spikes to 100% for only 9 seconds (one poll below threshold).
- [ ] Write a unit test that asserts the CPU spike timer resets to 0 when CPU drops below the threshold (default 95%) between polls.
- [ ] Write a unit test that asserts `CpuExhaustionDetector` reads CPU stats via `ProcessStatsProvider.getCpuPercent(pid)` on every `detectBreach()` call.
- [ ] Write a unit test with a `MemoryExhaustionDetector` that triggers a breach when RSS memory exceeds a configurable limit (default 4096 MB) for 3 consecutive polls.
- [ ] Write a unit test that verifies the combined `ResourceExhaustionDetector` (wrapping both CPU and memory detectors) emits a `SecurityEvent` with `eventType: 'RESOURCE_EXHAUSTION'` when either sub-detector fires.
- [ ] Create an integration test that spawns a real CPU-burning child process (`while(true){}` via `node -e`), starts `SandboxMonitor` with `CpuExhaustionDetector`, and asserts the process is killed within 15 seconds.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/monitor/detectors/CpuExhaustionDetector.ts`.
- [ ] Define `BreachDetector` interface in `packages/sandbox/src/monitor/detectors/types.ts`:
  ```ts
  interface BreachDetector {
    detectBreach(pid: number): Promise<{ breached: boolean; reason?: string }>;
    reset(): void;
  }
  ```
- [ ] Implement `CpuExhaustionDetector` implementing `BreachDetector`:
  - Constructor accepts `{ cpuThresholdPct: number = 95, sustainedMs: number = 10000, pollIntervalMs: number = 1000 }`.
  - Maintains `_spikeStartTime: number | null` internally.
  - On each `detectBreach(pid)` call: fetch CPU via `ProcessStatsProvider.getCpuPercent(pid)`. If CPU ≥ `cpuThresholdPct` and `_spikeStartTime` is null, record `Date.now()` as `_spikeStartTime`. If CPU drops below threshold, reset `_spikeStartTime = null`. If `Date.now() - _spikeStartTime >= sustainedMs`, return `{ breached: true, reason: 'CPU_EXHAUSTION' }`.
  - `reset()` sets `_spikeStartTime = null`.
- [ ] Create `packages/sandbox/src/monitor/detectors/MemoryExhaustionDetector.ts` implementing `BreachDetector`:
  - Constructor accepts `{ memoryLimitMb: number = 4096, consecutiveBreachCount: number = 3 }`.
  - Tracks `_overLimitCount: number` internally.
  - On `detectBreach(pid)`: fetch RSS via `ProcessStatsProvider.getRssMb(pid)`. Increment `_overLimitCount` if over limit, reset to 0 otherwise. Return `{ breached: true, reason: 'MEMORY_EXHAUSTION' }` when `_overLimitCount >= consecutiveBreachCount`.
- [ ] Create `packages/sandbox/src/monitor/ProcessStatsProvider.ts`:
  - Implement `getCpuPercent(pid: number): Promise<number>` using `/proc/<pid>/stat` on Linux or `ps -o %cpu= -p <pid>` on macOS/Darwin.
  - Implement `getRssMb(pid: number): Promise<number>` using `/proc/<pid>/status` on Linux or `ps -o rss= -p <pid>` (divided by 1024) on macOS/Darwin.
  - Throw `ProcessNotFoundError` if the PID does not exist.
- [ ] Register `CpuExhaustionDetector` and `MemoryExhaustionDetector` as default detectors in `SandboxMonitor` constructor.
- [ ] Export all new detector classes from `packages/sandbox/src/monitor/detectors/index.ts`.

## 3. Code Review

- [ ] Verify `CpuExhaustionDetector` does not use wall-clock time shortcuts — the 10-second window must be based on actual elapsed milliseconds, not poll count, to be resilient to variable poll intervals.
- [ ] Verify `ProcessStatsProvider` handles the `ProcessNotFoundError` case gracefully (process already dead) by returning `0` for CPU/memory without throwing to the caller.
- [ ] Verify `MemoryExhaustionDetector` requires 3 consecutive over-limit readings (not just one) to avoid false positives from transient spikes.
- [ ] Verify `reset()` is called on all detectors when `SandboxMonitor.stop()` is invoked.
- [ ] Verify the platform-detection logic (`process.platform`) is encapsulated in `ProcessStatsProvider`, not in individual detectors.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="CpuExhaustionDetector|MemoryExhaustionDetector|ProcessStatsProvider"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration -- --testPathPattern="cpu_exhaustion.integration"` and confirm the CPU-burning child process is killed within 15 seconds.
- [ ] Confirm test coverage for `detectors/` directory is ≥ 90%.

## 5. Update Documentation

- [ ] Add a `### Resource Exhaustion Detectors` subsection to `packages/sandbox/README.md` documenting the `CpuExhaustionDetector` and `MemoryExhaustionDetector` default thresholds and how to override them via `SandboxMonitorConfig`.
- [ ] Document `ProcessStatsProvider` platform support (Linux `/proc` vs macOS `ps`) in `packages/sandbox/README.md`.
- [ ] Append to `.agent/memory/phase_2_decisions.md`: "CpuExhaustionDetector triggers after 10 sustained seconds at ≥95% CPU. MemoryExhaustionDetector triggers after 3 consecutive polls over 4096 MB RSS. ProcessStatsProvider abstracts platform differences."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageReporters=json-summary` and assert `detectors/CpuExhaustionDetector.ts` and `detectors/MemoryExhaustionDetector.ts` both have `statements.pct >= 90`.
- [ ] Run the integration test and verify the process is dead (`ps -p <pid>` exits non-zero) within 15 seconds of `SandboxMonitor.start()`.
- [ ] Run `pnpm --filter @devs/sandbox lint` and assert zero lint errors on all new files.
