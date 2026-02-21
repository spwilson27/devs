# Task: Implement Final Zero-Defect Audit Gate (Sub-Epic: 13_Full System Audits)

## Covered Requirements
- [9_ROADMAP-REQ-005]

## 1. Initial Test Written
- [ ] Create `tests/orchestrator/gates/FinalValidationGateNode.test.ts`.
- [ ] Write a test asserting that `FinalValidationGateNode` correctly executes when reaching the end of Phase 8.
- [ ] Write a test ensuring the project state transitions to `COMPLETED` only if the audit returns 100% pass rate.
- [ ] Write a test asserting that if the audit fails, the node transitions to `ArbitrationNode` or requests Human-In-The-Loop (HITL) intervention.

## 2. Task Implementation
- [ ] Implement `FinalValidationGateNode` in `src/orchestrator/gates/FinalValidationGateNode.ts`.
- [ ] Instantiate the `GlobalSandboxRunner` directly within this node and configure it to run a comprehensive build, lint, unit, integration, and E2E sequence.
- [ ] Prevent the graph from closing successfully unless all components exit with a `0` code (the Zero-Defect requirement).
- [ ] Dispatch an event `PROJECT_COMPLETED` through the Real-time Trace & Event Streaming (RTES) bus on success.

## 3. Code Review
- [ ] Verify that no partial passes are allowed; ensure the validation is strictly binary (Zero-Defect).
- [ ] Review the RTES bus event dispatching to ensure UI correctly reflects the success state.
- [ ] Ensure that `FinalValidationGateNode` cleans up memory effectively and closes database connections safely.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/orchestrator/gates/FinalValidationGateNode.test.ts`.
- [ ] Verify the RTES events are triggered correctly during local integration runs.

## 5. Update Documentation
- [ ] Update the `Final Validation` section in `docs/architecture/validation.md`.
- [ ] Update `.agent.md` to reference this gate as the final node in the Orchestrator DAG.

## 6. Automated Verification
- [ ] Run `npm run test:e2e` to simulate a complete project lifecycle and verify the `FinalValidationGateNode` triggers correctly and updates SQLite state.
