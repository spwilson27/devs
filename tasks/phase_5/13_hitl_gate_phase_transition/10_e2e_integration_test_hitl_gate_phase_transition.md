# Task: Implement End-to-End Integration Test for HITL Gate & Phase Transition (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [1_PRD-REQ-UI-001], [1_PRD-REQ-HITL-001], [9_ROADMAP-REQ-001], [9_ROADMAP-REQ-007], [9_ROADMAP-DOD-P3]

## 1. Initial Test Written
- [ ] In `packages/core/src/__tests__/e2e/hitl-gate-phase-transition.e2e.test.ts`, write a full end-to-end integration test that:
  - Uses real `SqlitePhaseGateRepository` (with `:memory:` database).
  - Uses real `HITLApprovalService` with a stubbed `INotificationAdapter` (records invocations without side effects).
  - Uses real `ConfidenceScoreValidator` and `DeepSearchTrigger`.
  - Uses real `DiscoveryOrchestrator` with a stubbed `ResearchManager`:
    - **Scenario A (Happy Path - scores pass on first attempt)**:
      1. Stub `ResearchManager.execute()` to return four reports (`market`, `competitive`, `tech`, `user`) each with `confidenceScore: 0.90` and a non-empty `mermaidSwotDiagram` and at least one `citation`.
      2. Call `DiscoveryOrchestrator.run(brief)`.
      3. Assert the gate was created with state `AWAITING_USER_APPROVAL`.
      4. Assert `INotificationAdapter.sendApprovalRequest()` was called once.
      5. Call `HITLApprovalService.recordApproval(gateId, 'test-user')`.
      6. Assert gate state is `APPROVED`.
      7. Call `PhaseTransitionService.executeTransition(gateId)` with a stubbed `IPhaseRunner`.
      8. Assert `IPhaseRunner.startPhase('architecture')` was called once.
      9. Run `DiscoveryDoDChecker.check(reports, gate)` and assert `passed: true`.
    - **Scenario B (Deep Search Triggered - scores fail first, pass after deep search)**:
      1. Stub `ResearchManager.execute()` to return reports with `market.confidenceScore: 0.70` (below threshold).
      2. Stub `ResearchManager.runDeepSearch()` to return updated reports with all scores ≥ 0.85.
      3. Call `DiscoveryOrchestrator.run(brief)`.
      4. Assert `ResearchManager.runDeepSearch()` was called exactly once.
      5. Assert the gate was created with state `AWAITING_USER_APPROVAL` (not `DEEP_SEARCH_TRIGGERED` — the orchestrator waits for approval after deep search completes).
    - **Scenario C (Deep Search Exhausted - scores fail all retries)**:
      1. Stub `ResearchManager.execute()` to return reports with all scores at 0.50.
      2. Stub `ResearchManager.runDeepSearch()` to always return the same low-confidence scores.
      3. Call `DiscoveryOrchestrator.run(brief)`.
      4. Assert `ResearchManager.runDeepSearch()` was called exactly `MAX_DEEP_SEARCH_RETRIES` (3) times.
      5. Assert a `DeepSearchExhaustedEvent` was emitted.
      6. Assert the gate was still moved to `AWAITING_USER_APPROVAL` (user can still manually approve).
    - **Scenario D (Rejection Flow)**:
      1. Run Scenario A through step 4.
      2. Call `HITLApprovalService.recordRejection(gateId, 'Reports are insufficient')`.
      3. Assert gate state is `REJECTED` with `rejectionReason: 'Reports are insufficient'`.
      4. Assert `PhaseTransitionService.executeTransition(gateId)` throws `PhaseTransitionBlockedError`.

## 2. Task Implementation
- [ ] Create `packages/core/src/__tests__/e2e/hitl-gate-phase-transition.e2e.test.ts` implementing all four scenarios above.
- [ ] Create a test helper `packages/core/src/__tests__/e2e/helpers/mock-research-reports.ts` that exports:
  - `buildMockReports(overrides?: Partial<ResearchReport>[]): ResearchReport[]` — returns a valid set of four reports with default confidence score 0.90.
  - `buildLowConfidenceReports(): ResearchReport[]` — returns four reports with all scores at 0.50.
- [ ] Create a test helper `packages/core/src/__tests__/e2e/helpers/mock-notification-adapter.ts` that exports:
  - `MockNotificationAdapter` implementing `INotificationAdapter` with a `calls: ApprovalRequestPayload[]` array and a `sendApprovalRequest` that pushes to the array and resolves.

## 3. Code Review
- [ ] Verify each scenario is isolated (separate `beforeEach` that creates a fresh in-memory database and fresh stubs).
- [ ] Verify the test file imports only from `@devs/core` — no reaching into internal module paths.
- [ ] Verify the test covers all five requirement IDs from this sub-epic (`1_PRD-REQ-UI-001`, `1_PRD-REQ-HITL-001`, `9_ROADMAP-REQ-001`, `9_ROADMAP-REQ-007`, `9_ROADMAP-DOD-P3`) with explicit comments mapping each scenario to a requirement.
- [ ] Verify assertions use specific matchers (e.g., `expect(gate.state).toBe(PhaseGateState.APPROVED)`) not broad ones (e.g., `toBeTruthy()`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="hitl-gate-phase-transition.e2e"` and confirm all four scenarios pass.
- [ ] Confirm test execution time is under 10 seconds (in-memory SQLite should be fast).

## 5. Update Documentation
- [ ] Append to `packages/core/src/phase-gate/phase-gate.agent.md`:
  - Section: **End-to-End Test Scenarios** — describe all four scenarios with the requirement ID each validates.
  - Reference the helper files and their exports.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="hitl-gate-phase-transition.e2e" --verbose` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="phase-gate|discovery-orchestrator|hitl-approval|phase-transition|confidence-score|deep-search|discovery-dod|sqlite-phase-gate|hitl-gate-phase-transition"` (the full sub-epic test suite) and assert exit code 0 — confirming no regressions across all tasks in this sub-epic.
