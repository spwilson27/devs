# Task: Decision Logs Capture System (Sub-Epic: 07_Audit Trails & Glass-Box Observability)

## Covered Requirements
- [TAS-059]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/core/test/audit/decision_logger.test.ts` to verify the recording of architectural and implementation decisions.
- [ ] The test should call the `recordDecision` API with various alternatives and reasons and verify they appear correctly in the `decision_logs` table.
- [ ] Test that the `decision_logs` entries are correctly associated with the current `task_id`.

## 2. Task Implementation
- [ ] Implement a `DecisionLogger` service in `@devs/core/audit` to provide a clean API for agents to log their reasoning.
- [ ] The API should support:
  - `logAlternative(alternative: string, reasonForRejection: string)`
  - `confirmSelection(selection: string)`
- [ ] Ensure that every time an agent expresses an alternative in its internal "Thought" stream that leads to a rejection, the orchestrator parses or provides a dedicated tool for the agent to explicitly record this in the `decision_logs` table.
- [ ] Implement a `searchDecisions(query: string)` method to allow subsequent agent turns or users to query the history of rejected alternatives.
- [ ] Ensure all writes use the existing `better-sqlite3` persistence layer with WAL enabled.

## 3. Code Review
- [ ] Verify that the `DecisionLogger` API is accessible to the agent via a standardized tool or a systematic prompt instruction.
- [ ] Check that the data structure in the DB allows for rich text or Markdown content for the reasoning field.
- [ ] Ensure that the logic correctly identifies the current task context automatically to avoid manual ID passing by the agent.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/core/test/audit/decision_logger.test.ts` to verify capture and query capabilities.

## 5. Update Documentation
- [ ] Update the project's "Technical Decisions" documentation to explain how agents can utilize the Decision Log to avoid repeating previously rejected strategies.
- [ ] Document the schema for the `decision_logs` table in the TAS.

## 6. Automated Verification
- [ ] Use `sqlite3 .devs/state.sqlite "SELECT * FROM decision_logs"` after a test run to ensure alternatives considered are being properly persisted.
