# Task: CommitNode interface tests (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-TAS-087], [3_MCP-TAS-001]

## 1. Initial Test Written
- [ ] Create `tests/tasks/test_commitnode_interface.py` using pytest. The test should:
  - Use `tmp_path` to initialize a temporary git repository (run `git init` in the temp dir) and create a minimal project structure.
  - Create a `.devs/state.sqlite` SQLite file and a `tasks` table with schema `(id TEXT PRIMARY KEY, status TEXT, git_commit_hash TEXT, updated_at TEXT)`.
  - Import `mcp.nodes.commit_node.CommitNode` (import path to be defined) and call `CommitNode.commit_and_record(task_id='T-1', message='test commit', repo_path=tmp_repo, db_path=state_sqlite)`.
  - Assert that after call:
    - `git rev-parse HEAD` returns a valid commit hash.
    - The `tasks` table contains a row for `T-1` with `git_commit_hash` equal to the new commit hash and `status` equal to `COMPLETED`.
  - Write a negative test that simulates a commit failure (e.g., make `git` return non-zero) and assert that no new row is inserted into `tasks` (atomicity preserved).

## 2. Task Implementation
- [ ] Create the failing tests first; implementation will be performed after tests fail.

## 3. Code Review
- [ ] Ensure tests are deterministic, do not depend on network, and clean up temporary git repos. Tests should validate atomicity semantics explicitly.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_commitnode_interface.py -q` and confirm the initial tests fail (red) before implementation.

## 5. Update Documentation
- [ ] Add a short `docs/mcp/commitnode-tests.md` explaining the test plan and how to reproduce failures locally.

## 6. Automated Verification
- [ ] Provide a helper script `tests/scripts/verify_commitnode_atomic.sh` that runs the positive scenario and validates the sqlite `git_commit_hash` and `git log -1` match.