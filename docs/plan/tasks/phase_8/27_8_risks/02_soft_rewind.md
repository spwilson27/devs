# Task: Implement soft rewind checkpointing (Sub-Epic: 27_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-087]

## 1. Initial Test Written
- [ ] Detect project language/test runner (package.json -> Jest/TS, pyproject/requirements -> pytest). Write tests in the project's preferred stack.
- [ ] Create unit/integration tests that simulate a git-backed workspace and verify soft checkpoint creation and application without damaging uncommitted work.
  - Python (pytest): tests/risks/test_soft_rewind.py
    - Use tmp_path to create a repo, initialize git (subprocess `git init`), create file `file.txt` and commit.
    - Modify `file.txt` without committing.
    - Call SoftRewindManager.checkpoint(task_id, preserve_uncommitted=False) and then apply the checkpoint; assert working tree equals HEAD at checkpoint.
    - Repeat with preserve_uncommitted=True: checkpoint should store uncommitted patch and apply should restore HEAD while re-applying the uncommitted patch on top; assert resulting file content matches expected patched content.
  - Node/TS (jest): tests/risks/soft-rewind.test.ts with equivalent steps using `simple-git` or child_process git commands.
- [ ] Test names: `test_soft_rewind_basic_restore`, `test_soft_rewind_preserve_uncommitted`.

## 2. Task Implementation
- [ ] Implement `src/risks/soft_rewind.{py,ts}` with:
  - class SoftRewindManager:
    - checkpoint(task_id: str, preserve_uncommitted: bool) -> checkpoint_id: capture {
      head_commit: git rev-parse HEAD,
      uncommitted_patch: (if preserve_uncommitted) git diff --binary --no-color HEAD -- > patch.bin,
      metadata: {task_id, timestamp}
    }
    - apply_checkpoint(checkpoint_id, restore_uncommitted: bool): perform atomic restore sequence:
      1. create a temporary branch pointing at checkpoint.head_commit
      2. checkout temporary branch (detached) or git reset --hard <commit>
      3. if restore_uncommitted and patch present: apply patch via `git apply --index` or `git apply` + `git add` then leave uncommitted or reindex as required
      4. cleanup temporary branch
    - list_checkpoints(task_id) -> paginated list
  - Persist checkpoints in a RewindStore (SQLite table `rewind_checkpoints` with id, task_id, head_commit, patch_blob, created_at).
- [ ] Use gzip compression for stored patches to bound storage.
- [ ] Ensure operations are guarded by file locks and are reversible in case of failure (create a rollback temp branch and use it if apply fails).

## 3. Code Review
- [ ] Verify non-destructive defaults (checkpoint.apply must not delete uncommitted changes unless explicit flag `--discard-uncommitted` given).
- [ ] Verify binary-safe storage of patches and compression correctness.
- [ ] Ensure proper error handling and clear user-visible messages for failures.

## 4. Run Automated Tests to Verify
- [ ] Run the new soft-rewind tests:
  - Python: `pytest tests/risks/test_soft_rewind.py -q`.
  - Node: `npx jest tests/risks/soft-rewind.test.ts --runInBand`.
- [ ] Tests must run in a sandboxed environment (tmp git repos) and not affect developer working copies.

## 5. Update Documentation
- [ ] Add `docs/tasks/phase_8/27_8_risks/02_soft_rewind.md` that documents checkpoint schema, CLI usage (`devs soft-rewind create --task <id> [--preserve-uncommitted]`, `devs soft-rewind apply <id> [--restore-uncommitted]`), and recovery semantics.

## 6. Automated Verification
- [ ] Add `scripts/verify_soft_rewind.sh` which:
  - Initializes a temp git repo, commits file, creates a checkpoint (preserve_uncommitted both True/False), mutates workspace, applies checkpoint and validates HEAD and working tree contents are as expected.
  - Exits non-zero if mismatches occur.
- [ ] Optionally hook the verify script into CI when `src/risks/soft_rewind` changes.
