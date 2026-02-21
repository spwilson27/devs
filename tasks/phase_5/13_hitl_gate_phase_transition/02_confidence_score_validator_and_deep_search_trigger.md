# Task: Implement Confidence Score Validator & Deep Search Trigger (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [9_ROADMAP-REQ-007], [9_ROADMAP-DOD-P3]

## 1. Initial Test Written
- [ ] In `packages/core/src/phase-gate/__tests__/confidence-score-validator.test.ts`, write unit tests that assert:
  - `ConfidenceScoreValidator.validate(scores)` returns `{ passed: true, failingReports: [] }` when ALL of `market`, `tech`, and `competitive` scores are ≥ 0.85.
  - `ConfidenceScoreValidator.validate(scores)` returns `{ passed: false, failingReports: ['market'] }` when `market` score is 0.82.
  - `ConfidenceScoreValidator.validate(scores)` returns `{ passed: false, failingReports: ['market', 'tech'] }` when both `market` (0.60) and `tech` (0.70) fail.
  - `ConfidenceScoreValidator.validate(scores)` throws `MissingReportScoreError` if any of the three mandatory report keys (`market`, `tech`, `competitive`) is absent.
  - The threshold constant is exported as `CONFIDENCE_THRESHOLD = 0.85` and is used internally (not hardcoded).
- [ ] In `packages/core/src/phase-gate/__tests__/deep-search-trigger.test.ts`, write unit tests that assert:
  - `DeepSearchTrigger.shouldTrigger(validationResult)` returns `true` when `validationResult.passed === false`.
  - `DeepSearchTrigger.shouldTrigger(validationResult)` returns `false` when `validationResult.passed === true`.
  - `DeepSearchTrigger.buildDeepSearchRequest(failingReports, originalQueries)` returns a `DeepSearchRequest` object with `reportTypes` equal to `failingReports` and `strategy: 'exhaustive'`.
  - `DeepSearchTrigger.buildDeepSearchRequest([], originalQueries)` throws `NoFailingReportsError`.
- [ ] In `packages/core/src/phase-gate/__tests__/deep-search-trigger.integration.test.ts`, write an integration test that:
  - Stubs `ResearchManager.runDeepSearch(request)` to return updated high-confidence scores.
  - Asserts that after one recursive deep search cycle, `ConfidenceScoreValidator.validate` now passes.
  - Asserts that the `PhaseGateStateMachine` transitions from `DEEP_SEARCH_TRIGGERED` back to `AWAITING_USER_APPROVAL` after deep search completes.

## 2. Task Implementation
- [ ] Create `packages/core/src/phase-gate/confidence-score-validator.ts`:
  - Export constant `CONFIDENCE_THRESHOLD = 0.85`.
  - Export type `ReportScores = { market: number; tech: number; competitive: number; [key: string]: number }`.
  - Export type `ValidationResult = { passed: boolean; failingReports: string[] }`.
  - Export class `ConfidenceScoreValidator` with static method `validate(scores: ReportScores): ValidationResult` that checks each mandatory key against `CONFIDENCE_THRESHOLD`.
  - Export `MissingReportScoreError` extending `Error` with a `missingKeys` field.
- [ ] Create `packages/core/src/phase-gate/deep-search-trigger.ts`:
  - Export type `DeepSearchRequest = { reportTypes: string[]; strategy: 'exhaustive' | 'targeted'; originalQueries: string[] }`.
  - Export class `DeepSearchTrigger` with:
    - Static `shouldTrigger(result: ValidationResult): boolean`.
    - Static `buildDeepSearchRequest(failingReports: string[], originalQueries: string[]): DeepSearchRequest`.
  - Export `NoFailingReportsError` extending `Error`.
- [ ] Update `packages/core/src/phase-gate/index.ts` to re-export all symbols from the two new files.

## 3. Code Review
- [ ] Verify `CONFIDENCE_THRESHOLD` is a named constant (not a magic number) and referenced in all comparisons.
- [ ] Verify `ConfidenceScoreValidator.validate()` is a pure function with no side effects.
- [ ] Verify `DeepSearchTrigger.buildDeepSearchRequest()` is a pure factory function.
- [ ] Verify error classes carry structured metadata (`missingKeys`, etc.) for agentic consumption.
- [ ] Verify no `any` types; all inputs/outputs are explicitly typed.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="confidence-score|deep-search"` and confirm all tests pass.
- [ ] Confirm the integration test correctly asserts the state machine transition after deep search.

## 5. Update Documentation
- [ ] Append to `packages/core/src/phase-gate/phase-gate.agent.md`:
  - Section: **Confidence Scoring** — describe the 85% threshold, mandatory report keys, and what triggers a Deep Search.
  - Section: **Deep Search Trigger** — describe the `DeepSearchRequest` shape and when exhaustive vs. targeted strategy is chosen.
  - Add a Mermaid flowchart showing the confidence check → pass/trigger branch.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:coverage -- --testPathPattern="confidence-score|deep-search"` and assert exit code 0 with ≥ 95% branch coverage.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0.
