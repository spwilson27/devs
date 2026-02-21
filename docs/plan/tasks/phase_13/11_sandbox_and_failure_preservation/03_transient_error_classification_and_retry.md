# Task: Transient Sandbox Error Classification and Retry Without Entropy Increment (Sub-Epic: 11_Sandbox and Failure Preservation)

## Covered Requirements
- [UNKNOWN-802]

## 1. Initial Test Written

- [ ] Write unit tests in `src/sandbox/__tests__/transient-error-classifier.test.ts`:
  - Assert `TransientErrorClassifier.classify(error)` returns `TransientErrorType.NETWORK_TIMEOUT` for an `Error` with message matching `/ETIMEDOUT|ECONNRESET|EHOSTUNREACH/`.
  - Assert it returns `TransientErrorType.DOCKER_SOCKET_UNAVAILABLE` for an `Error` with message matching `/connect ENOENT.*docker.sock/`.
  - Assert it returns `TransientErrorType.CONTAINER_OOM` for an `Error` with code `137` (OOM kill signal).
  - Assert it returns `null` (not transient) for a generic `Error` with message `"Test suite failed: assertion error"`.
  - Assert it returns `null` for errors indicating a genuine implementation failure (e.g., `ImplementationError`, `AssertionError`).
- [ ] Write unit tests in `src/sandbox/__tests__/transient-retry-handler.test.ts`:
  - Mock `TransientErrorClassifier.classify()`.
  - Assert that when a transient error is classified, `TransientRetryHandler.execute(fn, opts)` retries `fn` up to `opts.maxRetries` times (default 3) with exponential backoff.
  - Assert that on a transient retry, the task's entropy counter is NOT incremented (mock `EntropyTracker.increment` and assert it is never called during transient retries).
  - Assert that after exhausting `maxRetries`, the error is re-thrown as a `TransientExhaustionError`.
  - Assert that when `fn` eventually succeeds on retry 2, the resolved value is returned and no error is thrown.
  - Assert that for non-transient errors, `TransientRetryHandler.execute()` re-throws immediately on the first failure without retrying.

## 2. Task Implementation

- [ ] Create `src/sandbox/transient-error-classifier.ts`:
  - Export `TransientErrorType` enum: `NETWORK_TIMEOUT`, `DOCKER_SOCKET_UNAVAILABLE`, `CONTAINER_OOM`, `API_RATE_LIMIT`, `SANDBOX_START_TIMEOUT`.
  - Export `TransientErrorClassifier` class with static method `classify(error: Error): TransientErrorType | null`.
  - Patterns to match (in order):
    - `ETIMEDOUT|ECONNRESET|EHOSTUNREACH|ENOTFOUND` → `NETWORK_TIMEOUT`
    - `connect ENOENT.*docker\.sock` → `DOCKER_SOCKET_UNAVAILABLE`
    - Exit code `137` → `CONTAINER_OOM`
    - HTTP status `429` in error message → `API_RATE_LIMIT`
    - `Sandbox start exceeded` → `SANDBOX_START_TIMEOUT`
  - All other errors → `null`.
- [ ] Create `src/sandbox/transient-retry-handler.ts`:
  - Export `TransientRetryHandler` class with static method:
    ```typescript
    static async execute<T>(
      fn: () => Promise<T>,
      opts?: { maxRetries?: number; baseDelayMs?: number; taskId?: string }
    ): Promise<T>
    ```
  - Default: `maxRetries = 3`, `baseDelayMs = 1000`.
  - On transient error: log `[TRANSIENT RETRY] attempt N/maxRetries for taskId=X, reason=<type>` and wait `baseDelayMs * 2^(attempt-1)` ms.
  - Do NOT call `EntropyTracker.increment()` on transient retries.
  - After exhausting retries, throw `new TransientExhaustionError(type, attempts, taskId)`.
  - On non-transient error: re-throw immediately.
- [ ] Create `src/sandbox/errors.ts` (or extend existing) exporting `TransientExhaustionError extends Error` with fields `type`, `attempts`, `taskId`.
- [ ] In `src/orchestration/implementation-loop.ts`, wrap all sandbox tool calls (file writes, test runs, `execute_command` MCP calls) with `TransientRetryHandler.execute(() => ...)`.
- [ ] Ensure `TransientExhaustionError` is handled in the outer catch: it should still trigger `ForensicCapture.capture()` (task genuinely failed after exhausting retries) and increment entropy.

## 3. Code Review

- [ ] Confirm classification is exhaustive — any unmatched error defaults to `null` (non-transient), never falsely classified as transient. This is critical to prevent masking genuine implementation failures.
- [ ] Confirm entropy counter (`EntropyTracker.increment()`) is called only once per task failure, not per transient retry. Add a test to verify total call count.
- [ ] Confirm exponential backoff does not exceed a maximum cap (e.g., 30 seconds) to prevent indefinite waits.
- [ ] Confirm retry attempts are logged with structured JSON to the project's logger (not `console.log`) so they appear in `devs debug --logs` output.
- [ ] Confirm `TransientRetryHandler` is not used for entropy-tracked agent decisions, only for infrastructure calls (Docker, network, filesystem).

## 4. Run Automated Tests to Verify

- [ ] Run: `npx vitest run src/sandbox/__tests__/transient-error-classifier.test.ts`
- [ ] Run: `npx vitest run src/sandbox/__tests__/transient-retry-handler.test.ts`
- [ ] Run full sandbox test suite: `npx vitest run src/sandbox/` and confirm all pass.
- [ ] Run: `npx vitest run src/orchestration/` to confirm no regressions in the implementation loop.

## 5. Update Documentation

- [ ] Add section `## Transient Error Classification` to `docs/reliability.md`:
  - List all classified transient error types and their patterns.
  - Explain that transient retries do NOT increment entropy.
  - Document `maxRetries` configuration (e.g., via `devs.config.ts: sandbox.transientRetries`).
- [ ] Update `docs/agent-memory/phase_13.md`: "All sandbox infrastructure calls are wrapped with `TransientRetryHandler.execute()`. Genuine implementation errors are never reclassified as transient. After 3 transient retries, `TransientExhaustionError` is thrown and treated as a normal task failure."

## 6. Automated Verification

- [ ] Run `npx vitest run --reporter=json src/sandbox/__tests__/transient-retry-handler.test.ts | jq '.numFailedTests == 0'` — assert `true`.
- [ ] Run `grep -n "EntropyTracker.increment" src/sandbox/transient-retry-handler.ts` — assert no matches (confirm entropy tracker is never called inside the retry handler).
- [ ] Run `grep -rn "TransientRetryHandler.execute" src/orchestration/implementation-loop.ts` — assert at least one match per sandbox tool call site.
