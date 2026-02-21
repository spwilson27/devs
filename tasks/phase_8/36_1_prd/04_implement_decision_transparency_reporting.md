# Task: Implement Decision Transparency Reporting for Failures (Sub-Epic: 36_1_PRD)

## Covered Requirements
- [1_PRD-REQ-MET-012]

## 1. Initial Test Written
- [ ] Create `tests/core/reporting/DecisionTransparency.test.ts`.
- [ ] Write a test `should generate RCA report on task failure` that triggers a `TASK_FAILED_FATAL` event and verifies that a Root Cause Analysis (RCA) report containing a "Root Cause" and "Suggested Fix" is generated and persisted.
- [ ] Write a test `should generate resolution within 5 minutes` that measures the processing time of the RCA generation mock to ensure it adheres to the <5 min latency constraint.

## 2. Task Implementation
- [ ] Create `src/core/reporting/FailureRcaGenerator.ts`.
- [ ] Listen for task failure events (e.g., after 5 retries or fatal sandbox errors).
- [ ] Upon failure, collect the last 10 turns from `agent_logs`, the exact failing test output, and the active task context.
- [ ] Construct an LLM prompt for the `RootCauseAgent` (using Gemini Flash for speed) to analyze the logs and output a structured JSON response containing `root_cause` and `suggested_fix`.
- [ ] Store this structured RCA payload in a new `task_failures` table or as a JSON blob in the `tasks` table under `failure_rca`.
- [ ] Enforce a timeout of 4 minutes on the LLM call to guarantee the <5 min resolution SLA.

## 3. Code Review
- [ ] Verify the prompt to the `RootCauseAgent` is properly delimited to prevent prompt injection from sandbox error logs.
- [ ] Ensure the LLM timeout logic correctly handles network failures and falls back to a generic "Timeout during RCA generation" message without crashing the orchestrator.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/core/reporting/DecisionTransparency.test.ts` to ensure RCA generation handles both successful API calls and simulated timeouts.

## 5. Update Documentation
- [ ] Document the RCA generation workflow and schema in `docs/architecture/error_handling.md`.
- [ ] Add the `RootCauseAgent` prompt template to `docs/prompts/rca_agent.md`.

## 6. Automated Verification
- [ ] Run an automated script `npm run test:e2e -- --scenario failure_rca` that purposefully fails a task in the sandbox and asserts that an RCA object with `root_cause` and `suggested_fix` is populated in the `.devs/state.sqlite` database within the required timeframe.
