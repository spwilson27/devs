# Task: Implement Discovery Phase Orchestrator & HITL Gate Integration (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [1_PRD-REQ-UI-001], [1_PRD-REQ-HITL-001], [9_ROADMAP-REQ-001], [9_ROADMAP-REQ-007], [9_ROADMAP-DOD-P3]

## 1. Initial Test Written
- [ ] In `packages/core/src/orchestration/__tests__/discovery-orchestrator.test.ts`, write unit tests that assert:
  - `DiscoveryOrchestrator.run(brief)` calls `ResearchManager.execute(brief)` exactly once and collects the resulting `ResearchReport[]`.
  - After collecting reports, `DiscoveryOrchestrator.run()` calls `ConfidenceScoreValidator.validate(scores)`.
  - When confidence scores pass (all ≥ 0.85), `DiscoveryOrchestrator.run()` calls `HITLApprovalService.presentForApproval(gate, reports)`.
  - When confidence scores fail, `DiscoveryOrchestrator.run()` calls `DeepSearchTrigger.buildDeepSearchRequest(failingReports, queries)` and then `ResearchManager.runDeepSearch(request)` before re-validating.
  - Deep search retries are capped at `MAX_DEEP_SEARCH_RETRIES = 3`; after exhausting retries, `DiscoveryOrchestrator.run()` still calls `HITLApprovalService.presentForApproval()` with the best available scores and emits a `DeepSearchExhaustedEvent`.
  - `DiscoveryOrchestrator.run()` emits a `PhaseGateOpenedEvent` when `presentForApproval` completes.
  - `DiscoveryOrchestrator.run()` resolves with `{ status: 'awaiting_approval', gateId }` (not with the full report set).
- [ ] In `packages/core/src/orchestration/__tests__/discovery-orchestrator.integration.test.ts`, write an integration test using stubs for `ResearchManager` and `HITLApprovalService` that:
  - Runs through the full success path (scores pass, gate opened, approval recorded, phase transition triggered).
  - Runs through the deep search path (first run fails, deep search runs, second run passes, gate opened).

## 2. Task Implementation
- [ ] Create `packages/core/src/orchestration/discovery-orchestrator.ts`:
  - Import `ResearchManager`, `ConfidenceScoreValidator`, `DeepSearchTrigger`, `HITLApprovalService`, `PhaseGateRecord`, `PhaseGateStateMachine`, `IPhaseGateRepository` from their respective modules.
  - Export constant `MAX_DEEP_SEARCH_RETRIES = 3`.
  - Export `DiscoveryOrchestratorResult` type: `{ status: 'awaiting_approval'; gateId: string }`.
  - Export events: `PhaseGateOpenedEvent`, `DeepSearchExhaustedEvent` (plain objects with a `type` discriminant).
  - Implement `DiscoveryOrchestrator` class with constructor accepting `ResearchManager`, `HITLApprovalService`, `IPhaseGateRepository`, and an `EventEmitter` (Node.js built-in).
  - Implement `async run(brief: UserBrief): Promise<DiscoveryOrchestratorResult>`:
    1. Call `researchManager.execute(brief)` → `reports: ResearchReport[]`.
    2. Extract `confidenceScores` from reports.
    3. Enter retry loop (max `MAX_DEEP_SEARCH_RETRIES`):
       a. Call `ConfidenceScoreValidator.validate(scores)`.
       b. If passed, break.
       c. If failed, call `DeepSearchTrigger.buildDeepSearchRequest()`, then `researchManager.runDeepSearch()`, update `reports` and `scores`.
    4. If loop exhausted without passing, emit `DeepSearchExhaustedEvent`.
    5. Create a new `PhaseGateRecord` via `repository.create(...)` with state `PENDING`.
    6. Call `hitlApprovalService.presentForApproval(gate, reports)`.
    7. Emit `PhaseGateOpenedEvent`.
    8. Return `{ status: 'awaiting_approval', gateId: gate.id }`.
- [ ] Update `packages/core/src/orchestration/index.ts` to export `DiscoveryOrchestrator` and related types.

## 3. Code Review
- [ ] Verify the retry loop uses a `while` loop with an explicit counter (not recursion) to avoid stack overflows.
- [ ] Verify `DiscoveryOrchestrator` emits events via the injected `EventEmitter`, not by importing a global singleton.
- [ ] Verify the orchestrator does not directly import any UI or notification adapter — it interacts only with core interfaces.
- [ ] Verify `DiscoveryOrchestratorResult` is a narrow type (does not expose the full `ResearchReport[]`) to enforce separation of concerns.
- [ ] Verify `MAX_DEEP_SEARCH_RETRIES` is exported (not module-private) so it can be asserted in tests.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="discovery-orchestrator"` and confirm all tests pass.
- [ ] Confirm the integration test exercises both the success path and the deep search retry path.

## 5. Update Documentation
- [ ] Create `packages/core/src/orchestration/discovery-orchestrator.agent.md` documenting:
  - **Intent**: Coordinates the Discovery phase end-to-end, from research execution through HITL gate opening.
  - **Architecture**: Dependency diagram of injected services, retry loop logic, event emission.
  - **Agentic Hooks**: `PhaseGateOpenedEvent` payload shape, `DeepSearchExhaustedEvent` payload shape.
  - Mermaid flowchart of the full orchestration logic including the retry loop and gate opening.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:coverage -- --testPathPattern="discovery-orchestrator"` and assert exit code 0 with ≥ 95% branch coverage.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0.
