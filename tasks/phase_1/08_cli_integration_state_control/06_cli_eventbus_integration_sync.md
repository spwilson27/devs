# Task: CLI Integration with EventBus for 0ms Desync (Sub-Epic: 08_CLI Integration & State Control)

## Covered Requirements
- [1_PRD-REQ-INT-004], [9_ROADMAP-REQ-037]

## 1. Initial Test Written
- [ ] Write integration tests in `packages/cli/tests/sync.spec.ts` to verify:
    - Spawning a CLI `status` or a long-running TUI task.
    - Manually updating the `state.sqlite` database and emitting a `STATE_CHANGE` event.
    - Verifying that the CLI output (or TUI state) updates immediately.
    - Testing desync by measuring the time between the event and the CLI refresh.

## 2. Task Implementation
- [ ] Update the CLI to use the `@devs/core/events` package.
- [ ] Implement a `LiveWatcher` in the CLI:
    - Subscribe to `STATE_CHANGE` events from the `EventBus`.
    - When an event is received, reload the state from `state.sqlite`.
    - Refresh the CLI TUI (e.g., if using `blessed`, `ink`, or a simple log refresh).
- [ ] Implement a `CLI-Extension` handshake to ensure they are connected to the same `EventBus` for the same project.
- [ ] Use `chokidar` or a similar file-watching mechanism as a fallback for the `EventBus` for state changes.

## 3. Code Review
- [ ] Verify that the CLI doesn't reload too frequently (implementing a simple debounce if necessary).
- [ ] Ensure that `0ms desync` goal is met for most state transitions.
- [ ] Check that the CLI handles `EventBus` connection failures by falling back to polling or a manual refresh.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/cli` and ensure sync tests pass.

## 5. Update Documentation
- [ ] Document the synchronization mechanism in the CLI README.
- [ ] Add troubleshooting steps for state synchronization issues.

## 6. Automated Verification
- [ ] Run a test that emits a state change event and verify the CLI's reaction time is within the acceptable threshold (< 10ms).
- [ ] Verify using two terminal windows (one running a mock orchestrator and one running `devs status --watch`) that changes are reflected instantly.
