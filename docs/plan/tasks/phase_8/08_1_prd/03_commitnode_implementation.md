# Task: Implement CommitNode for Atomic Git Commits (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-004], [1_PRD-REQ-IMP-008]

## 1. Initial Test Written
- [ ] Create integration tests that assert CommitNode.commit_changes(sandbox_dir, task_id, files, metadata) performs an atomic, sandboxed git commit and records metadata:
  - Initialize a fresh git repo in sandbox_dir (git init), create and stage the provided files, call commit_changes.
  - Assert the commit exists (git --no-pager log -1 --pretty=%H) and that git --no-pager show -1 --pretty=%B includes a trailer "Task-ID: <task_id>" and the metadata JSON.
  - Assert the outer repository working tree and .git are untouched.
  - Simulate a failure during commit (e.g., lock error) and assert CommitNode rolls back to pre-commit state and returns structured error.

## 2. Task Implementation
- [ ] Implement CommitNode with APIs:
  - commit_changes(sandbox_dir, task_id, files, metadata): stages explicitly provided files, composes commit message with Task-ID trailer, performs git commit inside sandbox (use git --git-dir/--work-tree or run in sandbox's cwd), and writes a row to commits.sqlite with fields (task_id, commit_hash, message_trailer_json, timestamp).
  - Ensure the operation is atomic: wrap DB insert and git commit in a transaction-like flow and roll back DB insert if commit fails.
  - Return {commit_hash, task_id, message, timestamp} on success.

## 3. Code Review
- [ ] Verify:
  - Atomicity between git commit and commits.sqlite insertion.
  - No side-effects on the global repo; sandboxing enforced.
  - Proper handling of concurrent commits (file locks) and informative error messages.

## 4. Run Automated Tests to Verify
- [ ] Run commit node tests: ensure git commit contains Task-ID trailer and commits.sqlite contains corresponding row; simulate failure cases to confirm rollback.

## 5. Update Documentation
- [ ] Add docs/git.md describing CommitNode API, commit message format, commits.sqlite schema, and example queries to find commits by task_id.

## 6. Automated Verification
- [ ] Create scripts/verify_commitnode.(sh|py) that runs the integration test and verifies the commit message and DB row; exit 0 only on success.
