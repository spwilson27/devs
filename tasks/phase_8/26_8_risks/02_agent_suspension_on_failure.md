# Task: Implement agent suspension and suspended sandbox persistence (Sub-Epic: 26_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-074]

## 1. Initial Test Written
- [ ] Create a unit test at `tests/phase_8/26_8_risks/test_02_agent_suspension.py` that:
  - Mocks a `DeveloperAgent` execution loop to raise a deterministic implementation exception N times (use configuration SUSPEND_THRESHOLD = 5 for the test).
  - Asserts that when the threshold is reached the `SandboxManager.suspend(task_id, workspace_dir, reason, metadata)` method is invoked and returns a path to a persisted sandbox artifact.
  - Asserts the persisted sandbox contains `metadata.json` with keys `{task_id, timestamp, failure_count, last_error}` and a workspace snapshot (at least file list and compressed archive).

## 2. Task Implementation
- [ ] Implement `SandboxManager` with the following public API (place under `src/agent/sandbox_manager` or equivalent):
  - `suspend(task_id: str, workspace_root: Path, reason: str, metadata: dict) -> Path`:
    - Create a timestamped directory under `artifacts/suspended/<task_id>-<ts>/`.
    - Copy the workspace snapshot (exclude large binaries via `.gitignore`), write `metadata.json`, create an atomic `.tar.gz` archive, fsync all files and use atomic rename for final publish.
    - Return the absolute path to the created archive.
  - `resume(sandbox_path: Path) -> dict`:
    - Validate the archive, extract to a sandbox area, return parsed metadata and `workspace_root` path.
- [ ] Update `DeveloperAgent`'s execution loop to increment a per-task `failure_count` and call `SandboxManager.suspend(...)` when `failure_count >= SUSPEND_THRESHOLD` (configurable via env or config file). Mark the task state as `suspended` in the Commit/Task store (SQLite row).
- [ ] Ensure suspension redacts secrets from `metadata.json` (apply configured redaction rules before writing).

## 3. Code Review
- [ ] Ensure the persistence path is safe (no path traversal), uses atomic operations (write to temp -> fsync -> rename), and respects OS limits.
- [ ] Verify tests mock disk I/O where appropriate; real integration tests may use a temporary directory and assert behavior.
- [ ] Confirm that redaction is implemented consistently and unit-tested.

## 4. Run Automated Tests to Verify
- [ ] Run the test added in step 1, plus any unit tests for `SandboxManager` (e.g., `pytest tests/phase_8/26_8_risks/test_02_agent_suspension.py`).

## 5. Update Documentation
- [ ] Add `docs/agent_sandbox.md` describing suspension criteria, artifact layout, `metadata.json` schema, and instructions for a human to inspect or resume a suspended sandbox.

## 6. Automated Verification
- [ ] Add an integration script `scripts/test_suspend_flow.sh` that:
  - Spins up a test harness invoking the agent until it triggers suspension.
  - Validates the presence of `artifacts/suspended/<task_id>-*/metadata.json` and that the task state in the SQLite commit node is `suspended`.
