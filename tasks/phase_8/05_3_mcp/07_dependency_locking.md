# Task: Implement dependency_manager locking for package.json updates (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-TAS-093]

## 1. Initial Test Written
- [ ] Create `tests/tasks/test_dependency_locking.py` using pytest:
  - Simulate two concurrent workers attempting to call `dependency_manager.update_dependencies(repo_path, edits)` using `concurrent.futures.ThreadPoolExecutor` or multiprocessing.
  - Ensure `update_dependencies` acquires a lock file at `.devs/locks/package.json.lock` (use PID-based lock file) and that the second worker either waits for the lock or fails cleanly with a `LOCKED` response.
  - After both workers finish, assert that only one `package.json` mutation was committed to git and that the git history contains a single commit for the change.

## 2. Task Implementation
- [ ] Implement `mcp/tools/dependency_manager.py` with `update_dependencies(repo_path: Path, edits: dict, timeout: int = 300) -> dict`:
  - Create `.devs/locks` directory if missing.
  - Acquire an exclusive OS-level lock on `.devs/locks/package.json.lock` using `fcntl` on Unix or a PID lock for portability.
  - Apply edits atomically: write to a temporary file and `os.replace()` to `package.json`.
  - Run `npm install --package-lock-only` (or `yarn install --mode=non-interactive`) inside the repo to update lock files.
  - Commit the change with an atomic Git commit message prefixed with the Task ID.
  - Release the lock and return a dict `{status: "OK", commit: <hash>}` or `{status: "LOCKED"}` if unable to acquire.

## 3. Code Review
- [ ] Verify:
  - Locking handles process crashes (stale PID file detection with TTL) and does not leave permanent locks.
  - Atomic file writes are used to prevent partial writes.
  - Function respects timeouts and returns actionable status codes.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_dependency_locking.py -q` and ensure concurrency behavior is validated.

## 5. Update Documentation
- [ ] Add `docs/mcp/dependency-manager.md` documenting lock location, lock semantics, and expected behavior when a lock is held.

## 6. Automated Verification
- [ ] After tests, ensure `.devs/locks/package.json.lock` is removed and `git log` shows a single commit corresponding to the dependency change.