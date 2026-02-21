# Task: Implement devs rewind Restore Command with 100% Checksum Verification (Sub-Epic: 16_Real-Time Streaming and State Synchronization)

## Covered Requirements
- [9_ROADMAP-REQ-038]

## 1. Initial Test Written
- [ ] Create `src/__tests__/rewindCommand.test.ts`.
- [ ] Write an integration test that:
  1. Uses `CheckpointManager.snapshot()` to create a known checkpoint from a synthetic project directory.
  2. Mutates several files in the project directory (add content, delete a file).
  3. Calls `RewindCommand.execute(taskId, { devsDir })`.
  4. Asserts that every file listed in `files.manifest.json` has been restored to its exact pre-mutation state by re-computing SHA-256 on each file and comparing to the manifest entry (100% match required).
  5. Asserts that the restored `state.db` SHA-256 matches `snapshot.meta.json.dbChecksum`.
- [ ] Write a test verifying that if any file's post-restore checksum does not match the manifest, `RewindCommand.execute()` throws a `ChecksumMismatchError` and does NOT leave a partially restored state (atomicity).
- [ ] Write a test asserting that files present in the working directory but absent from the checkpoint manifest (i.e., added after the snapshot) are deleted during restore.
- [ ] Write a test confirming that `RewindCommand.execute()` with a non-existent `taskId` throws `CheckpointNotFoundError`.
- [ ] Write a test confirming that the SQLite `state.db` is restored before filesystem files (to ensure DB-first ordering on partial failures).

## 2. Task Implementation
- [ ] Create `src/commands/rewindCommand.ts` implementing a `RewindCommand` class with:
  - `static async execute(taskId: string, opts: { devsDir: string }): Promise<RewindResult>`:
    1. Resolve `checkpointDir = path.join(opts.devsDir, 'checkpoints', taskId)`. If missing, throw `CheckpointNotFoundError`.
    2. Read and parse `snapshot.meta.json` and `files.manifest.json` from `checkpointDir`.
    3. **Restore DB first**: Copy `<checkpointDir>/state.db.bak` → `<devsDir>/state.db` (overwrite). Verify its SHA-256 matches `meta.dbChecksum`; throw `ChecksumMismatchError` if not.
    4. **Restore files**: For each entry in the manifest, copy the file from `<checkpointDir>/<relativePath>` to `<devsDir>/<relativePath>`, creating parent directories as needed.
    5. After all files are restored, re-compute SHA-256 for every file and compare to the manifest. Collect mismatches.
    6. If any mismatches exist, throw `ChecksumMismatchError` with details. The restore is not rolled back (the checkpoint files are the source of truth; report errors for human review).
    7. Delete any files in `devsDir` (excluding `checkpoints/`) not present in the manifest.
    8. Return `RewindResult: { taskId, restoredFileCount, deletedFileCount, dbChecksum, success: true }`.
  - Define `CheckpointNotFoundError` and `ChecksumMismatchError` (with `mismatches: Array<{ path: string; expected: string; actual: string }>`) in `src/types/rewindErrors.ts`.
- [ ] Register `rewind <taskId>` as a CLI subcommand in `src/cli/commands.ts`, invoking `RewindCommand.execute()`.
- [ ] In the VSCode extension, add a `devs.rewind` command in `package.json` `contributes.commands` section that prompts for a Task ID via `vscode.window.showInputBox` and calls `RewindCommand.execute()`.
- [ ] Add `# [9_ROADMAP-REQ-038]` comments above the checksum verification block.

## 3. Code Review
- [ ] Verify DB restore happens before file restore in `execute()` so that if file restore fails, the DB is already consistent.
- [ ] Confirm `ChecksumMismatchError` includes the full list of mismatched paths for debuggability.
- [ ] Verify that orphan files (present post-snapshot, absent from manifest) are deleted to achieve a true point-in-time restore.
- [ ] Confirm `CheckpointNotFoundError` includes the `taskId` and the resolved `checkpointDir` path in its message.
- [ ] Verify that no write operations target the `checkpoints/` subdirectory during restore (it must remain read-only).
- [ ] Check TypeScript strict-mode compliance throughout.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=rewindCommand` and confirm all tests pass, including the 100% checksum match assertion.
- [ ] Run `npm run lint` and confirm zero violations.
- [ ] Run `npm run build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## devs rewind` section to `docs/cli-reference.md` documenting:
  - Usage: `devs rewind <taskId>`
  - Behavior: DB-first restore, full manifest checksum verification, orphan file deletion.
  - Error conditions: `CheckpointNotFoundError`, `ChecksumMismatchError`.
- [ ] Update `docs/architecture/checkpoint-system.md` with a "Restore Flow" section describing the DB-first ordering and post-restore verification step.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "REQ-038 (restore): `RewindCommand` restores DB first, then files, then performs 100% SHA-256 re-verification against the manifest before declaring success."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=rewindCommand --coverage` and assert coverage ≥ 90% for `src/commands/rewindCommand.ts`.
- [ ] Add a shell smoke test `scripts/smoke-test-rewind.sh` that:
  1. Creates a checkpoint from a synthetic `.devs/` directory.
  2. Corrupts two files in the directory.
  3. Runs `devs rewind <taskId>` via the compiled CLI binary.
  4. Re-computes SHA-256 on all restored files and asserts 100% match.
  5. Exits non-zero if any assertion fails.
- [ ] Run `bash scripts/smoke-test-rewind.sh` and confirm exit code 0.
- [ ] Execute `node scripts/validate-all.js` and confirm exit code 0.
