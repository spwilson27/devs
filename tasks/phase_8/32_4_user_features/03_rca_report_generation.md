# Task: Implement Root Cause Analysis (RCA) Reports (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-060]

## 1. Initial Test Written
- [ ] Write a unit test in `src/agents/reviewer.test.ts` that simulates a task failure after 5 retries.
- [ ] Assert that the `ReviewerAgent` is triggered with the failure history and generates an RCA markdown report.
- [ ] Assert that the generated RCA report is saved to `docs/rca/task_<ID>.md` and contains expected sections like "Failure Cause", "Dependencies", and "Hallucinations".

## 2. Task Implementation
- [ ] Create a new prompt template `rca_generation.prompt.ts` designed to analyze an agent's trace history and identify the root cause of repeated failures (e.g., dependency mismatch, tool hallucination, logic error).
- [ ] Update `src/orchestrator/loop.ts` to hook into the task failure event (after max retries are hit).
- [ ] On failure, compile the recent tool calls, sandbox outputs, and errors, and pass them to the `ReviewerAgent` using the RCA prompt.
- [ ] Parse the LLM output into a structured Markdown format.
- [ ] Implement file writing logic to save the report to the `.devs/rca/` or `docs/rca/` directory (depending on project config), named by the Task ID.
- [ ] Ensure the RCA report is also logged as a "Lesson Learned" in the `sqlite` database to prevent future agents from repeating the mistake.

## 3. Code Review
- [ ] Ensure the RCA prompt strictly instructs the LLM to be objective and concise, avoiding unnecessary conversational filler.
- [ ] Verify that file system writes for the RCA report handle missing directories (e.g., using `mkdir -p`).
- [ ] Confirm that PII or secrets are not leaked into the RCA reports from sandbox outputs.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- src/agents/reviewer.test.ts` to verify RCA report generation.
- [ ] Run the test suite to ensure no regressions in the standard Reviewer Agent validation pipeline.

## 5. Update Documentation
- [ ] Document the RCA generation feature in `docs/features/rca.md`, detailing where reports are saved and how they influence future tasks.
- [ ] Add context to the agent memory that RCA reports are now automatically generated on task failure.

## 6. Automated Verification
- [ ] Run an automated test script that forcefully fails a task via a mocked sandbox error, waits for the orchestrator to fail the task, and verifies that `docs/rca/task_<ID>.md` is created with valid Markdown content.