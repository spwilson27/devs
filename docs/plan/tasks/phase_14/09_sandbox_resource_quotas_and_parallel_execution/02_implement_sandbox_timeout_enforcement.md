# Task: Implement Sandbox Timeout Enforcement (300s Hard Limit) (Sub-Epic: 09_Sandbox Resource Quotas and Parallel Execution)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-005]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/SandboxTimeoutEnforcer.test.ts`.
- [ ] Write a unit test `kills_process_after_timeout_ms` that:
  - Creates a `SandboxTimeoutEnforcer` with `timeoutMs: 500` (short value for testing).
  - Mocks a `childProcess.kill` method.
  - Calls `enforcer.watch(mockChildProcess, sandboxId)`.
  - Advances fake timers by 501ms using `jest.useFakeTimers()` / `jest.advanceTimersByTime()`.
  - Asserts `mockChildProcess.kill('SIGKILL')` was called exactly once.
- [ ] Write a unit test `cancels_timer_on_clear` that asserts calling `enforcer.clear(sandboxId)` before the timeout elapses prevents `kill` from being called.
- [ ] Write a unit test `emits_timeout_event` that asserts the `SandboxTimeoutEnforcer` emits a `'timeout'` event with `{ sandboxId, timeoutMs }` payload when the deadline is exceeded.
- [ ] Write a unit test `default_timeout_is_300_seconds` that constructs `new SandboxTimeoutEnforcer()` with no arguments and reads `enforcer.timeoutMs`, asserting it equals `300_000`.
- [ ] Confirm all tests fail (RED) before implementation.

## 2. Task Implementation
- [ ] Create `src/sandbox/SandboxTimeoutEnforcer.ts`.
- [ ] Import `EventEmitter` from `node:events` and `ChildProcess` from `node:child_process`.
- [ ] Define `SandboxTimeoutEnforcerOptions = { timeoutMs?: number }` with default `300_000`.
- [ ] Export `class SandboxTimeoutEnforcer extends EventEmitter`:
  - Constructor accepts `SandboxTimeoutEnforcerOptions`; store `this.timeoutMs`.
  - `private timers = new Map<string, NodeJS.Timeout>()`.
  - `watch(proc: ChildProcess, sandboxId: string): void`:
    - If `sandboxId` already in `timers`, call `clear(sandboxId)` first.
    - Set a `setTimeout` for `this.timeoutMs` that:
      1. Calls `proc.kill('SIGKILL')`.
      2. Emits `'timeout'` event with `{ sandboxId, timeoutMs: this.timeoutMs }`.
    - Store the timer handle in `this.timers`.
  - `clear(sandboxId: string): void`:
    - If the timer exists, call `clearTimeout` and delete from the map.
  - Expose `readonly timeoutMs: number` getter.
- [ ] Add JSDoc requirement tag: `// [5_SECURITY_DESIGN-REQ-SEC-STR-005]`.
- [ ] Export a singleton `defaultTimeoutEnforcer = new SandboxTimeoutEnforcer()` for use by the sandbox runner.

## 3. Code Review
- [ ] Verify `SIGKILL` (not `SIGTERM`) is used to guarantee immediate termination and prevent signal-handling bypass.
- [ ] Confirm no global mutable state outside of class instances; the singleton export is acceptable.
- [ ] Verify the `EventEmitter` inheritance pattern is used for timeout notifications rather than callbacks, to allow multiple listeners.
- [ ] Check that calling `clear()` on an unknown `sandboxId` is a safe no-op (no throw).
- [ ] Verify that `watch()` replaces an existing timer for the same `sandboxId` rather than stacking multiple timers.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/SandboxTimeoutEnforcer.test.ts --coverage` and confirm all tests GREEN, 100% branch coverage.
- [ ] Run the full test suite `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `src/sandbox/sandbox.agent.md` with a section "## Timeout Enforcement" documenting: the 300s default, the SIGKILL escalation, and the `'timeout'` event payload shape.
- [ ] Document the singleton `defaultTimeoutEnforcer` usage pattern in `src/sandbox/index.ts` file comment.
- [ ] Add `SandboxTimeoutEnforcer` and `defaultTimeoutEnforcer` to `src/sandbox/index.ts` exports.

## 6. Automated Verification
- [ ] Run `npx jest src/sandbox/__tests__/SandboxTimeoutEnforcer.test.ts --json --outputFile=test-results/timeout-enforcer.json` and assert `numFailedTests: 0` in the output file.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
