# Task: Implement Startup Lockfile Cleanup for Stale Git and SQLite Journal Files (Sub-Epic: 06_Crash Recovery and Resume)

## Covered Requirements
- [8_RISKS-REQ-043]

## 1. Initial Test Written
- [ ] In `src/startup/__tests__/lockfileCleanup.test.ts`, write unit tests for a `LockfileCleaner` class:
  - Test `clean()` when `.git/index.lock` exists: verify the file is deleted and a structured log entry (level `warn`, message `Removed stale lockfile`, path `.git/index.lock`) is emitted.
  - Test `clean()` when `.devs/state.sqlite-journal` exists: verify the file is deleted and the same structured log pattern is emitted with the correct path.
  - Test `clean()` when `.devs/state.sqlite-wal` exists: verify deletion and logging.
  - Test `clean()` when `.devs/state.sqlite-shm` exists: verify deletion and logging.
  - Test `clean()` when none of the lockfiles exist: verify no files are deleted and no warnings are emitted.
  - Test `clean()` when deletion fails with `EACCES`: verify the error is caught, a structured `error`-level log is emitted (not thrown), and the process continues (no crash).
  - Test `clean()` when deletion fails with `ENOENT` (race condition — file removed between check and delete): verify the error is silently ignored.
  - Write an integration test using a real temp directory: create the lockfiles, call `clean()`, and assert they are gone.

## 2. Task Implementation
- [ ] Create `src/startup/LockfileCleaner.ts`:
  - Define a `STALE_LOCKFILES` constant array:
    ```typescript
    const STALE_LOCKFILES = [
      '.git/index.lock',
      '.devs/state.sqlite-journal',
      '.devs/state.sqlite-wal',
      '.devs/state.sqlite-shm',
    ];
    ```
  - Implement `LockfileCleaner` as a class with a constructor accepting `projectRoot: string` and a `logger: Logger` (from the project's shared logger module).
  - Implement `async clean(): Promise<void>` that iterates `STALE_LOCKFILES`, resolves each relative to `projectRoot`, and for each:
    1. Checks existence with `fs.access`.
    2. If it exists, attempts `fs.unlink`.
    3. On success, logs `warn` with structured metadata `{ lockfile: absolutePath }`.
    4. On `ENOENT`, silently continues.
    5. On any other error, logs `error` with the error details and continues (never throws).
  - Export `LockfileCleaner` from `src/startup/index.ts`.
- [ ] In `src/startup/bootstrap.ts` (the application entry-point startup sequence), instantiate `LockfileCleaner` with the resolved project root and call `await cleaner.clean()` as the **first** async operation before any database connections are opened or LangGraph is initialized.

## 3. Code Review
- [ ] Verify `LockfileCleaner.clean()` never throws — all error paths must be caught internally.
- [ ] Confirm the cleanup runs before any `better-sqlite3` `Database` constructor call in the startup sequence (lockfile must be gone before SQLite opens the DB to avoid journal conflicts).
- [ ] Verify the `STALE_LOCKFILES` list covers both Git and SQLite WAL/SHM artefacts.
- [ ] Confirm structured logging uses the project-wide `Logger` abstraction, not `console.log`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=lockfileCleanup` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add `src/startup/LockfileCleaner.agent.md` documenting: purpose, the list of lockfiles cleaned, ordering guarantee (runs before DB open), and error-handling policy.
- [ ] Update `docs/architecture/startup-sequence.md` to include the lockfile cleanup step as the first item in the bootstrap checklist.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=lockfileCleanup --coverage` and assert line coverage for `LockfileCleaner.ts` is ≥ 95%.
- [ ] In CI, add a step: create `.git/index.lock` and `.devs/state.sqlite-journal` in a temp project root, run `node -e "require('./dist/startup').LockfileCleaner"` bootstrap integration, and assert both files are absent after execution.
