# Task: Integrate CommitNode into ImplementationLoop for atomic commit + DB update (Sub-Epic: 06_3_MCP)

## Covered Requirements
- [3_MCP-TAS-094]

## 1. Initial Test Written
- [ ] Create an integration test at tests/integration/test_commitnode_integration.py that:
  - Prepares a temporary git repo and a temporary SQLite `state.sqlite` with a `tasks` table and at least one pending task row (status pending, id = 'task-123').
  - Mocks or uses the real git_utils.create_atomic_commit to produce a commit for changed files.
  - Runs the CommitNode implementation for task 'task-123'.
  - Asserts that after CommitNode.run(...) the `tasks` row for task-123 has `status`='success' and `git_commit_hash` equal to the created commit hash, and that the commit exists in the repo history.
  - This test should fail until CommitNode is implemented.

## 2. Task Implementation
- [ ] Implement CommitNode at src/nodes/commit_node.py with the following behavior:
  - Public API: `class CommitNode: def run(self, task_id: str, repo_path: str, db_path: str, commit_message: str) -> str`
  - Steps to achieve atomicity (recommended approach):
    1. Acquire an implementation-level lock (file lock or DB lock) to prevent concurrent commit flows.
    2. Option A (preferred): Create a snapshot of `state.sqlite` before making the commit (copy to tmp) to allow rollback.
    3. Call `git_utils.create_atomic_commit(repo_path, commit_message)` to produce a commit; capture `commit_hash`.
    4. Begin a SQLite transaction: UPDATE `tasks` SET status='success', git_commit_hash=? WHERE id=?; COMMIT.
    5. If DB update fails after commit was made, attempt compensating action:
       - If safe, run `git reset --hard <commit_hash>~1` to rewind the repo to previous HEAD (only if no other commits were introduced by other processes while lock was held).
       - Restore state.sqlite from the snapshot if needed.
    6. Return the `commit_hash` on success; raise a detailed exception on failure.
  - Ensure the CommitNode logs each step and stores telemetry for undo operations.

## 3. Code Review
- [ ] Verify that CommitNode is concurrency safe (locks, single-writer principle).
- [ ] Verify that any compensating git operations are conservative and check repository state before resetting HEAD to avoid data loss.
- [ ] Ensure exception messages are actionable and include cleanup instructions.

## 4. Run Automated Tests to Verify
- [ ] Run pytest tests/integration/test_commitnode_integration.py and confirm it passes.
- [ ] Run combined integration tests that exercise the entire ImplementationLoop to ensure CommitNode interacts with upstream nodes correctly.

## 5. Update Documentation
- [ ] Update docs/mcp_commit_flow.md describing CommitNode semantics, lock behavior, rollback strategy, and assumptions.
- [ ] Document known edge-cases and operator actions in the event of inconsistent states.

## 6. Automated Verification
- [ ] Add scripts/verify_commitnode.sh that:
  - Creates a temp repo and DB, runs CommitNode.run, then verifies DB `tasks.git_commit_hash` matches `git rev-parse <hash>` and that files in the workspace match the committed tree.
  - Simulates a DB write failure (e.g., revoke write perms) to verify compensating logic runs and repo is restored or snapshot is used.
