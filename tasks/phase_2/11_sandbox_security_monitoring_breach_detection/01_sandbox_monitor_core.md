# Task: Implement SandboxMonitor Core with SECURITY_PAUSE Trigger (Sub-Epic: 11_Sandbox Security Monitoring & Breach Detection)

## Covered Requirements
- [9_ROADMAP-REQ-SEC-004], [4_USER_FEATURES-REQ-082]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/monitor/__tests__/SandboxMonitor.test.ts`.
- [ ] Write a unit test that instantiates `SandboxMonitor` with a mock `SandboxProcess` and verifies it emits a `breach` event and calls `kill()` on the process when `detectBreach()` returns `true`.
- [ ] Write a unit test that verifies `SandboxMonitor` transitions the sandbox state to `SECURITY_PAUSE` when a breach is detected, by asserting the `SandboxStateManager.setState('SECURITY_PAUSE')` mock is called.
- [ ] Write a unit test that verifies `SandboxMonitor` emits a structured `SecurityEvent` object with fields: `eventType: 'BREACH'`, `sandboxId`, `timestamp`, `reason`, and `pid`.
- [ ] Write a unit test that verifies `SandboxMonitor.start()` begins polling the process at a configurable interval (default 1000ms) and `SandboxMonitor.stop()` halts polling.
- [ ] Write an integration test in `packages/sandbox/src/monitor/__tests__/SandboxMonitor.integration.test.ts` that spawns a real child process inside a Docker sandbox, calls `SandboxMonitor.start()`, simulates a breach signal via the `--breach-test` flag, and asserts the process PID is no longer in the OS process table after `kill()` is called.
- [ ] Write a test that verifies `SandboxMonitor` logs all `SecurityEvent` objects to the `SecurityEventLog` (mock) with at least the fields: `sandboxId`, `eventType`, `timestamp`, `reason`.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/monitor/SandboxMonitor.ts`.
- [ ] Define a `SandboxMonitorConfig` interface with fields: `pollIntervalMs: number` (default 1000), `sandboxId: string`, `processHandle: ChildProcess`.
- [ ] Implement `SandboxMonitor` class extending `EventEmitter` with methods:
  - `start(): void` — begins a `setInterval` polling loop calling `_checkForBreach()`.
  - `stop(): void` — clears the polling interval.
  - `_checkForBreach(): Promise<void>` — calls each registered `BreachDetector` in sequence; if any returns `true`, calls `_handleBreach(reason: string)`.
  - `_handleBreach(reason: string): void` — kills the process via `processHandle.kill('SIGKILL')`, calls `SandboxStateManager.setState('SECURITY_PAUSE')`, emits a `breach` event with a `SecurityEvent` payload, and logs the event to `SecurityEventLog`.
- [ ] Define `SecurityEvent` interface in `packages/sandbox/src/monitor/types.ts`:
  ```ts
  interface SecurityEvent {
    eventType: 'BREACH' | 'RESOURCE_EXHAUSTION' | 'NETWORK_VIOLATION';
    sandboxId: string;
    timestamp: string; // ISO 8601
    reason: string;
    pid: number;
  }
  ```
- [ ] Create `packages/sandbox/src/monitor/SandboxStateManager.ts` with a singleton `SandboxStateManager` that tracks state as `'RUNNING' | 'PAUSED' | 'SECURITY_PAUSE' | 'STOPPED'` and exposes `setState(state)` and `getState()` methods.
- [ ] Create `packages/sandbox/src/monitor/SecurityEventLog.ts` that appends `SecurityEvent` objects to an in-memory ring buffer (max 1000 entries) and exposes `getAll(): SecurityEvent[]` and `clear(): void`.
- [ ] Export all public types and classes from `packages/sandbox/src/monitor/index.ts`.

## 3. Code Review

- [ ] Verify `SandboxMonitor` uses `SIGKILL` (not `SIGTERM`) to ensure immediate process termination on breach — partial kills are a security risk.
- [ ] Verify the polling loop uses `setInterval` and is properly cleared on `stop()` to prevent memory leaks.
- [ ] Verify `_handleBreach` is idempotent — calling it multiple times must not kill or log duplicates (use a `_breachHandled: boolean` guard flag).
- [ ] Verify `SandboxStateManager` is a true singleton with no race conditions on concurrent state transitions.
- [ ] Verify all `SecurityEvent` timestamps are UTC ISO 8601 (`new Date().toISOString()`).
- [ ] Verify the `SecurityEventLog` ring buffer does not grow unbounded.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="SandboxMonitor"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/sandbox test:integration -- --testPathPattern="SandboxMonitor.integration"` and confirm the integration test passes.
- [ ] Confirm test coverage for `SandboxMonitor.ts` is ≥ 90% (branches and statements) by inspecting the coverage report.

## 5. Update Documentation

- [ ] Add a `## SandboxMonitor` section to `packages/sandbox/README.md` describing: purpose, `start()`/`stop()` API, `breach` event shape, `SECURITY_PAUSE` state, and how to register custom `BreachDetector` instances.
- [ ] Update `packages/sandbox/src/monitor/types.ts` JSDoc comments for all exported interfaces.
- [ ] Add an entry to `.agent/memory/phase_2_decisions.md`: "SandboxMonitor uses SIGKILL on breach and transitions state to SECURITY_PAUSE. The SecurityEventLog is a capped ring buffer (1000 entries)."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageReporters=json-summary` and parse `coverage-summary.json` to assert `SandboxMonitor.ts` has `statements.pct >= 90`.
- [ ] Run the integration test suite with `pnpm --filter @devs/sandbox test:integration` and assert exit code is `0`.
- [ ] Verify no running child process with the test sandbox PID remains after the integration test by running `ps -p <pid>` and asserting a non-zero exit code.
