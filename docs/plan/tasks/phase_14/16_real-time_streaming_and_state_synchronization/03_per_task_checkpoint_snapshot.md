# Task: Implement Per-Task Checkpoint Snapshot System for devs rewind (Sub-Epic: 16_Real-Time Streaming and State Synchronization)

## Covered Requirements
- [9_ROADMAP-REQ-038]

## 1. Initial Test Written
- [ ] Create `src/__tests__/checkpointManager.test.ts`.
- [ ] Write a unit test that calls `CheckpointManager.snapshot(taskId)` against a temporary `.devs/` directory containing synthetic files and a seeded SQLite state DB, then asserts that the resulting snapshot directory `(.devs/checkpoints/<taskId>/)` contains:
  - A `state.db.bak` file whose SHA-256 checksum matches the original `state.db`.
  - A `files.manifest.json` listing every file path and its SHA-256 checksum.
  - A `snapshot.meta.json` containing `{ taskId, timestamp, fileCount, dbChecksum }`.
- [ ] Write a test verifying that snapshotting a directory with 0 files produces a valid (empty) manifest rather than an error.
- [ ] Write a test asserting that if a snapshot for `taskId` already exists, `CheckpointManager.snapshot()` throws a `DuplicateCheckpointError` rather than silently overwriting.
- [ ] Write a test confirming that the snapshot operation is atomic: if it fails mid-way (simulated by injecting an error after writing half the files), the partial checkpoint directory is cleaned up and does not exist on disk.

## 2. Task Implementation
- [ ] Create `src/state/checkpointManager.ts` implementing a `CheckpointManager` class with:
  - `static async snapshot(taskId: string, opts: { devsDir: string }): Promise<CheckpointMeta>`:
    1. Resolve `checkpointDir = path.join(opts.devsDir, 'checkpoints', taskId)`.
    2. If `checkpointDir` already exists, throw `DuplicateCheckpointError`.
    3. Create a temp staging directory `checkpointDir + '.tmp'`.
    4. Copy `state.db` → `<staging>/state.db.bak` using `fs.copyFile`, compute its SHA-256 and store in metadata.
    5. Recursively walk `opts.devsDir` (excluding the `checkpoints/` subdirectory itself) using an async generator, compute SHA-256 for each file, and write entries to `files.manifest.json` in the staging directory.
    6. Write `snapshot.meta.json` with `{ taskId, timestamp: Date.now(), fileCount, dbChecksum }`.
    7. Atomically rename `checkpointDir + '.tmp'` → `checkpointDir` using `fs.rename`.
    8. Return `CheckpointMeta`.
  - Define `CheckpointMeta` in `src/types/checkpointMeta.ts`: `{ taskId: string; timestamp: number; fileCount: number; dbChecksum: string; checkpointDir: string }`.
  - Define `DuplicateCheckpointError extends Error` in the same file.
- [ ] Implement `src/utils/hashFile.ts` exporting `async function hashFile(filePath: string): Promise<string>` that streams the file through `crypto.createHash('sha256')` and returns the hex digest.
- [ ] Integrate snapshot creation into the existing task lifecycle: in `src/orchestrator/taskRunner.ts`, after a task transitions to `status: 'completed'`, call `CheckpointManager.snapshot(task.id, { devsDir })`.
- [ ] Add `# [9_ROADMAP-REQ-038]` comment above the `CheckpointManager` class definition.

## 3. Code Review
- [ ] Verify atomic rename pattern: the staging `.tmp` directory is always removed in the `catch` block if an error occurs before the rename.
- [ ] Confirm `hashFile` streams large files (does not `readFile` into memory) to avoid OOM on large generated projects.
- [ ] Verify the `checkpoints/` directory is excluded from the manifest walk to prevent recursive inclusion.
- [ ] Confirm `DuplicateCheckpointError` includes the `taskId` in its message for debuggability.
- [ ] Check that `CheckpointManager.snapshot()` is `async` throughout (no synchronous `fs` calls).
- [ ] Validate TypeScript strict-mode compliance: return types annotated, no implicit `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=checkpointManager` and confirm all tests pass.
- [ ] Run `npm run lint` on modified files and confirm zero violations.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Create `docs/architecture/checkpoint-system.md` documenting:
  - Directory layout: `.devs/checkpoints/<taskId>/state.db.bak`, `files.manifest.json`, `snapshot.meta.json`.
  - The atomic staging + rename pattern and why it prevents partial snapshots.
  - The SHA-256 hashing strategy.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "REQ-038 (snapshot): `CheckpointManager.snapshot()` atomically captures filesystem + SQLite state post-task using temp-dir + rename to guarantee no partial snapshots."
- [ ] Add inline `// [9_ROADMAP-REQ-038]` comments at the `fs.rename` call site in `checkpointManager.ts` to mark the atomicity guarantee.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=checkpointManager --coverage` and assert coverage ≥ 90% for `src/state/checkpointManager.ts` and `src/utils/hashFile.ts`.
- [ ] Execute `node scripts/validate-all.js` and confirm exit code 0.
- [ ] Add a shell-level smoke test in `scripts/smoke-test-checkpoint.sh` that:
  1. Creates a temp `.devs/` directory with 5 synthetic files and a seeded SQLite DB.
  2. Calls `node -e "require('./dist/state/checkpointManager').CheckpointManager.snapshot('task-001', { devsDir: '/tmp/test-devs' })"`.
  3. Asserts the checkpoint directory exists and `snapshot.meta.json` is valid JSON.
  4. Exits non-zero if any assertion fails.
- [ ] Run `bash scripts/smoke-test-checkpoint.sh` and confirm exit code 0.
