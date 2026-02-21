# Task: Implement `devs rewind` CLI Command and Rewind Orchestrator (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-002]

## 1. Initial Test Written
- [ ] Create unit tests in `src/cli/__tests__/rewind.command.test.ts`:
  - Test that `devs rewind --to <task_id>` parses `--to` and calls `RewindOrchestrator.execute(taskId)` once with the parsed taskId (use Jest spies/mocks).
  - Test that running `devs rewind` without `--to` exits with non-zero code and prints a usage/help message to stderr.
  - Test that `devs rewind --to <invalid_task_id>` prints `Error: Task ID '<invalid_task_id>' not found.` and exits non-zero.
- [ ] Create unit tests in `src/rewind/__tests__/rewind.orchestrator.test.ts`:
  - Mock `FilesystemResetter`, `RelationalStateResetter`, and `VectorMemoryPruner`.
  - Assert `RewindOrchestrator.execute(taskId)` calls the three dependencies in exact order (spy call order) and returns a `RewindResult` on success.
  - Assert that if any step throws, subsequent steps are NOT called and the error is re-thrown.
- [ ] Create an integration test `src/rewind/__tests__/rewind.orchestrator.integration.test.ts` using an in-memory SQLite DB seeded with task rows containing `git_commit_hash` and `completed_at`.
  - Verify `execute('task_3')` looks up the correct `git_commit_hash` and passes it to `FilesystemResetter.reset`.

## 2. Task Implementation
- [ ] Implement `src/cli/commands/rewind.command.ts`:
  - Use the existing CLI framework (commander/yargs) to register `rewind` with required `--to <task_id>` option.
  - Validate presence of `--to`; on missing option print usage and exit code `1`.
  - Instantiate `RewindOrchestrator` (constructor-injected dependencies) and call `await orchestrator.execute(taskId)`.
  - On success print `✔ Rewind to task '<task_id>' complete.` and exit `0`; on error print error to stderr and exit `1`.
- [ ] Export and register command in `src/cli/index.ts` (follow existing command registration style).
- [ ] Implement `src/rewind/rewind.orchestrator.ts`:
  - Export class `RewindOrchestrator` with constructor accepting `{ db, filesystemResetter, relationalResetter, vectorPruner }`.
  - Implement `async execute(taskId: string): Promise<RewindResult>`:
    1. Query SQLite `tasks` table for `taskId`; throw `RewindTaskNotFoundError` if missing.
    2. Extract `git_commit_hash` and `completed_at`.
    3. Call `await filesystemResetter.reset(git_commit_hash)`.
    4. Call `await relationalResetter.reset(taskId)`.
    5. Call `await vectorPruner.prune(completed_at)`.
    6. Return `{ success: true, restoredTaskId: taskId, gitHash: git_commit_hash, durationMs }`.
- [ ] Add `src/rewind/errors.ts` with `RewindTaskNotFoundError extends Error` and `src/rewind/types.ts` for `RewindResult`.
- [ ] Add `src/rewind/interfaces.ts` to define interfaces for `FilesystemResetter`, `RelationalStateResetter`, `VectorMemoryPruner`.

## 3. Code Review
- [ ] Confirm constructor injection for all dependencies to enable mocking in tests.
- [ ] Ensure the three reset steps run sequentially (no `Promise.all`) and that partial failure surfaces with a re-thrown error.
- [ ] Verify the CLI contains no business logic beyond argument parsing and calling the orchestrator.
- [ ] Ensure `RewindTaskNotFoundError` includes a `taskId` property for structured handling.
- [ ] Confirm time measurement for `durationMs` is implemented using `performance.now()` or equivalent.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="rewind.command|rewind.orchestrator"` and ensure 0 failures.
- [ ] Run `npm run lint` and ensure no new lint errors.
- [ ] Run `npm run build` and ensure TypeScript compiles with 0 errors.

## 5. Update Documentation
- [ ] Add `docs/rewind/REWIND.agent.md` describing `RewindOrchestrator`, the three reset steps, `RewindResult` shape, and how to add new reset steps.
- [ ] Update `docs/cli-reference.md` to include `devs rewind --to <task_id>` usage, expected outputs and examples.

## 6. Automated Verification
- [ ] In CI or dev environment run `npx ts-node src/cli/index.ts rewind --to NONEXISTENT_TASK_999` against a test SQLite DB and assert exit code `1` and stderr contains `not found`.
- [ ] Run `npm test -- --coverage --testPathPattern="rewind"` and assert line coverage for `rewind.orchestrator.ts` is >= 90%.
- [ ] Add a CI smoke step that runs the integration test and verifies the orchestration sequence completes.
