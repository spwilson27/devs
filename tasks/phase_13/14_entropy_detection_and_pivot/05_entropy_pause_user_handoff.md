# Task: Automatic Suspension and User Hand-off on Entropy Pause (Sub-Epic: 14_Entropy Detection and Pivot)

## Covered Requirements
- [4_USER_FEATURES-REQ-080]

## 1. Initial Test Written
- [ ] Create `src/reliability/entropy/__tests__/EntropyPauseHandler.test.ts`.
- [ ] Mock `EntropyPauseController` and a `UserNotifier` interface.
- [ ] Write a unit test that, when `EntropyPauseController.shouldPause()` returns `false`, calling `EntropyPauseHandler.checkAndHandle(failureContext)` does NOT call `UserNotifier.notifyEntropyPause()` and returns `{ paused: false }`.
- [ ] Write a unit test that, when `EntropyPauseController.shouldPause()` returns `true`, `checkAndHandle()` calls `UserNotifier.notifyEntropyPause(report)` exactly once with a `FailureAnalysisReport` containing `taskId`, `phaseId`, `failureCount`, and `failureSummaries`.
- [ ] Write a unit test verifying that after a pause, the orchestration state is set to `SUSPENDED` via the injected `OrchestrationStateManager.suspend()`.
- [ ] Write a unit test verifying `checkAndHandle()` returns `{ paused: true, report: FailureAnalysisReport }` when pause is triggered.
- [ ] Write an integration test verifying that calling `checkAndHandle` 5 times (each with `recordFailure` preceding it) triggers exactly one notification and one suspension.

## 2. Task Implementation
- [ ] Create `src/reliability/entropy/EntropyPauseHandler.ts`.
- [ ] Define the `FailureAnalysisReport` interface:
  ```ts
  interface FailureAnalysisReport {
    taskId: string;
    phaseId: string;
    failureCount: number;
    failureSummaries: string[];   // last N failure descriptions
    timestamp: string;            // ISO 8601
  }
  ```
- [ ] Define the `UserNotifier` interface with method `notifyEntropyPause(report: FailureAnalysisReport): Promise<void>`.
- [ ] Define the `OrchestrationStateManager` interface with method `suspend(reason: string): Promise<void>`.
- [ ] Implement `EntropyPauseHandler` class:
  - Constructor accepts `EntropyPauseController`, `UserNotifier`, `OrchestrationStateManager`, and a context provider `() => { taskId: string; phaseId: string }`.
  - `checkAndHandle(failureSummary: string): Promise<{ paused: false } | { paused: true; report: FailureAnalysisReport }>`:
    1. Calls `controller.recordFailure()`.
    2. If `controller.shouldPause()` is `false`, returns `{ paused: false }`.
    3. Builds `FailureAnalysisReport` using context provider, `controller.getFailureCount()`, and an internally accumulated `failureSummaries` ring buffer (last 5 entries).
    4. Awaits `notifier.notifyEntropyPause(report)`.
    5. Awaits `stateManager.suspend('Entropy pause: max failure threshold reached')`.
    6. Returns `{ paused: true, report }`.
- [ ] Export `EntropyPauseHandler`, `FailureAnalysisReport`, `UserNotifier`, `OrchestrationStateManager` from `src/reliability/entropy/index.ts`.

## 3. Code Review
- [ ] Confirm `UserNotifier` and `OrchestrationStateManager` are injected interfaces — no concrete implementations hardcoded inside `EntropyPauseHandler`.
- [ ] Confirm `FailureAnalysisReport.timestamp` uses `new Date().toISOString()` (not `Date.now()`) for human-readable output.
- [ ] Confirm the suspension reason string is descriptive enough for audit logging.
- [ ] Confirm the `failureSummaries` ring buffer stores only the last N entries (default 5) to avoid unbounded memory growth.
- [ ] Confirm the handler does NOT reset the `EntropyPauseController` after suspension — the controller stays in paused state until an external resume signal clears it.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="EntropyPauseHandler"` and confirm all tests pass with zero failures.
- [ ] Run `npm run lint src/reliability/entropy/EntropyPauseHandler.ts` with zero errors.

## 5. Update Documentation
- [ ] Append to `src/reliability/entropy/entropy.agent.md` a section on `EntropyPauseHandler`: the hand-off protocol, `FailureAnalysisReport` schema, suspension semantics, and how the `UserNotifier` and `OrchestrationStateManager` are expected to be implemented by the outer shell.
- [ ] Add a Mermaid sequence diagram showing: `recordFailure` → `shouldPause?` → (yes) `buildReport` → `notifyUser` → `suspend` → return `paused: true`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="EntropyPauseHandler"` and confirm 100% branch coverage for `EntropyPauseHandler.ts`.
- [ ] Run `grep "SUSPENDED\|suspend" src/reliability/entropy/EntropyPauseHandler.ts` to confirm suspension logic is present.
