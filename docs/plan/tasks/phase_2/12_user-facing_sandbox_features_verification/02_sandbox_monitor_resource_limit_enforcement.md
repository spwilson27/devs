# Task: SandboxMonitor Resource Limit Enforcement & User Alerting (Sub-Epic: 12_User-Facing Sandbox Features & Verification)

## Covered Requirements
- [4_USER_FEATURES-REQ-039]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/SandboxMonitor.test.ts`, write unit tests for `SandboxMonitor`:
  - Mock a `SandboxProvider` instance that exposes `getResourceStats(): Promise<ResourceStats>` returning controllable CPU and memory values.
  - Test that when `resourceStats.memoryMb` exceeds the configured `memoryMb` limit, `SandboxMonitor` calls `sandbox.kill('RESOURCE_LIMIT_EXCEEDED')` exactly once.
  - Test that when `resourceStats.cpuPercent` exceeds 100% × `cpuCores` for more than 30 consecutive seconds, `SandboxMonitor` calls `sandbox.kill('RESOURCE_LIMIT_EXCEEDED')`.
  - Test that `SandboxMonitor` emits a `resourceLimitExceeded` event with payload `{ sandboxId: string; reason: 'memory' | 'cpu'; actualValue: number; limitValue: number; timestamp: string }` immediately before killing.
  - Test that `SandboxMonitor` does NOT kill the sandbox when stats are within limits.
  - Test that `SandboxMonitor.stop()` clears the polling interval and no further checks occur.
  - Test polling interval: verify that `getResourceStats` is called every 5 seconds (use `jest.useFakeTimers()`).
- [ ] In `packages/vscode-extension/src/panels/__tests__/SandboxStatusBar.test.ts`, write unit tests for `SandboxStatusBar`:
  - Test that when a `resourceLimitExceeded` event is received, a VS Code warning notification is shown with the text `"Resource Limit Exceeded: Sandbox {sandboxId} killed ({reason})"`.
  - Test that the status bar item updates its text to `"⚠ Sandbox Killed"` with a red background color.
  - Test that clicking the status bar item opens the Output Channel with the full `ResourceLimitExceededEvent` details.
- [ ] In `packages/core/src/sandbox/__tests__/SandboxMonitor.integration.test.ts`, write an integration test:
  - Spin up a real (or test-double) Docker container.
  - Instruct it to allocate memory beyond the configured limit via a stress script.
  - Assert that `SandboxMonitor` kills the container within 15 seconds and emits the `resourceLimitExceeded` event.

## 2. Task Implementation
- [ ] Define `ResourceStats` and `ResourceLimitExceededEvent` interfaces in `packages/core/src/sandbox/types.ts`:
  ```typescript
  export interface ResourceStats {
    sandboxId: string;
    memoryMb: number;
    cpuPercent: number;
    timestamp: string; // ISO 8601
  }
  export interface ResourceLimitExceededEvent {
    sandboxId: string;
    reason: 'memory' | 'cpu';
    actualValue: number;
    limitValue: number;
    timestamp: string;
  }
  ```
- [ ] Add `getResourceStats(): Promise<ResourceStats>` to the `SandboxProvider` abstract class in `packages/core/src/sandbox/SandboxProvider.ts`.
- [ ] Implement `getResourceStats()` in `DockerDriver` (`packages/core/src/sandbox/DockerDriver.ts`) by parsing `docker stats --no-stream --format json <containerId>` output.
- [ ] Implement `getResourceStats()` in `WebContainerDriver` (`packages/core/src/sandbox/WebContainerDriver.ts`) using the WebContainers API `container.fs.watch` performance hooks; return `cpuPercent: 0` if not available (WebContainers does not expose CPU stats).
- [ ] Implement `SandboxMonitor` class in `packages/core/src/sandbox/SandboxMonitor.ts`:
  - Constructor accepts `SandboxProvider`, `SandboxConfig`, and optional `pollIntervalMs` (default: `5000`).
  - Maintains a `cpuExceedStartTime: number | null` to track sustained CPU overuse.
  - On each poll: fetch `getResourceStats()`; check memory and CPU; emit `resourceLimitExceeded` and call `sandbox.kill()` if limits are breached.
  - Implements `EventEmitter`; exposes `start()` and `stop()` lifecycle methods.
- [ ] Integrate `SandboxMonitor` startup into `SandboxLifecycleManager.start()` in `packages/core/src/sandbox/SandboxLifecycleManager.ts`, starting the monitor after the sandbox is ready and stopping it on cleanup.
- [ ] Implement `SandboxStatusBar` in `packages/vscode-extension/src/panels/SandboxStatusBar.ts`:
  - Subscribe to `SandboxMonitor`'s `resourceLimitExceeded` event via the VS Code extension message bus.
  - Show `vscode.window.showWarningMessage` with the sandbox ID and reason.
  - Update the status bar item color and text.
  - Register an `onClick` handler to show details in the Output Channel.

## 3. Code Review
- [ ] Verify `SandboxMonitor` uses `EventEmitter` correctly — no raw callbacks that could cause memory leaks if not removed.
- [ ] Confirm the CPU sustained-overuse window (30 seconds) is a named constant `CPU_OVERUSE_WINDOW_MS = 30_000` in `packages/core/src/sandbox/constants.ts`, not a magic number.
- [ ] Confirm `DockerDriver.getResourceStats()` handles the case where `docker stats` returns an empty response (container not yet started) without throwing.
- [ ] Confirm `SandboxMonitor.stop()` is always called in the `finally` block of `SandboxLifecycleManager` to prevent interval leaks.
- [ ] Confirm the VS Code alert text matches the exact string specified in the tests to avoid silent regressions.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SandboxMonitor` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/vscode-extension test -- --testPathPattern=SandboxStatusBar` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SandboxMonitor.integration` and confirm the integration test passes (requires Docker daemon).
- [ ] Run `pnpm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/user-guide/sandbox-monitoring.md`:
  - Document the `resourceLimitExceeded` event payload schema.
  - Explain the 30-second CPU sustained-overuse window.
  - Document the VS Code status bar indicator behavior.
- [ ] Update `.agent/memory/phase_2_decisions.md` with the decision to use a 5-second polling interval for `SandboxMonitor` and a 30-second CPU overuse window.
- [ ] Add a JSDoc comment on `SandboxMonitor` class explaining the polling lifecycle and event contract.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Execute the following script to verify `SandboxMonitor` kills a sandbox that exceeds memory:
  ```bash
  node scripts/verify_sandbox_monitor.js --driver docker --memory-limit 128 --simulate-oom
  # Expected output: "PASS: SandboxMonitor killed sandbox within limit window"
  # Expected exit code: 0
  ```
- [ ] Confirm the script `scripts/verify_sandbox_monitor.js` exists and runs without unhandled exceptions.
