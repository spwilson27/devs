# Task: Time-Travel Debugging (State Rewind) (Sub-Epic: 37_1_PRD)

## Covered Requirements
- [1_PRD-REQ-NEED-DEVS-02]

## 1. Initial Test Written
- [ ] Create `tests/core/time_travel.e2e.test.ts`.
- [ ] Write an E2E test that simulates the completion of three sequential tasks, creating three distinct git commits and SQLite state updates.
- [ ] Write a test asserting that calling `devs rewind --task-id <ID_1>` successfully restores both the SQLite database state and the Git HEAD to the exact point of the first task.

## 2. Task Implementation
- [ ] Implement the `rewind` command in `src/cli/commands/rewind.ts`.
- [ ] Implement the `TimeTravelManager` to correlate a given Task ID or Epic ID with its associated `git_commit_hash` in the SQLite `tasks` table.
- [ ] Use `git reset --hard <hash>` and `git clean -fd` to revert the filesystem, and execute a rollback or state mutation on the SQLite DB to mark subsequent tasks as incomplete or pending.

## 3. Code Review
- [ ] Ensure the database rewind and filesystem reset operations are performed atomically; if git fails, the database should not be corrupted.
- [ ] Verify that any transient sandbox states or temporary files are also cleared during the rewind process.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test tests/core/time_travel.e2e.test.ts` to ensure deterministic rewind functionality works as expected.

## 5. Update Documentation
- [ ] Document the `devs rewind` command in the CLI reference (`docs/cli.md`).
- [ ] Explain the Git-SQLite correlation architecture in `docs/architecture/state_management.md`.

## 6. Automated Verification
- [ ] Execute an automated bash script that writes a file, commits it, rewinds, and asserts the file no longer exists and the SQLite database state reflects the earlier task list.
