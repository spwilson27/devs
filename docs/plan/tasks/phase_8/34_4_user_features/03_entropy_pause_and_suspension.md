# Task: Implement Entropy Pause and User Hand-off (Sub-Epic: 34_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-080]

## 1. Initial Test Written
- [ ] Create `tests/core/orchestration/EntropyPause.test.ts`.
- [ ] Write a test `should track total failed implementation attempts (both tests and compilations) per task`.
- [ ] Write a test `should transition task state to PAUSED_FOR_INTERVENTION after exactly 5 failures`.
- [ ] Write a test `should generate a Root Cause Analysis (RCA) draft summarizing the 5 failures upon pausing`.

## 2. Task Implementation
- [ ] Update the `TaskState` interface in `src/types/orchestration.ts` to include a `failure_count` integer and a `status` enum that includes `PAUSED_FOR_INTERVENTION`.
- [ ] In `TaskGraph.ts`, increment `failure_count` every time a `CodeNode` or `TestNode` returns a non-zero exit code or `FAILED` status.
- [ ] Add an evaluation step: if `failure_count >= 5`, halt the LangGraph execution cycle.
- [ ] Before halting, invoke a `RootCauseAgent` or utilize a lightweight flash model to summarize the history of the 5 failures into a short markdown string.
- [ ] Emit a `HITL_BLOCK_SIGNAL` event with the RCA summary over the Event Bus, alerting the VSCode extension/CLI that manual user intervention is required.

## 3. Code Review
- [ ] Check that `failure_count` is correctly persisted to the `tasks` table in SQLite so the count survives an orchestrator restart.
- [ ] Ensure the RCA generation handles large error contexts gracefully via summarization or truncation to fit token limits.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/core/orchestration/EntropyPause.test.ts`.
- [ ] Confirm 100% pass rate.

## 5. Update Documentation
- [ ] Update `docs/architecture/human_in_the_loop.md` to document the 5-failure threshold and the structure of the `HITL_BLOCK_SIGNAL` event.

## 6. Automated Verification
- [ ] Run an automated CLI scenario where a task intentionally fails 5 times. Assert that the CLI process cleanly halts, outputs the RCA text, and prompts the user with `[devs] Task paused for intervention.`