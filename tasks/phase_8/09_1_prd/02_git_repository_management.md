# Task: Implement Git repository management with atomic, task-scoped commits (Sub-Epic: 09_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-011]

## 1. Initial Test Written
- [ ] Create a unit test file `tests/unit/test_commit_node.py` that validates atomic, task-scoped commits and persistence of commit metadata. The test must:
  1. Use a temporary git repository (e.g., `tmp_path`) and initialize a repo (`git init`).
  2. Create and modify files, then call `CommitNode.commit_task_changes(task_id, author, message, files_to_stage)`.
  3. Assert a commit was created whose commit message contains a standardized header and a footer `Task-ID: <task_id>` and that the commit hash was returned.
  4. Simulate a commit failure (mock the underlying git library / CLI to raise an exception) and assert there are no partial changes left staged/committed and the repo HEAD remains unchanged.
  5. Assert the commit hash is persisted in the project's state store in the task record (`commit_hash` column) after success.

Example pytest sketch:

```python
def test_commit_task_changes(tmp_path, monkeypatch):
    repo = tmp_path / "repo"
    repo.mkdir()
    os.system(f"git init {repo}")
    # create file, change it
    # call CommitNode.commit_task_changes(...)
    # assert commit message contains 'Task-ID: <task_id>' and DB updated
```

## 2. Task Implementation
- [ ] Implement `CommitNode` (suggested path: `devs/git/commit_node.py`) with a public API `commit_task_changes(task_id, author, title, message, files_to_stage)`:
  - Acquire a file/branch lock to prevent parallel commits to the same repo.
  - Stage only the provided `files_to_stage` into a temporary index or a dedicated branch to avoid polluting the working index.
  - Create a commit with message format:

    Task: <task_id> - <short title>

    <longer description>

    Task-ID: <task_id>
    Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

  - After successful commit, persist `commit_hash` and `commit_message` in the task record in the state store in the same transactional scope.
  - On any failure, rollback the index/branch and release locks so the repo remains in the previous state; raise a descriptive exception.
  - Provide a small wrapper `CommitNode.verify_commit_integrity(commit_hash, task_id)` to assert the commit contains the `Task-ID` footer and matches the persisted metadata.

## 3. Code Review
- [ ] Verify:
  - Commits are atomic and isolated (no half-staged changes).
  - Locks are used to prevent concurrent commit races.
  - Commit message format includes `Task-ID` footer and the Co-authored-by trailer.
  - Persistence of `commit_hash` is performed in the same transaction as the commit acknowledgment.
  - Error handling covers git errors, IO errors, and DB failures.

## 4. Run Automated Tests to Verify
- [ ] Run:
  - `pytest -q tests/unit/test_commit_node.py`
  - Perform a manual smoke test: create a repo, call `CommitNode.commit_task_changes`, then run `git show --format=fuller <commit_hash>` and assert the message contains `Task-ID: <task_id>`.

## 5. Update Documentation
- [ ] Update `docs/PRD.md` or `docs/operations/git_commit.md` with:
  - The commit format, locking strategy, where commit metadata is persisted, and the rollback semantics on failure.

## 6. Automated Verification
- [ ] Add `scripts/verify_commit_node.sh` which:
  1. Runs the pytest file.
  2. Creates a temporary repo, performs a commit via `CommitNode`, and validates the commit message and persisted `commit_hash` in the state store.
  3. Exits non-zero if any check fails.
