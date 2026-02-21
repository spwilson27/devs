# Task: Integration of Entropy Detection and Pause into the TDD Orchestration Loop (Sub-Epic: 14_Entropy Detection and Pivot)

## Covered Requirements
- [3_MCP-TAS-019]
- [4_USER_FEATURES-REQ-080]

## 1. Initial Test Written
- [ ] Create `src/reliability/entropy/__tests__/EntropyOrchestrationIntegration.test.ts`.
- [ ] Write an integration test that wires together `SaopHashTracker`, `EntropyDetector`, `ArchitecturalReviewOrchestrator`, `EntropyPauseController`, and `EntropyPauseHandler` with stub implementations of `LlmArchitecturalReviewClient`, `UserNotifier`, and `OrchestrationStateManager`.
- [ ] Scenario A — Loop detection path: Feed 3 identical SAOP observation payloads through `EntropyOrchestrationFacade.onObservation(payload, failureSummary)` and assert:
  - `ArchitecturalReviewOrchestrator` fired once.
  - `EntropyPauseHandler` did NOT fire (failure count < 5).
- [ ] Scenario B — Entropy pause path: Call `EntropyOrchestrationFacade.onTaskFailure(failureSummary)` 5 times and assert:
  - `UserNotifier.notifyEntropyPause` fired exactly once.
  - `OrchestrationStateManager.suspend` fired exactly once.
  - The returned `FailureAnalysisReport` contains exactly 5 `failureSummaries`.
- [ ] Scenario C — Combined path: Trigger loop detection (3 identical observations) AND 5 failures; assert both the architectural review AND the pause notification fired, and in the correct order (review first, then pause if applicable).
- [ ] Write a test verifying that after `reset()` is called on the facade, both the loop detector and the pause controller reset to their initial states.

## 2. Task Implementation
- [ ] Create `src/reliability/entropy/EntropyOrchestrationFacade.ts` as the single integration point for consuming code.
- [ ] Define `EntropyOrchestrationFacade` class:
  - Constructor accepts all dependencies: `EntropyDetector`, `ArchitecturalReviewOrchestrator`, `EntropyPauseController`, `EntropyPauseHandler`.
  - `onObservation(saopPayload: string, failureSummary: string): Promise<EntropyFacadeResult>`:
    1. Calls `reviewer.evaluateAndMaybeIntervene(saopPayload)` — if `intervened: true`, sets an internal flag.
    2. Calls `pauseHandler.checkAndHandle(failureSummary)` — if `paused: true`, returns `{ action: 'PAUSED', report }`.
    3. If reviewer intervened but no pause, returns `{ action: 'REVIEW_TRIGGERED', reviewTurn }`.
    4. Otherwise returns `{ action: 'CONTINUE' }`.
  - `reset(): void` — calls `detector.reset()` and `pauseController.reset()`.
- [ ] Define `EntropyFacadeResult` discriminated union type:
  ```ts
  type EntropyFacadeResult =
    | { action: 'CONTINUE' }
    | { action: 'REVIEW_TRIGGERED'; reviewTurn: string }
    | { action: 'PAUSED'; report: FailureAnalysisReport };
  ```
- [ ] Wire `EntropyOrchestrationFacade` into the TDD orchestration loop's main iteration step (locate the step in `src/orchestration/TddLoop.ts` or equivalent and add a call to `facade.onObservation(...)` after each agent turn result is received).
- [ ] Export `EntropyOrchestrationFacade` and `EntropyFacadeResult` from `src/reliability/entropy/index.ts`.

## 3. Code Review
- [ ] Confirm the facade is the ONLY integration point — no other code directly calls `EntropyDetector`, `ArchitecturalReviewOrchestrator`, `EntropyPauseController`, or `EntropyPauseHandler` separately.
- [ ] Confirm the discriminated union `EntropyFacadeResult` covers all three outcomes with no fallthrough.
- [ ] Confirm the facade does not catch or swallow errors from its dependencies — errors propagate to the outer orchestration layer.
- [ ] Confirm the facade's `reset()` always resets both the detector and pause controller atomically (no partial reset state).
- [ ] Confirm the TDD loop integration handles the `PAUSED` action by aborting the current iteration cleanly without leaving dangling state.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="EntropyOrchestrationIntegration"` and confirm all scenarios pass.
- [ ] Run the full test suite `npm test` and confirm no regressions in existing TDD loop tests.
- [ ] Run `npm run lint src/reliability/entropy/EntropyOrchestrationFacade.ts` with zero errors.

## 5. Update Documentation
- [ ] Update `src/reliability/entropy/entropy.agent.md` with a top-level section describing the full entropy subsystem: the component hierarchy (`SaopHashTracker` → `EntropyDetector` → `ArchitecturalReviewOrchestrator`; `EntropyPauseController` → `EntropyPauseHandler`; unified via `EntropyOrchestrationFacade`).
- [ ] Add a Mermaid component diagram to `entropy.agent.md` showing the relationships between all entropy subsystem components.
- [ ] Update the TDD loop's `TddLoop.agent.md` (or equivalent) with a note that entropy detection is applied after each agent turn via `EntropyOrchestrationFacade.onObservation`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage` and confirm overall entropy module coverage ≥ 95% across all files in `src/reliability/entropy/`.
- [ ] Run `grep -r "EntropyOrchestrationFacade" src/orchestration/` to confirm the facade is wired into the TDD orchestration loop.
- [ ] Run `grep -r "PAUSED\|REVIEW_TRIGGERED\|CONTINUE" src/orchestration/` to confirm the facade result actions are handled in the orchestration layer.
