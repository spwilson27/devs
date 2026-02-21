# Task: Implement Atomic Snapshots and State Locking to Prevent Git History Corruption (Sub-Epic: 02_Filesystem State Restoration)

## Covered Requirements
- [8_RISKS-REQ-127]

## 1. Initial Test Written
- [ ] In `src/git/__tests__/state-lock.test.ts`, write unit tests for `StateLock`:
  - `StateLock.acquire(cwd)` creates a `.devs-state.lock` file in the project root with content `{ pid, timestamp, task_id }`.
  - Calling `acquire` a second time (lock file already exists) throws `StateLockConflictError` containing the lock holder's `pid` and `task_id`.
  - `StateLock.release(cwd)` removes the lock file; calling it when no lock exists is a no-op (does not throw).
  - `StateLock.isStale(cwd, maxAgeMs)` returns `true` if the lock file's `timestamp` is older than `maxAgeMs`.
- [ ] In `src/git/__tests__/atomic-snapshot.test.ts`, write unit tests:
  - `AtomicSnapshot.take(cwd)` runs `git stash push --include-untracked -m "devs-snapshot-<taskId>"` and returns the stash ref.
  - `AtomicSnapshot.restore(cwd, stashRef)` runs `git stash pop <stashRef>`.
  - If `git stash push` exits non-zero, an `AtomicSnapshotError` is thrown.
- [ ] In `src/orchestrator/__tests__/rewind-guard.integration.test.ts`, write an integration test:
  - Concurrently call `TaskRunner.run(task)` from two separate async contexts.
  - Assert that the second call receives `StateLockConflictError` and the first completes normally.

## 2. Task Implementation
- [ ] **StateLock Module**: Create `src/git/state-lock.ts`:
  ```typescript
  export interface LockData { pid: number; timestamp: string; task_id: string; }
  export class StateLockConflictError extends Error { lockData: LockData; }
  export class StateLock {
    static async acquire(cwd: string, taskId: string): Promise<void>
    static async release(cwd: string): Promise<void>
    static async isStale(cwd: string, maxAgeMs: number): Promise<boolean>
  }
  ```
  Use `fs.writeFile` with `{ flag: 'wx' }` (exclusive create) so the acquire is atomic at the OS level.
- [ ] **AtomicSnapshot Module**: Create `src/git/atomic-snapshot.ts`:
  ```typescript
  export class AtomicSnapshotError extends Error {}
  export class AtomicSnapshot {
    static async take(cwd: string, label: string): Promise<string>  // returns stash ref
    static async restore(cwd: string, stashRef: string): Promise<void>
    static async drop(cwd: string, stashRef: string): Promise<void>
  }
  ```
- [ ] **SQLite WAL Journal Cleanup**: In `src/db/migrator.ts` startup sequence, before any query:
  - Check for `.devs.db-wal` and `.devs.db-shm` files.
  - If present, log a warning and call `PRAGMA wal_checkpoint(TRUNCATE)` to safely recover from a crash.
- [ ] **Orchestrator Integration**: Wrap the entire task execution block in `src/orchestrator/task-runner.ts`:
  ```
  StateLock.acquire → AtomicSnapshot.take → [task execution] → AtomicSnapshot.drop → StateLock.release
  ```
  On any unhandled exception: call `StateLock.release` and preserve the stash ref in SQLite (`tasks.snapshot_stash_ref` column) for recovery.
- [ ] **Stale Lock Cleanup on Startup**: In `src/cli/startup.ts`, add a check:
  - If `StateLock.isStale(cwd, 300_000)` (5 min stale), auto-release the stale lock and log a `WARN`.

## 3. Code Review
- [ ] Confirm `fs.writeFile` with `flag: 'wx'` is truly atomic on the target OS (Linux/macOS POSIX semantics). Document the known caveat for NFS mounts in `state-lock.agent.md`.
- [ ] Verify the `AtomicSnapshot.take` stash label includes the `task_id` so manual inspection can identify stashes by task.
- [ ] Confirm all `StateLock` and `AtomicSnapshot` operations are wrapped in try/finally blocks in `TaskRunner` so locks are never abandoned on exceptions.
- [ ] Check that the `tasks` table migration adding `snapshot_stash_ref TEXT` is idempotent (wrapped in `IF NOT EXISTS` pattern or a new migration file).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="state-lock|atomic-snapshot|rewind-guard"` and confirm all tests pass.
- [ ] Run `tsc --noEmit` to confirm no TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/git/state-lock.agent.md` documenting the lock file format, stale timeout policy, and the known NFS caveat.
- [ ] Update `docs/architecture/state-management.md` with a "State Locking" section explaining the acquire/release lifecycle and how atomic stash snapshots protect against partial commit corruption.

## 6. Automated Verification
- [ ] Run `npm test -- --ci --testPathPattern="state-lock|atomic-snapshot|rewind-guard"` and assert exit code `0`.
- [ ] Manually verify: start two concurrent `devs run` processes against the same project dir; confirm the second outputs `StateLockConflictError` and exits with code `1`.
