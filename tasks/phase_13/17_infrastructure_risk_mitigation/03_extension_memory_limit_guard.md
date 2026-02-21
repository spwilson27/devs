# Task: Implement Extension Memory Limit Guard for VSCode Orchestrator Host (Sub-Epic: 17_Infrastructure Risk Mitigation)

## Covered Requirements
- [RISK-402]

## 1. Initial Test Written
- [ ] Create `src/extension/__tests__/memoryGuard.test.ts` with Vitest.
- [ ] Write a unit test `memoryGuard_returnsCurrentUsage` mocking `process.memoryUsage()` to return a known `heapUsed` value and asserting `getMemoryPressure()` returns the correct percentage of `heapTotal`.
- [ ] Write a unit test `memoryGuard_emitsWarningAtThreshold` that mocks heap usage at 75% of the configured warning threshold and asserts a `MEMORY_PRESSURE_WARNING` event is emitted on the orchestrator event bus.
- [ ] Write a unit test `memoryGuard_pausesOrchestratorAtCritical` that mocks heap usage at 90% and asserts the guard calls `orchestrator.pause()` and emits `MEMORY_PRESSURE_CRITICAL`.
- [ ] Write a unit test `memoryGuard_resumesAfterGC` that simulates heap dropping below 60% after a GC cycle and asserts `orchestrator.resume()` is called and `MEMORY_PRESSURE_RESOLVED` is emitted.
- [ ] Write an integration test `extensionHost_spawnsWorkerOnHighMemory` that verifies when heap exceeds the critical threshold the orchestrator offloads the active LangGraph execution to a `worker_threads` Worker and the main extension host thread remains responsive (assert event loop lag < 50 ms via a mock timer).

## 2. Task Implementation
- [ ] Create `src/extension/memoryGuard.ts` exporting class `MemoryGuard`:
  - Constructor accepts `{ warningThresholdPct: number, criticalThresholdPct: number, pollIntervalMs: number, orchestrator: OrchestratorController }`.
  - `start()` begins a `setInterval` poll using `process.memoryUsage()`.
  - Emits typed events (`MEMORY_PRESSURE_WARNING`, `MEMORY_PRESSURE_CRITICAL`, `MEMORY_PRESSURE_RESOLVED`) on an `EventEmitter` bus.
  - On critical: calls `orchestrator.pause()`, logs to `StateManager`, triggers `global.gc()` if `--expose-gc` flag is active.
  - On recovery (heap < 60%): calls `orchestrator.resume()`.
  - `stop()` clears the interval.
- [ ] Add config values to `src/config/extensionConfig.ts`:
  - `MEMORY_WARNING_THRESHOLD_PCT = 75`
  - `MEMORY_CRITICAL_THRESHOLD_PCT = 90`
  - `MEMORY_POLL_INTERVAL_MS = 5000`
- [ ] Create `src/extension/orchestratorWorker.ts` implementing a `worker_threads` Worker entry point that receives a serialized LangGraph state, runs one graph step, and posts the result back to the main thread via `parentPort`.
- [ ] Integrate into `src/extension/extensionHost.ts`: instantiate `MemoryGuard` on extension activation; when `MEMORY_PRESSURE_CRITICAL` fires, serialize current graph state and delegate next step execution to `orchestratorWorker`.
- [ ] Add VSCode `--max-old-space-size` recommendation to `.vscode/launch.json` (e.g., `4096`) as a comment with rationale.

## 3. Code Review
- [ ] Confirm `MemoryGuard` does not retain references to large objects (no memory-leak patterns in the polling closure).
- [ ] Verify Worker serialization uses `structuredClone` or explicit JSON serialization—no shared mutable state across threads.
- [ ] Ensure `orchestrator.pause()` is idempotent: calling it when already paused must not throw.
- [ ] Confirm thresholds are loaded from config, never hardcoded in `MemoryGuard`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest run src/extension/__tests__/memoryGuard.test.ts` and confirm all tests pass.
- [ ] Run `pnpm vitest run --reporter=verbose` for the full suite and verify no regressions.

## 5. Update Documentation
- [ ] Create `src/extension/extension.agent.md` (or update if existing) with a "Memory Pressure Management" section describing thresholds, events, and Worker offloading strategy.
- [ ] Document the `--expose-gc` and `--max-old-space-size` flags in `docs/operations/vscode-extension.md`.
- [ ] Update `CHANGELOG.md`: `feat(extension): memory limit guard with Worker offloading for VSCode host [RISK-402]`.

## 6. Automated Verification
- [ ] Run `pnpm vitest run --reporter=json --outputFile=test-results/memory-guard.json` and assert exit code is `0`.
- [ ] Execute `node scripts/verify_test_results.js test-results/memory-guard.json` and confirm all tests show `status: "passed"`.
