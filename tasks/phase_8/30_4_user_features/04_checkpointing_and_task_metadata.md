# Task: Implement CheckpointManager and Task Checkpoint Metadata (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-023], [4_USER_FEATURES-REQ-002]

## 1. Initial Test Written
- [ ] Create unit tests in `src/checkpoint/__tests__/checkpoint.manager.test.ts`:
  - Test creating a checkpoint: calling `CheckpointManager.createCheckpoint(taskId)` stores a record in `checkpoints` table with fields `{ taskId, gitCommitHash, dbSnapshotPath, createdAt }` and returns `checkpointId`.
  - Test retrieving a checkpoint by `taskId` returns the latest checkpoint metadata.
  - Test atomicity: `createCheckpoint` should insert the checkpoint metadata only after the Git commit is successful (use mocks for git commit and DB insert to assert order).
- [ ] Create migration unit tests (if repo uses migrations) to verify schema change that adds `git_commit_hash` to `tasks` table or creates a `checkpoints` table.

## 2. Task Implementation
- [ ] Implement `src/checkpoint/checkpoint.manager.ts`:
  - Export `CheckpointManager` with methods `async createCheckpoint(taskId: string, options?: { message?: string })` and `async getLatestCheckpoint(taskId: string)`.
  - `createCheckpoint` should:
    1. Call `GitCommitService.commitTaskSnapshot(taskId, message)` (implemented in auto-commit task) which returns `gitCommitHash`.
    2. Create a DB snapshot file (prefer WAL-consistent copy) stored under `.devs/checkpoints/<checkpointId>.sqlite` and persist metadata in `checkpoints` table.
    3. Atomically write metadata after confirming git commit success.
- [ ] Add DB migration(s) to create `checkpoints` table with indexes on `taskId` and `createdAt`, and (optional) add `git_commit_hash` column to `tasks`.

## 3. Code Review
- [ ] Ensure `createCheckpoint` is atomic: commit happens before metadata persistence; on failure all partial artifacts are cleaned up.
- [ ] Verify snapshot storage path uses project-local `.devs/checkpoints/` and is excluded from normal workspace operations unless explicitly restored.
- [ ] Confirm migration files are idempotent and tested in CI against a fresh DB.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="checkpoint.manager|migrations"` and ensure all tests pass.
- [ ] Run DB migration verification scripts if present (e.g., `npm run db:migrate:check`).

## 5. Update Documentation
- [ ] Add `docs/checkpoints/CHECKPOINTS.md` describing checkpoint lifecycle, file locations, and restore workflow.
- [ ] Update developer README with instructions for adding and testing migrations.

## 6. Automated Verification
- [ ] CI job: create a test branch, run a task that triggers `createCheckpoint`, then verify `.devs/checkpoints/<id>.sqlite` exists and `checkpoints` table has an entry mapping to the commit hash.
- [ ] Run `git rev-parse HEAD` and verify it equals the `gitCommitHash` stored in the checkpoint metadata for the created checkpoint.
