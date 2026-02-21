# Task: Implement Sandbox Retry Protocol for GREEN/VERIFY Phases (Sub-Epic: 07_Sandbox Bridge & Injection)

## Covered Requirements
- [3_MCP-TAS-090], [UNKNOWN-802]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/retry-protocol.test.ts`, write unit tests for the `SandboxRetryProtocol` class:
  - Test that when `SandboxExecutor.execute()` returns a non-zero exit code on the first attempt, the orchestrator automatically retries exactly **two more times** (total of 3 attempts) before failing.
  - Test that the retry is only triggered during the `GREEN` and `VERIFY` phases; attempts in other phases (e.g., `RED`) must **not** be retried automatically.
  - Test that each retry receives identical tool call arguments as the original call (idempotency check).
  - Test that a successful result on the second retry (attempt index 1) is returned to the caller as if it succeeded on the first try (no error propagated).
  - Test that after all 3 attempts fail, a `SandboxRetryExhaustedError` is thrown containing: `exitCode`, `attemptCount: 3`, `phase`, and `toolCallId`.
- [ ] In `packages/core/src/sandbox/__tests__/flakiness-detection.test.ts`, write tests for transient vs. persistent failure classification:
  - Test that a `NETWORK_TIMEOUT` exit code (defined constant `EXIT_NETWORK_TIMEOUT = 124`) is classified as a `TransientError` and retried.
  - Test that a `COMPILATION_ERROR` exit code (defined constant `EXIT_COMPILATION_ERROR = 1`) is classified as a `PersistentError` and causes the entropy detection system to **not** be triggered.
  - Test that the `EntropyDetector` is **not** notified when a `TransientError` is retried and eventually succeeds.
  - Test that the `EntropyDetector` **is** notified when a `PersistentError` fails all retries.
  - Test that retry delay uses exponential backoff starting at 500ms (mock `setTimeout` and assert intervals: 500ms, 1000ms).

## 2. Task Implementation
- [ ] Create `packages/core/src/sandbox/retry-protocol.ts`:
  - Export `SandboxRetryProtocol` class with constructor `(executor: SandboxExecutor, entropyDetector: EntropyDetector, options?: RetryOptions)`.
  - Implement `async executeWithRetry(toolCall: ToolCall, phase: AgentPhase): Promise<ToolResult>`:
    1. If `phase` is not `GREEN` or `VERIFY`, execute once and return (no retry).
    2. For retryable phases, attempt up to `maxAttempts` (default: 3) with exponential backoff.
    3. On each failure, classify the exit code using `ErrorClassifier.classify(exitCode)`.
    4. If `TransientError`: retry without notifying `EntropyDetector`.
    5. If `PersistentError` and all retries exhausted: notify `EntropyDetector.record(toolCall, phase)` and throw `SandboxRetryExhaustedError`.
  - Export `RetryOptions` interface: `{ maxAttempts: number; baseDelayMs: number; backoffMultiplier: number }`.
  - Export `SandboxRetryExhaustedError` class extending `Error` with fields: `exitCode`, `attemptCount`, `phase`, `toolCallId`.
- [ ] Create `packages/core/src/sandbox/error-classifier.ts`:
  - Export `ErrorClassifier` with static method `classify(exitCode: number): 'TransientError' | 'PersistentError'`.
  - Define and export constants: `EXIT_NETWORK_TIMEOUT = 124`, `EXIT_DOCKER_DAEMON_UNAVAILABLE = 125`.
  - Map transient exit codes (124, 125, and any code in range 126-128 denoting OS-level transient issues) to `TransientError`.
  - All other non-zero exit codes map to `PersistentError`.
- [ ] Update `packages/core/src/sandbox/tool-proxy.ts` to use `SandboxRetryProtocol.executeWithRetry()` instead of calling `SandboxExecutor.execute()` directly.
- [ ] Ensure `AgentPhase` enum in `packages/core/src/types/agent-phase.ts` includes `RED`, `GREEN`, `VERIFY`, `REFACTOR` values.

## 3. Code Review
- [ ] Verify that the retry logic is fully encapsulated in `SandboxRetryProtocol` and that `ToolProxy` does not contain any retry loop logic itself.
- [ ] Confirm that `ErrorClassifier` is a pure, stateless utility with no side effects.
- [ ] Verify that exponential backoff uses `await delay(ms)` with a testable `delay` function injected via dependency injection (not a hard-coded `setTimeout` call), allowing tests to mock it.
- [ ] Confirm that `SandboxRetryExhaustedError` always includes the full context (`exitCode`, `attemptCount`, `phase`, `toolCallId`) for downstream observability.
- [ ] Ensure that retry behavior does not duplicate tool call side effects (i.e., the sandbox environment is reset or idempotent before each retry attempt).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="retry-protocol"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="flakiness-detection"` and confirm all tests pass.
- [ ] Verify that `retry-protocol.ts` and `error-classifier.ts` achieve ≥ 90% branch coverage.

## 5. Update Documentation
- [ ] Create `packages/core/src/sandbox/retry-protocol.agent.md` documenting: retry trigger conditions (GREEN/VERIFY phases only), max attempts (3), backoff schedule, transient vs. persistent error classification, and interaction with `EntropyDetector`.
- [ ] Update `packages/core/src/sandbox/sandbox.agent.md` to reference the retry protocol and its integration with `ToolProxy`.
- [ ] Add `3_MCP-TAS-090` and `UNKNOWN-802` to `docs/requirements-coverage.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/core test -- --ci --forceExit` and confirm exit code `0`.
- [ ] Run `node scripts/verify-req-coverage.js --ids 3_MCP-TAS-090,UNKNOWN-802` and confirm both IDs are marked as covered.
