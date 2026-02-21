# Task: Implement CommitNode core logic (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-TAS-087]

## 1. Initial Test Written
- [ ] Ensure failing tests from `04_commitnode_interface_tests` are present and failing.
  - If missing, create the tests described in `tests/tasks/test_commitnode_interface.py` that assert atomic commit + DB update.

## 2. Task Implementation
- [ ] Implement `mcp/nodes/commit_node.py` with class `CommitNode` and method `commit_and_record(task_id: str, message: str, repo_path: Path, db_path: Path) -> str`:
  - Use `subprocess.run(['git','add','-A'], check=True)` and `subprocess.run(['git','commit','-m', message], check=True)` to create a commit; capture commit hash with `git rev-parse HEAD`.
  - Open SQLite connection to `db_path` and perform an `INSERT OR REPLACE` into `tasks(id, status, git_commit_hash, updated_at)` inside a transaction. Use `BEGIN IMMEDIATE` or `BEGIN EXCLUSIVE` to prevent concurrent writers.
  - On any failure (git non-zero or DB error), rollback the DB transaction and propagate an exception; do not leave partial state.
  - Add parameterized SQL and ensure proper escaping.

## 3. Code Review
- [ ] Verify:
  - Proper use of transactions and `with` context managers for SQLite.
  - Errors from `git` are surfaced and cause DB rollback.
  - The commit operation is idempotent for a given workspace state.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_commitnode_interface.py -q` and confirm tests now pass.

## 5. Update Documentation
- [ ] Update `docs/mcp/commitnode.md` with function signatures, expected DB schema, example usage, and failure semantics (what to do on DB or git failure).

## 6. Automated Verification
- [ ] As part of CI, run a short verification script that initializes a temp repo, calls `CommitNode.commit_and_record(...)`, and asserts `git log -1 --pretty=%H` equals the `git_commit_hash` recorded in `.devs/state.sqlite`.