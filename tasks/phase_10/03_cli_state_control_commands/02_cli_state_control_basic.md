# Task: CLI State Control Commands (Pause, Resume, Skip) (Sub-Epic: 03_CLI State Control & Commands)

## Covered Requirements
- [1_PRD-REQ-INT-006]

## 1. Initial Test Written
- [ ] Create integration tests in `packages/cli/src/__tests__/commands/stateControl.test.ts`.
- [ ] Mock the `Orchestrator` service to verify it receives the correct signals when commands are executed.
- [ ] Test `devs pause`: Verify that the orchestrator state transitions to `PAUSED` and the active agent loop stops.
- [ ] Test `devs resume`: Verify that the orchestrator state transitions back to `RUNNING` and the active task continues.
- [ ] Test `devs skip`: Verify that the current task is marked as `SKIPPED` in SQLite and the orchestrator moves to the next task in the DAG.

## 2. Task Implementation
- [ ] Register `pause`, `resume`, and `skip` commands in `packages/cli/src/index.ts` using `commander`.
- [ ] Implement command handlers in `packages/cli/src/commands/stateControl.ts`.
- [ ] Use the `OrchestratorClient` (which communicates via IPC or directly if same process) to signal state changes.
- [ ] Implement the `skipTask(taskId)` logic in the `@devs/core` orchestrator to cleanly terminate the current sandbox process and update the task DAG status.
- [ ] Ensure that `pause` and `resume` trigger appropriate UI events in the Ink-based TUI to update the StatusBadge.

## 3. Code Review
- [ ] Verify that commands handle "Invalid State" errors (e.g., trying to `resume` when already `RUNNING`).
- [ ] Ensure that `skip` updates the `tasks` table in SQLite with a reason or "Manual Skip" flag.
- [ ] Check that IPC timeouts are handled if the orchestrator is unresponsive.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/__tests__/commands/stateControl.test.ts`.
- [ ] Manually verify using `devs run --debug` and sending signals via another terminal.

## 5. Update Documentation
- [ ] Update `docs/cli/commands.md` with usage examples and descriptions for `pause`, `resume`, and `skip`.
- [ ] Document the internal IPC protocol used for state control signaling.

## 6. Automated Verification
- [ ] Execute a script that starts a long-running dummy task, sends a `pause` command, verifies the process is idle, then sends `resume` and verifies completion.
