# Task: Implement `devs rewind` CLI Command and Rewind Orchestrator (Sub-Epic: 05_Full Rewind Execution)

## Covered Requirements
- [4_USER_FEATURES-REQ-002], [4_USER_FEATURES-REQ-074]

## 1. Initial Test Written
- [ ] In `src/cli/__tests__/rewind.command.test.ts`, write unit tests for the `rewind` CLI command:
  - Test that `devs rewind --to <task_id>` parses the `task_id` argument and calls `RewindOrchestrator.execute(taskId)`.
  - Test that `devs rewind` without `--to` exits with a non-zero code and prints a usage error message.
  - Test that `devs rewind --to <invalid_task_id>` (a task_id that does not exist in SQLite) exits with a non-zero code and prints `"Error: Task ID '<invalid_task_id>' not found."`.
- [ ] In `src/rewind/__tests__/rewind.orchestrator.test.ts`, write unit tests for `RewindOrchestrator`:
  - Mock `FilesystemResetter`, `RelationalStateResetter`, and `VectorMemoryPruner`.
  - Test that `execute(taskId)` calls `FilesystemResetter.reset(gitHash)`, then `RelationalStateResetter.reset(taskId)`, then `VectorMemoryPruner.prune(taskTimestamp)` in that exact order (use Jest `InOrder` or spy call counts and ordering).
  - Test that if `FilesystemResetter.reset` throws, the orchestrator does NOT call the subsequent steps and re-throws the error.
  - Test that if `RelationalStateResetter.reset` throws, the orchestrator does NOT call `VectorMemoryPruner.prune` and re-throws.
  - Test that on success, `execute(taskId)` returns a `RewindResult` object with `{ success: true, restoredTaskId, gitHash, durationMs }`.
- [ ] In `src/rewind/__tests__/rewind.orchestrator.integration.test.ts`, write an integration test:
  - Use an in-memory SQLite database seeded with 5 tasks each having a `git_commit_hash`.
  - Verify that `execute('task_3')` resolves the correct `git_commit_hash` for that task from the DB before passing it to `FilesystemResetter`.

## 2. Task Implementation
- [ ] Create `src/cli/commands/rewind.command.ts`:
  - Use the existing CLI framework (e.g., `commander` or `yargs`) to register the `rewind` command with a required `--to <task_id>` option.
  - Validate that `--to` is provided; print usage and exit with code 1 if missing.
  - Instantiate `RewindOrchestrator` with injected dependencies and call `orchestrator.execute(taskId)`.
  - On success, print `"✔ Rewind to task '<task_id>' complete."` to stdout and exit 0.
  - On error, print the error message to stderr and exit 1.
- [ ] Register the new command in `src/cli/index.ts` (or wherever existing commands are registered).
- [ ] Create `src/rewind/rewind.orchestrator.ts`:
  - Export class `RewindOrchestrator` with constructor accepting `{ db: Database, filesystemResetter: FilesystemResetter, relationalResetter: RelationalStateResetter, vectorPruner: VectorMemoryPruner }`.
  - Implement `async execute(taskId: string): Promise<RewindResult>`:
    1. Query SQLite `tasks` table for the record matching `taskId`. If not found, throw `RewindTaskNotFoundError`.
    2. Extract `git_commit_hash` and `completed_at` (timestamp) from the record.
    3. Call `await this.filesystemResetter.reset(git_commit_hash)`.
    4. Call `await this.relationalResetter.reset(taskId)`.
    5. Call `await this.vectorPruner.prune(completed_at)`.
    6. Return `{ success: true, restoredTaskId: taskId, gitHash: git_commit_hash, durationMs }`.
- [ ] Create `src/rewind/errors.ts` exporting `RewindTaskNotFoundError extends Error`.
- [ ] Create `src/rewind/types.ts` exporting the `RewindResult` interface: `{ success: boolean; restoredTaskId: string; gitHash: string; durationMs: number }`.
- [ ] Define stub interfaces `FilesystemResetter`, `RelationalStateResetter`, `VectorMemoryPruner` in `src/rewind/interfaces.ts` (concrete implementations are in subsequent tasks).

## 3. Code Review
- [ ] Verify the orchestrator uses constructor injection (not `new` inside the class) for all three dependencies, enabling testability.
- [ ] Confirm the three reset steps are called strictly sequentially (not `Promise.all`), since partial rewinds must be detectable.
- [ ] Verify error propagation: no swallowing of errors; all errors are re-thrown after logging.
- [ ] Confirm the CLI command does not contain business logic — it should only parse args, call the orchestrator, and handle output.
- [ ] Check that `RewindTaskNotFoundError` is a named subclass of `Error` with a `taskId` property for structured error handling downstream.
- [ ] Ensure `durationMs` is measured using `performance.now()` (or equivalent) wrapping the three reset calls.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="rewind.command|rewind.orchestrator"` and confirm all tests pass with 0 failures.
- [ ] Run `npm run lint` and confirm no new lint errors are introduced.
- [ ] Run `npm run build` and confirm TypeScript compilation succeeds with 0 errors.

## 5. Update Documentation
- [ ] Create `src/rewind/REWIND.agent.md` documenting:
  - The purpose of `RewindOrchestrator` and its three sequential steps.
  - The `RewindResult` type shape.
  - How to add a new rewind step (implement the relevant interface and inject it).
- [ ] Update `docs/cli-reference.md` (or equivalent) with the `devs rewind --to <task_id>` command, its arguments, and example output.
- [ ] Update `src/cli/commands/rewind.command.ts` with a JSDoc comment on the exported class/function describing the command contract.

## 6. Automated Verification
- [ ] Run `npx ts-node src/cli/index.ts rewind --to NONEXISTENT_TASK_999` in a shell with a real (test) SQLite DB and assert exit code is `1` and stderr contains `"not found"`.
- [ ] Run `npm test -- --coverage --testPathPattern="rewind"` and assert line coverage for `rewind.orchestrator.ts` is ≥ 90%.
- [ ] Confirm CI pipeline (`npm run ci` or equivalent) passes end-to-end without manual intervention.
