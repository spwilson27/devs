# Task: Implement Per-Tool-Call Execution Time Cap (Sub-Epic: 07_Resource Quotas & Constraints)

## Covered Requirements
- [TAS-021], [1_PRD-REQ-SEC-004], [1_PRD-REQ-SEC-010]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/execution-timeout.test.ts`, write unit tests for a `withExecutionTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T>` utility:
  - Assert that if `fn` resolves within `timeoutMs`, the result is returned unchanged.
  - Assert that if `fn` does not resolve within `timeoutMs`, a `ExecutionTimeoutError` is thrown with `message` including the timeout value in seconds.
  - Assert that after `ExecutionTimeoutError` is thrown, the underlying promise is abandoned (no memory leak — verify using a Jest fake timer that the internal `setTimeout` is cleared).
  - Assert that `DEFAULT_TOOL_CALL_TIMEOUT_MS === 300_000` (5 minutes = 300 seconds, per `1_PRD-REQ-SEC-010`).
- [ ] In `packages/sandbox/src/__tests__/docker-driver-timeout.test.ts`, write tests for `DockerDriver.exec()`:
  - Mock `withExecutionTimeout` and assert it is called with `DEFAULT_TOOL_CALL_TIMEOUT_MS` when no explicit timeout is passed to `exec()`.
  - Assert that if `withExecutionTimeout` rejects with `ExecutionTimeoutError`, `DockerDriver.exec()` re-throws the same error type without wrapping it.
  - Assert that the Docker container is forcibly stopped (via `docker stop --time=0 <id>`) when a timeout occurs.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/utils/execution-timeout.ts`:
  - Export `DEFAULT_TOOL_CALL_TIMEOUT_MS = 300_000`.
  - Export `class ExecutionTimeoutError extends SandboxError { constructor(timeoutMs: number) { super(`Execution exceeded time cap of ${timeoutMs / 1000}s`); } }`.
  - Export `async function withExecutionTimeout<T>(fn: () => Promise<T>, timeoutMs: number = DEFAULT_TOOL_CALL_TIMEOUT_MS): Promise<T>` that races `fn()` against a `setTimeout`-based rejection.
  - Use `clearTimeout` in a `finally` block to prevent timer leaks.
- [ ] In `packages/sandbox/src/drivers/docker-driver.ts`, update the `exec(command: string, opts?: ExecOptions)` method:
  - Wrap the internal `execa` / `child_process.spawn` call with `withExecutionTimeout(…, opts?.timeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS)`.
  - On `ExecutionTimeoutError`, call `this.forceStop()` which runs `docker stop --time=0 <containerId>`, then re-throw.
  - Implement `private async forceStop(): Promise<void>` that calls `docker stop --time=0 ${this.containerId}`.
- [ ] Add `timeoutMs?: number` to the `ExecOptions` interface in `packages/sandbox/src/types.ts`.
- [ ] Also apply `withExecutionTimeout` in `WebContainerDriver.exec()` using the same timeout value.

## 3. Code Review
- [ ] Verify `withExecutionTimeout` is purely functional (no class, no state) so it can be unit-tested and reused across both drivers.
- [ ] Confirm `DEFAULT_TOOL_CALL_TIMEOUT_MS` is exactly `300_000` ms (5 minutes per `1_PRD-REQ-SEC-010` / `TAS-021`).
- [ ] Confirm that `forceStop` is always called before re-throwing `ExecutionTimeoutError` to avoid zombie containers.
- [ ] Ensure `ExecutionTimeoutError` is exported from `packages/sandbox/src/index.ts` so callers can catch it by type.
- [ ] Confirm timer cleanup in `withExecutionTimeout` occurs in a `finally` block, not just the happy path.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="execution-timeout"` and confirm all assertions pass with Jest fake timers simulating timeouts.
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="docker-driver-timeout"` and confirm `forceStop` is invoked on timeout.

## 5. Update Documentation
- [ ] Document `withExecutionTimeout` in `packages/sandbox/README.md` under a "Timeouts" section, noting the 300-second default and how to override per-call.
- [ ] Update the `.agent/decisions.md` with: "Execution timeout is enforced in application code (`withExecutionTimeout`) rather than relying solely on Docker's `--stop-timeout` flag, ensuring cross-driver consistency between `DockerDriver` and `WebContainerDriver`."
- [ ] Update the agent memory entry for `1_PRD-REQ-SEC-010` in `specs/1_prd.md` (or a companion `memory/` file) to status "Implemented."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test --coverage` and assert that `execution-timeout.ts` has 100% branch coverage (all branches: resolves, times-out, timer cleared).
- [ ] Add a CI script step in `.github/workflows/sandbox-tests.yml` that runs `pnpm --filter @devs/sandbox test -- --testPathPattern="execution-timeout" --ci` and fails the build if any test fails.
