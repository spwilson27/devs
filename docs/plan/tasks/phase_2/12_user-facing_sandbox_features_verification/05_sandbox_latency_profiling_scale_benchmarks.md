# Task: Sandbox Latency Profiling & Scale Benchmarks (Sub-Epic: 12_User-Facing Sandbox Features & Verification)

## Covered Requirements
- [8_RISKS-REQ-139]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/SandboxProvisioning.benchmark.test.ts`, write latency benchmark tests:
  - Test that `SandboxProvider.start()` for a `DockerDriver` sandbox completes (reaches "ready" state) within **30 seconds** for a cold start (image not pre-pulled). Assert using `jest.setTimeout(35000)`.
  - Test that `SandboxProvider.start()` for a `DockerDriver` sandbox completes within **10 seconds** for a warm start (image already pulled and container cached). Assert using `jest.setTimeout(15000)`.
  - Test that `SandboxProvider.start()` for a `WebContainerDriver` sandbox completes within **10 seconds**. Assert using `jest.setTimeout(15000)`.
  - Test that provisioning **5 sandboxes concurrently** (using `Promise.all`) all complete within **60 seconds**. Record individual provisioning times and assert P95 ≤ 30 seconds.
  - Test that provisioning **20 sandboxes sequentially** does not exhibit memory growth > 50MB per sandbox (check Node.js `process.memoryUsage().heapUsed` before and after).
  - Write all timing results to `.devs/reports/sandbox_latency_benchmark.json` in the format:
    ```json
    {
      "driver": "docker|webcontainer",
      "startType": "cold|warm",
      "samples": [{ "durationMs": 12345, "timestamp": "..." }],
      "p50Ms": 12000,
      "p95Ms": 28000,
      "p99Ms": 29500
    }
    ```
- [ ] In `packages/core/src/sandbox/__tests__/SandboxCleanup.test.ts`, write tests for cleanup latency:
  - Test that `SandboxProvider.stop()` completes within **5 seconds** for a Docker container.
  - Test that after `stop()`, the container no longer appears in `docker ps -a` output.
  - Test that after `stop()`, any temporary volumes mounted to the sandbox are removed.

## 2. Task Implementation
- [ ] Add `provisioningStartedAt` and `provisioningReadyAt` timestamps to the `SandboxLifecycleEvent` type in `packages/core/src/sandbox/types.ts`:
  ```typescript
  export interface SandboxLifecycleEvent {
    sandboxId: string;
    event: 'starting' | 'ready' | 'killed' | 'stopped';
    provisioningStartedAt?: string; // ISO 8601
    provisioningReadyAt?: string;   // ISO 8601
    durationMs?: number;
  }
  ```
- [ ] Instrument `DockerDriver.start()` in `packages/core/src/sandbox/DockerDriver.ts`:
  - Record `provisioningStartedAt = Date.now()` before `docker run`.
  - Poll `docker inspect <containerId>` until `State.Status === 'running'`.
  - Record `provisioningReadyAt = Date.now()` when ready.
  - Emit a `SandboxLifecycleEvent` with `durationMs = provisioningReadyAt - provisioningStartedAt`.
- [ ] Instrument `WebContainerDriver.start()` similarly in `packages/core/src/sandbox/WebContainerDriver.ts`.
- [ ] Implement `SandboxLatencyReporter` in `packages/core/src/sandbox/SandboxLatencyReporter.ts`:
  - Subscribes to `SandboxLifecycleEvent` emissions from any `SandboxProvider`.
  - Maintains a rolling window of the last 100 provisioning durations.
  - Computes P50, P95, P99 percentiles using a sorted-insert approach.
  - Persists current stats to `.devs/reports/sandbox_latency_benchmark.json` after each event.
  - Exposes `getStats(): LatencyStats` for programmatic access.
- [ ] Expose `sandbox_provisioning_duration_p50_ms`, `sandbox_provisioning_duration_p95_ms`, and `sandbox_provisioning_duration_p99_ms` Prometheus gauges via `packages/core/src/metrics/MetricsRegistry.ts`.
- [ ] Create `scripts/run_sandbox_latency_benchmark.sh`:
  ```bash
  #!/bin/bash
  echo "Running sandbox latency benchmark..."
  pnpm --filter @devs/core test -- --testPathPattern=SandboxProvisioning.benchmark --verbose 2>&1 | tee .devs/reports/sandbox_latency_benchmark.txt
  node scripts/analyze_sandbox_latency.js
  ```
- [ ] Create `scripts/analyze_sandbox_latency.js`:
  - Read `.devs/reports/sandbox_latency_benchmark.json`.
  - Print a formatted table of P50/P95/P99 by driver and start type.
  - Exit with code 1 if any P95 value exceeds the target (30s for Docker cold, 10s for WebContainer).

## 3. Code Review
- [ ] Verify that `SandboxLatencyReporter` does not block the `SandboxProvider` lifecycle — all persistence is asynchronous (`setImmediate` or `queueMicrotask` wrapping `fs.writeFile`).
- [ ] Confirm that benchmark tests are tagged with `@group benchmark` and excluded from the default `pnpm test` run (only run explicitly via `--testPathPattern`), to avoid slowing CI.
- [ ] Confirm that `SandboxLifecycleEvent` is emitted for ALL terminal states (`ready`, `killed`, `stopped`) and that `durationMs` is always populated for the `ready` event.
- [ ] Confirm `analyze_sandbox_latency.js` uses percentile calculation matching the method in `SandboxLatencyReporter` (identical algorithm) to avoid reporting discrepancies.
- [ ] Confirm `.devs/reports/` directory is created if it does not exist before writing benchmark output.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SandboxCleanup` and confirm all cleanup latency tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SandboxProvisioning.benchmark` (requires Docker daemon) and confirm all latency assertions pass.
- [ ] Run `bash scripts/run_sandbox_latency_benchmark.sh` and confirm it exits with code 0 and `.devs/reports/sandbox_latency_benchmark.json` is written.
- [ ] Run `pnpm test` (excluding benchmark group) and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/operations/sandbox-latency-benchmarks.md`:
  - Document the P50/P95/P99 targets for Docker (cold/warm) and WebContainers.
  - Explain how to run the benchmark script and interpret the JSON output.
  - Link to the Prometheus metrics exposed for ongoing production monitoring.
- [ ] Update `.agent/memory/phase_2_decisions.md` with the decision to use a rolling 100-sample window for percentile calculation in `SandboxLatencyReporter`, noting the trade-off with a full histogram approach.
- [ ] Update `docs/security/sandbox-audit-log.md` to reference the new `sandbox_provisioning_duration_*` Prometheus metrics as signals for detecting latency regressions at scale.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Run `bash scripts/run_sandbox_latency_benchmark.sh` and confirm exit code 0.
- [ ] Run the following to verify the JSON report is valid and contains required keys:
  ```bash
  node -e "
    const fs = require('fs');
    const report = JSON.parse(fs.readFileSync('.devs/reports/sandbox_latency_benchmark.json', 'utf8'));
    const required = ['driver', 'startType', 'samples', 'p50Ms', 'p95Ms', 'p99Ms'];
    const missing = required.filter(k => !(k in report));
    if (missing.length) { console.error('Missing keys:', missing); process.exit(1); }
    if (report.p95Ms > 30000) { console.error('P95 exceeds 30s target:', report.p95Ms); process.exit(1); }
    console.log('PASS: Latency benchmark report valid, P95 within target');
    process.exit(0);
  "
  ```
- [ ] Verify Prometheus metrics are registered:
  ```bash
  node -e "
    const { MetricsRegistry } = require('./packages/core/dist/metrics/MetricsRegistry');
    const metrics = MetricsRegistry.getAll();
    const names = metrics.map(m => m.name);
    const required = ['sandbox_provisioning_duration_p50_ms', 'sandbox_provisioning_duration_p95_ms', 'sandbox_provisioning_duration_p99_ms'];
    const missing = required.filter(n => !names.includes(n));
    process.exit(missing.length === 0 ? 0 : 1);
  "
  # Expected exit code: 0
  ```
