# Task: Implement Validation Reporting and Final Delivery Gate (Sub-Epic: 12_Global Validation Infrastructure)

## Covered Requirements
- [TAS-053], [9_ROADMAP-REQ-042]

## 1. Initial Test Written
- [ ] Create `tests/core/orchestrator/ValidationReporter.test.ts`.
- [ ] Write tests for parsing a successful `AuditResult` into a Markdown-formatted "Project Delivery Payload".
- [ ] Write tests verifying that a failing `AuditResult` properly formats an escalation payload for the `RCA_Node`.
- [ ] Write tests ensuring that upon final success, the state database marks the project metadata phase as `COMPLETE`.

## 2. Task Implementation
- [ ] Implement `src/core/orchestrator/ValidationReporter.ts`.
- [ ] Build the logic to aggregate final test outputs, Requirement Traceability Index (RTI), and SAST output into a single `final_validation_report.md`.
- [ ] Implement the Final Gate transition logic: If `AuditResult.success` is true, write the report to the `.devs/reports/` directory and update `state.sqlite` project status to `DELIVERED`.
- [ ] If `AuditResult.success` is false, update `state.sqlite` with the failure log and pass context to the RCA agent.

## 3. Code Review
- [ ] Check that `ValidationReporter` performs no async blocking operations other than database transactions and file I/O.
- [ ] Verify that database updates to `state.sqlite` (projects table) are wrapped in ACID transactions.
- [ ] Ensure the Markdown output matches the `Project Integrity Report` schema defined in earlier phases.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/core/orchestrator/ValidationReporter.test.ts`.
- [ ] Ensure all assertions around database updates and file generation pass.

## 5. Update Documentation
- [ ] Update `.agent/core/orchestrator.agent.md` to explain the final delivery gate format and database state transitions.
- [ ] Update `docs/tasks.md` or equivalent project tracker with the finalization workflow.

## 6. Automated Verification
- [ ] Run an integration test script that seeds a completed phase 8 state, runs the reporter, and asserts the existence of `.devs/reports/final_validation_report.md`.
- [ ] Run `npm run typecheck` to ensure no types were broken during integration.