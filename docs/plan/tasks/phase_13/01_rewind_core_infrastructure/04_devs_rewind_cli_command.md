# Task: Implement devs rewind CLI Command (Sub-Epic: 01_Rewind Core Infrastructure)

## Covered Requirements
- [9_ROADMAP-TAS-706], [2_TAS-REQ-008]

## 1. Initial Test Written
- [ ] Write a unit test (`src/cli/__tests__/rewindCommand.test.ts`) that mocks `rewindToTask` and asserts:
  - `devs rewind <taskId>` parses `taskId` from positional CLI argument and passes it to `rewindToTask(db, taskId, cwd)`.
  - `devs rewind <taskId> --repo /custom/path` passes `/custom/path` as `repoPath` instead of `cwd`.
  - On success, the CLI prints: `✓ Rewound to task <taskId> (git HEAD: <sha>). Removed <N> subsequent tasks.` to stdout.
  - On `RewindError('Dirty workspace: ...')`, the CLI prints the error message to stderr and exits with code `1`.
  - On `RewindError('Task not found')`, the CLI prints the error message to stderr and exits with code `1`.
  - On an unexpected `Error`, the CLI prints `Unexpected error during rewind: <message>` to stderr and exits with code `2`.
- [ ] Write an E2E test (`src/cli/__tests__/rewindCommand.e2e.test.ts`) using `execa` that:
  1. Initialises a temp Git repo and SQLite DB via `devs init`.
  2. Seeds the DB with 2 completed tasks with real Git SHAs.
  3. Runs `devs rewind <task1_id>` as a subprocess.
  4. Asserts exit code is `0`.
  5. Asserts stdout contains `✓ Rewound to task <task1_id>`.
  6. Asserts `git -C <repoPath> rev-parse HEAD` equals the SHA stored for task 1.
  7. Asserts the `tasks` table contains only task 1.

## 2. Task Implementation
- [ ] Create `src/cli/commands/rewind.ts` that exports a `yargs`-compatible command module:
  - `command: 'rewind <taskId>'`
  - `describe: 'Restore Git HEAD and SQLite state to a specific completed task ID'`
  - `builder`: define positional `taskId` (string, required) and option `--repo` (string, default: `process.cwd()`).
  - `handler(argv)`:
    1. Opens the SQLite DB using `openDatabase(path.join(argv.repo, '.devs', 'state.db'))`.
    2. Calls `await rewindToTask(db, argv.taskId, argv.repo)`.
    3. On success, prints the confirmation message to `process.stdout` and exits `0`.
    4. On `RewindError`, prints `error.message` to `process.stderr` and calls `process.exit(1)`.
    5. On any other error, prints `Unexpected error during rewind: ${error.message}` to `process.stderr` and calls `process.exit(2)`.
    6. Ensures `db.close()` is called in a `finally` block.
- [ ] Register the `rewind` command in the main `src/cli/index.ts` (or equivalent Yargs entry point) alongside existing commands (`init`, `run`, `status`).
- [ ] Ensure the CLI binary (`devs`) is defined in `package.json` under `"bin"` pointing to the compiled entry point.

## 3. Code Review
- [ ] Verify `db.close()` is always called in a `finally` block to prevent SQLite file locks from persisting after the CLI exits.
- [ ] Verify the exit code convention is respected: `0` success, `1` known/user-facing error (`RewindError`), `2` unexpected error.
- [ ] Verify `--repo` defaults to `process.cwd()` so the command works out-of-the-box when run from within a devs project directory.
- [ ] Confirm the `taskId` positional is documented in `--help` output with a clear description.
- [ ] Verify no business logic (Git/SQLite operations) lives in the command handler — it delegates entirely to `rewindToTask`.
- [ ] Confirm the command is registered in the main CLI index and appears in `devs --help`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/cli/__tests__/rewindCommand"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="src/cli/__tests__/rewindCommand.e2e"` and confirm the E2E test passes.
- [ ] Run `npm run build && ./bin/devs rewind --help` and confirm the help text includes `rewind <taskId>` and `--repo` option.
- [ ] Run `npm run type-check` and confirm zero TypeScript errors in `src/cli/commands/rewind.ts`.

## 5. Update Documentation
- [ ] Update `README.md` (or `docs/cli-reference.md`) to document the `devs rewind` command:
  - **Usage**: `devs rewind <taskId> [--repo <path>]`
  - **Description**: Restores the Git filesystem and SQLite relational state to the point after `<taskId>` completed. All tasks after `<taskId>` are deleted from the DB.
  - **Options**: `--repo` — path to the project root (defaults to current working directory).
  - **Exit codes**: `0` success, `1` user error (dirty workspace, task not found), `2` unexpected error.
- [ ] Create `src/cli/commands/rewind.agent.md` documenting the command's pre-conditions, post-conditions, and error handling for AI agent use.

## 6. Automated Verification
- [ ] Run the full test suite `npm test` and confirm all pre-existing tests still pass (no regressions).
- [ ] Run `npm run build && echo "Build succeeded"` to confirm the compiled output is valid.
- [ ] Execute the E2E verification script: `node scripts/verify_rewind_cli.js` which programmatically invokes `devs rewind` against a seeded test project and asserts the exit code, stdout message, Git HEAD, and DB row count are all correct.
