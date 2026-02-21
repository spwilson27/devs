# Task: Graceful Suspension on Interruption (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-043]

## 1. Initial Test Written
- [ ] Unit tests for DeveloperAgent signal handling: simulate SIGINT/SIGTERM within the agent loop and assert that the agent transitions to a suspended state instead of aborting.
- [ ] Integration test that runs a short implementation turn (e.g., create a failing test, attempt a small change) and injects an interruption; assert that a suspended sandbox snapshot and a suspension metadata record are created.
- [ ] Tests should assert that suspension is non-destructive (no partial rewrites committed) and that resources (file locks) are released.

## 2. Task Implementation
- [ ] Modify the DeveloperAgent main loop to install safe interruption handling: do not perform complex I/O in the signal handler; instead set an interrupt flag and let the main loop execute suspension logic.
- [ ] Implement agent.suspend_current_turn(task_id) which:
  - Flushes in-memory buffers and current test outputs to disk.
  - Calls SuspendedSandboxManager.snapshot(task_id) (see separate task) to persist filesystem diffs, current HEAD, test outputs, agent logs, and environment metadata.
  - Releases any file locks and marks the task state as SUSPENDED in the task DB.
- [ ] Ensure the agent emits an event `agent:suspended` with references to the suspended snapshot id and human-readable guidance.

## 3. Code Review
- [ ] Verify signal-handling pattern is safe (no blocking operations in the handler itself).
- [ ] Confirm suspension logic runs under a single orchestrator to avoid races with other concurrent agent operations.
- [ ] Ensure all persisted artifacts are checksummed and the suspension path is atomic (write to temp then rename).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for the signal-to-suspend transition.
- [ ] Run integration tests that simulate an interrupted turn and assert suspended snapshot presence and task status = SUSPENDED.

## 5. Update Documentation
- [ ] Add docs/agent/suspension.md describing the interruption behavior, how to resume, and what the suspended snapshot contains.
- [ ] Document the event `agent:suspended` and how UIs should surface it.

## 6. Automated Verification
- [ ] Provide a reproducible script scripts/test_interrupt_suspension.sh that launches the agent in a test mode, sends SIGINT, and verifies the suspended snapshot and DB record exist and checksums match.
