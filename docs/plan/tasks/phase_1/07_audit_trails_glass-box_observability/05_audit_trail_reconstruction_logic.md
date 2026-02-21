# Task: Audit Trail Reconstruction Logic (Sub-Epic: 07_Audit Trails & Glass-Box Observability)

## Covered Requirements
- [8_RISKS-REQ-083], [1_PRD-REQ-PIL-004]

## 1. Initial Test Written
- [ ] Create an end-to-end test in `packages/core/test/audit/audit_reconstruction.test.ts` that populates a series of mock agent logs, decisions, and task transitions.
- [ ] The test should call an `AuditTrailReconstructor.generateReport()` method and verify the output.
- [ ] The report must correctly sort events chronologically, group them by task/epic, and include all thoughts, tool calls, and rejected alternatives.
- [ ] Verify that the reconstruction handles scenarios where some logs might be missing (e.g., due to a crash) and still produces a coherent partial history.

## 2. Task Implementation
- [ ] Implement an `AuditTrailReconstructor` class in `@devs/core/audit`.
- [ ] Create a `reconstruct(options: ReconstructionOptions)` method that:
  - 1. Fetches all entries from `agent_logs` and `decision_logs` for a given `project_id` or `task_id`.
  - 2. Correlates log entries with the task status and Git commit hashes from the `tasks` table.
  - 3. Generates a structured Markdown report that provides a "Flight Recorder" view of the agent's reasoning.
- [ ] Support different output formats (e.g., JSON for VSCode/CLI dashboards, Markdown for documentation).
- [ ] Implement an `exportAuditTrail()` command in the core engine that saves this report to the `docs/audit/` directory.
- [ ] Ensure that the logic correctly identifies the sequence of events across multiple agent instances and handoffs.

## 3. Code Review
- [ ] Verify that the generated audit trail is human-readable and provides enough context for a developer to understand why specific architectural decisions were made.
- [ ] Check that the correlation between Git commits and agent logs is accurate and consistent.
- [ ] Ensure that the report generation logic is efficient and doesn't load too much data into memory for large projects (use streaming or pagination if needed).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/core/test/audit/audit_reconstruction.test.ts` to ensure reports are generated accurately.

## 5. Update Documentation
- [ ] Update the `Glass-Box Transparency` section of the project documentation to explain how users can access and utilize the reconstructed audit trails.
- [ ] Document the `AuditTrailReconstructor` API in the internal developer guide.

## 6. Automated Verification
- [ ] Run the reconstructor on a test database and verify that the resulting Markdown file can be correctly rendered and contains all the expected sections (Thoughts, Actions, Decisions, Commits).
