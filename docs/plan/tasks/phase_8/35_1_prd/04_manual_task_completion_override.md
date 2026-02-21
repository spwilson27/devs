# Task: Implement Task Skip and Manual Completion (Sub-Epic: 35_1_PRD)

## Covered Requirements
- [1_PRD-REQ-UI-010]

## 1. Initial Test Written
- [ ] Create a test file `src/core/orchestrator/__tests__/TaskOverrideManager.test.ts`.
- [ ] Write a test `should allow skipping an active task, marking it as SKIPPED, and resolving DAG dependencies`.
- [ ] Write a test `should allow manually completing a task, marking it as COMPLETED, and unblocking the next tasks`.
- [ ] Write a test `should throw an error if trying to override a task that is already completed`.

## 2. Task Implementation
- [ ] Create a `TaskOverrideManager` service.
- [ ] Implement `skipTask(taskId)` which updates the task state to `SKIPPED` in SQLite and halts any active agent processes for that task.
- [ ] Implement `completeTaskManually(taskId)` which updates the state to `COMPLETED`.
- [ ] Ensure both methods trigger the DAG recalculation logic to unblock downstream tasks appropriately.
- [ ] Dispatch an event (e.g., `TASK_OVERRIDDEN`) so the VSCode UI/CLI can reflect the new status immediately.

## 3. Code Review
- [ ] Verify that manually completing or skipping a task cleanly terminates any hanging Sandbox containers or agent loops.
- [ ] Check the DAG orchestrator to ensure `SKIPPED` tasks don't break dependencies for tasks that require the output (skip logic must be robust).
- [ ] Ensure audit logs are written indicating the human user manually intervened.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- src/core/orchestrator/__tests__/TaskOverrideManager.test.ts`.
- [ ] Verify state transitions and event emissions.

## 5. Update Documentation
- [ ] Document the human intervention manual overrides in the `docs/architecture/state_machine.md`.
- [ ] Add CLI command documentation for `devs skip` and `devs complete`.

## 6. Automated Verification
- [ ] Run a mock orchestration flow, pause it, manually invoke `completeTaskManually()`, and verify the graph transitions to the subsequent node without running tests.
