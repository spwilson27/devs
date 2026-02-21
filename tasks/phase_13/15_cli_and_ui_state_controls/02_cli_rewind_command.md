# Task: Implement CLI `devs rewind <taskId>` Command (Sub-Epic: 15_CLI and UI State Controls)

## Covered Requirements
- [1_PRD-REQ-INT-006], [1_PRD-REQ-UI-011]

## 1. Initial Test Written
- [ ] In `src/cli/__tests__/rewindCommand.test.ts`, write unit and integration tests:
  - Test that `devs rewind <taskId>` resolves the target task's associated Git commit SHA from the `tasks` table (`tasks.git_commit_sha` column).
  - Test that `RewindManager.rewind(taskId)` calls `git checkout --force <sha>` (mock child_process/exec) with the correct SHA.
  - Test that after the git checkout, the SQLite `tasks` table has all tasks with `created_at > target_task.created_at` set to status `'REWOUND'` and the target task set to `'PENDING'`.
  - Test "dirty workspace detection": if `git status --porcelain` returns non-empty output, the rewind is blocked and an error is thrown with message `"Uncommitted changes detected. Commit or stash before rewinding."`.
  - Test that rewinding to a non-existent `taskId` throws a `TaskNotFoundError`.
  - Write an E2E test (using a temp git repo fixture) that runs the full rewind flow and asserts filesystem and DB state match expectations.

## 2. Task Implementation
- [ ] Add `devs rewind <taskId>` subcommand to the CLI entry point, accepting one positional argument.
- [ ] Implement `src/core/RewindManager.ts`:
  - `rewind(taskId: string): Promise<void>`:
    1. Call `DirtyWorkspaceDetector.check()` — abort if uncommitted changes exist.
    2. Query SQLite for `tasks WHERE id = taskId` to fetch `git_commit_sha`.
    3. Execute `git checkout --force <git_commit_sha>` via a promisified `execFile`.
    4. In a single SQLite transaction: mark all tasks newer than the target as `'REWOUND'`; set target task to `'PENDING'`; update `run_state.status = 'PAUSED'` and `run_state.current_task_id = taskId`.
- [ ] Implement `src/core/DirtyWorkspaceDetector.ts`:
  - `check(): Promise<void>` — runs `git status --porcelain`, throws `DirtyWorkspaceError` if output is non-empty.
- [ ] Print a confirmation prompt to stdout before executing (e.g., "⚠ Rewinding to task `<taskId>` (commit `<sha>`). This cannot be undone without a re-run. Continue? [y/N]") and read from stdin (can be bypassed with `--yes` flag).
- [ ] Emit structured log event `{ event: 'REWIND', targetTaskId, sha, timestamp }`.

## 3. Code Review
- [ ] Verify the git checkout and DB writes are sequenced correctly: git operation succeeds before DB transaction commits (never leave DB ahead of filesystem).
- [ ] Confirm `DirtyWorkspaceDetector` is called as the first step before any state mutation.
- [ ] Verify the confirmation prompt is skipped with `--yes` and that CI/non-interactive environments default to `--yes=false` (i.e., abort without explicit flag).
- [ ] Verify `git checkout --force` uses `execFile` (not `exec`) to avoid shell injection.
- [ ] Confirm the `REWOUND` status semantics are documented in the `tasks` table schema comments.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="rewindCommand"` and confirm all tests pass.
- [ ] Run the full test suite `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/cli-reference.md` with the `rewind` subcommand, its argument, flags (`--yes`), and example output.
- [ ] Update `src/core/RewindManager.agent.md` (AOD) describing the rewind sequence, DB schema columns touched, and Git interaction contract.
- [ ] Update `src/core/DirtyWorkspaceDetector.agent.md` (AOD) with its detection logic and error type.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="RewindManager"` and confirm line coverage ≥ 90%.
- [ ] In CI, run the E2E test fixture: `npm run test:e2e -- --grep "devs rewind"` and assert exit code 0.
