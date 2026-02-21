# Task: Implement HITL Approval Presentation Service (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [1_PRD-REQ-UI-001], [1_PRD-REQ-HITL-001], [9_ROADMAP-REQ-001]

## 1. Initial Test Written
- [ ] In `packages/core/src/phase-gate/__tests__/hitl-approval.service.test.ts`, write unit tests that assert:
  - `HITLApprovalService.presentForApproval(gate, reports)` calls `INotificationAdapter.sendApprovalRequest(payload)` exactly once with a payload containing `gateId`, `phaseId`, `reportSummaries` (an array with one entry per report), and `confidenceScores`.
  - `HITLApprovalService.presentForApproval()` transitions the gate state from `PENDING` to `AWAITING_USER_APPROVAL` via `PhaseGateStateMachine`.
  - `HITLApprovalService.presentForApproval()` persists the updated gate via `IPhaseGateRepository.update()`.
  - `HITLApprovalService.recordApproval(gateId, approvedBy)` transitions state to `APPROVED`, sets `approvedBy` and `approvedAt`, and persists.
  - `HITLApprovalService.recordRejection(gateId, reason)` transitions state to `REJECTED`, sets `rejectionReason`, and persists.
  - Calling `HITLApprovalService.recordApproval()` on a gate not in `AWAITING_USER_APPROVAL` state throws `InvalidPhaseGateTransitionError`.
- [ ] In `packages/core/src/phase-gate/__tests__/hitl-approval.service.integration.test.ts`, write an integration test using an `InMemoryPhaseGateRepository` and a mock `INotificationAdapter` that:
  - Simulates the full approval flow: `presentForApproval` → gate state becomes `AWAITING_USER_APPROVAL` → `recordApproval` → gate state becomes `APPROVED`.
  - Verifies the final persisted gate record has non-null `approvedBy` and `approvedAt`.
  - Simulates the rejection flow: `presentForApproval` → `recordRejection` → gate state becomes `REJECTED` with a non-null `rejectionReason`.

## 2. Task Implementation
- [ ] Create `packages/core/src/phase-gate/hitl-approval.service.ts`:
  - Define and export `ApprovalRequestPayload` type: `{ gateId: string; phaseId: string; reportSummaries: ReportSummary[]; confidenceScores: Record<string, number> }`.
  - Define and export `ReportSummary` type: `{ reportId: string; reportType: string; title: string; markdownExcerpt: string; confidenceScore: number }`.
  - Define and export `INotificationAdapter` interface with `sendApprovalRequest(payload: ApprovalRequestPayload): Promise<void>`.
  - Implement `HITLApprovalService` class that accepts `IPhaseGateRepository` and `INotificationAdapter` via constructor injection.
  - Implement `presentForApproval(gate: PhaseGateRecord, reports: ResearchReport[]): Promise<PhaseGateRecord>`:
    - Builds `ReportSummary[]` by extracting title, a 500-character Markdown excerpt, and confidence score from each `ResearchReport`.
    - Calls `PhaseGateStateMachine.transition(gate, { type: 'REQUEST_APPROVAL' })` to move to `AWAITING_USER_APPROVAL`.
    - Persists via `repository.update(gate.id, updatedGate)`.
    - Calls `notificationAdapter.sendApprovalRequest(payload)`.
    - Returns updated gate.
  - Implement `recordApproval(gateId: string, approvedBy: string): Promise<PhaseGateRecord>`.
  - Implement `recordRejection(gateId: string, reason: string): Promise<PhaseGateRecord>`.
- [ ] Update `packages/core/src/phase-gate/index.ts` to re-export all new types and the service class.

## 3. Code Review
- [ ] Verify `HITLApprovalService` depends only on interfaces (`IPhaseGateRepository`, `INotificationAdapter`), not concrete implementations (Dependency Inversion Principle).
- [ ] Verify `presentForApproval` never mutates the input `gate` object.
- [ ] Verify the Markdown excerpt is truncated at a word boundary (not mid-word) to avoid garbled summaries.
- [ ] Verify all methods are `async` and return `Promise<PhaseGateRecord>` consistently.
- [ ] Verify no UI-framework-specific code (no VSCode API imports) exists in this core service — adapters belong in extension/CLI packages.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="hitl-approval"` and confirm all tests pass.
- [ ] Confirm the integration test asserts the full approval and rejection flows with correct final state.

## 5. Update Documentation
- [ ] Append to `packages/core/src/phase-gate/phase-gate.agent.md`:
  - Section: **HITL Approval Service** — document constructor dependencies, the three public methods, and the `ApprovalRequestPayload` shape.
  - Describe the `INotificationAdapter` extension point and how VSCode and CLI packages each provide their own concrete adapter.
  - Add a Mermaid sequence diagram: `User → HITLApprovalService → PhaseGateStateMachine → IPhaseGateRepository → INotificationAdapter`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:coverage -- --testPathPattern="hitl-approval"` and assert exit code 0 with ≥ 95% branch coverage.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0.
