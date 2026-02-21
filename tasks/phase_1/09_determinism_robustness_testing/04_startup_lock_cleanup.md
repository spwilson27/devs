# Task: Automated Stale Lock and Journal Cleanup (Sub-Epic: 09_Determinism & Robustness Testing)

## Covered Requirements
- [8_RISKS-REQ-043]

## 1. Initial Test Written
- [ ] Write a test `tests/unit/startup_cleanup.test.ts`.
- [ ] Manually create empty files: `.git/index.lock` and `.devs/state.sqlite-journal`.
- [ ] Invoke the `Orchestrator.initialize()` method (or a dedicated `CleanupManager.performStartupCleanup()`).
- [ ] Assert that both files have been deleted.
- [ ] Assert that the `Orchestrator` starts successfully even if these files are missing (idempotency).

## 2. Task Implementation
- [ ] Implement a `CleanupManager` utility in `@devs/core/utils`.
- [ ] Add logic to check for the existence of:
    - `.git/index.lock`
    - `.devs/state.sqlite-journal`
    - `.devs/state.sqlite-shm` (if safe to delete)
    - `.devs/state.sqlite-wal` (only if the DB is closed and not in recovery)
- [ ] Integrate this `CleanupManager` into the main entry point of both the CLI and the VSCode Extension (via the common `@devs/core` initialization).
- [ ] Log a "Cleanup performed" event to `stdout` in verbose mode.

## 3. Code Review
- [ ] Ensure that the cleanup logic only runs when no other `devs` process is active (check for a primary process lock if implemented).
- [ ] Verify that `fs.unlinkSync` is handled with try-catch to avoid crashing if permissions are restricted.
- [ ] Confirm that deleting `.sqlite-journal` is safe (it usually is if the process that created it is dead).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and verify the startup cleanup tests pass.
- [ ] Manually simulate a "crashed" state by creating a lockfile and running `devs status`.

## 5. Update Documentation
- [ ] Update the `TAS` section on "Process Lifecycle" to document the automatic lock cleanup.

## 6. Automated Verification
- [ ] Run `scripts/verify_startup_resilience.sh` which creates stale locks, starts the orchestrator, and checks the logs for successful cleanup.
