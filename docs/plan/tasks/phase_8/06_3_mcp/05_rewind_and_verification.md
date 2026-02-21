# Task: Implement hard rewind mechanism that restores filesystem and database to commit state (Sub-Epic: 06_3_MCP)

## Covered Requirements
- [3_MCP-TAS-094]

## 1. Initial Test Written
- [ ] Create an integration test at tests/integration/test_rewind_to_commit.py that:
  - Prepares a temp repo and DB, performs a successful commit via CommitNode, records the commit hash in `tasks`.
  - Makes additional changes to files and the DB to diverge from the committed state.
  - Calls `rewind_to_commit(commit_hash)` and asserts that the repository files and DB `tasks` table match the state at the commit.
  - The test should fail before implementing rewind logic.

## 2. Task Implementation
- [ ] Implement `rewind_to_commit(commit_hash: str, repo_path: str, db_path: str)` in src/orchestrator/rewind.py with the following behavior:
  - Acquire the global repository lock to prevent concurrent operations.
  - Validate commit_hash exists in the repository: `git cat-file -t <hash>`.
  - Restore filesystem tree: `git reset --hard <commit_hash>` (or use worktree/checkout strategy to avoid altering working copies undesirably).
  - Restore DB snapshot:
    - Preferred approach: store a compressed DB snapshot at commit time in `db/snapshots/<commit_hash>.sqlite.gz` and on rewind: decompress snapshot over `state.sqlite`.
    - If snapshots are not implemented, document manual steps and fail the test with a clear error describing missing snapshot policy.
  - After restore, verify integrity: run a DB consistency check and a `git fsck`.

## 3. Code Review
- [ ] Confirm rewind only operates while holding locks and is idempotent.
- [ ] Verify policies for snapshot retention and size limits are enforced.
- [ ] Ensure rewinds do not leak sensitive data (snapshots should be subject to the project's zero-plaintext policies).

## 4. Run Automated Tests to Verify
- [ ] Run pytest tests/integration/test_rewind_to_commit.py and confirm it passes; run under temp repos to be safe.

## 5. Update Documentation
- [ ] Update docs/rewind.md describing the rewind workflow, operator impact, snapshot retention policy, and how to perform a manual restore.

## 6. Automated Verification
- [ ] Add scripts/verify_rewind.sh that:
  - Creates a commit and snapshot; mutates files and DB; runs rewind; then verifies file contents and DB values match expected snapshot.
  - Exit non-zero if verification fails.
