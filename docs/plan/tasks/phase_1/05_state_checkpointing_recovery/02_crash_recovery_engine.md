# Task: Implement Crash Recovery Engine for Deterministic Resume (Sub-Epic: 05_State Checkpointing & Recovery)

## Covered Requirements
- [1_PRD-REQ-REL-003], [1_PRD-REQ-SYS-002], [1_PRD-REQ-MET-014], [1_PRD-REQ-CON-002]

## 1. Initial Test Written
- [ ] Create an integration test suite in `@devs/core/tests/recovery/CrashRecovery.test.ts`.
- [ ] Test that `devs resume` can find the last successful checkpoint for a project in `.devs/state.sqlite`.
- [ ] Test the "Happy Path": Resume a LangGraph execution from the exact same node and state it was in before a clean exit.
- [ ] Test the "Crash Path": Interrupt a task, restart, and verify the orchestrator picks up from the same point without loss of reasoning or data (100% success rate).

## 2. Task Implementation
- [ ] Create `@devs/core/src/recovery/RecoveryManager.ts` responsible for detecting and preparing state for resume.
- [ ] Implement `getLatestCheckpoint(projectId: string)` function to query `state.sqlite` for the most recent `checkpoint_id`.
- [ ] Integrate with `@devs/core/src/orchestrator/LangGraphEngine.ts`:
    - [ ] When starting a project, check if checkpoints exist for the `projectId`.
    - [ ] If found, call `graph.invoke(input, { configurable: { thread_id: projectId }, checkpoint_id })` to resume the specific execution thread.
- [ ] Ensure that all local state (e.g., in-memory caches) is re-initialized from the checkpointed state before resuming the graph.
- [ ] Implement logic to mark tasks as `RESUMED` in the `tasks` table for auditing.

## 3. Code Review
- [ ] Verify that `thread_id` matches the `projectId` to ensure the correct state is recovered.
- [ ] Ensure that resumption logic doesn't re-execute already completed nodes unless the node itself is designed for re-execution.
- [ ] Check for data loss scenarios during resume: verify that the resumed state is identical to the checkpointed state.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core` and ensure all crash recovery tests pass.
- [ ] Run a manual `devs run` command, kill the process with `SIGKILL`, and then run `devs resume` to verify it continues from the correct task.

## 5. Update Documentation
- [ ] Update `docs/specs/1_prd.md` to confirm implementation of [1_PRD-REQ-MET-014] metrics.
- [ ] Add a "Crash Recovery" section to the project's troubleshooting guide.

## 6. Automated Verification
- [ ] Execute `scripts/simulate_crash_and_resume.sh` which:
    - [ ] Runs a task using `devs run`.
    - [ ] Force-kills the process after 5 seconds.
    - [ ] Runs `devs resume`.
    - [ ] Compares the output and state to verify 100% recovery success rate (checksum matching).
