# Task: RefactorNode - File Locking and Sandbox Preservation (Sub-Epic: 12_3_MCP)

## Covered Requirements
- [3_MCP-TAS-085]

## 1. Initial Test Written
- [ ] Write tests to exercise concurrent apply_patch attempts and sandbox suspension behavior.
  - Test file: tests/unit/test_refactornode_locking.py
  - Tests to write first:
    1. test_acquires_file_lock: when apply_patch runs, it should acquire locks for all affected files and release them on success.
    2. test_lock_prevents_overlapping_writes: simulate two RefactorNode.apply_patch calls in parallel threads/processes; second call should fail-fast with LockAcquisitionError or return applied=False.
    3. test_sandbox_preservation_on_failure: if apply_patch fails mid-way (simulate adapter error), sandbox directory should be preserved in a suspended state under `.suspended/<task_id>/` with metadata explaining failure.

## 2. Task Implementation
- [ ] Implement robust locking and sandbox preservation:
  - Reuse or implement a FileLockManager in src/utils/file_lock_manager.{py,ts} with acquire(paths, timeout)->lock_token and release(lock_token).
  - Apply locks at the file granularity before reading/applying patches; use atomic lock files or OS-level file locks (fcntl/flock) consistent with project portability.
  - On failure, create a suspended sandbox snapshot: copy affected files to `.suspended/<task_id>/` + write `metadata.json` with node_id, task_id, timestamp, error, and git HEAD.
  - Ensure apply_patch has a finally block that releases locks and either cleans sandbox on success or leaves suspended snapshot on failure.

## 3. Code Review
- [ ] Verify:
  - Lock acquisition strategy prevents deadlocks (acquire in deterministic sorted order of file paths).
  - Timeouts are configurable and documented.
  - Suspended sandbox contains minimal necessary data to resume debugging (changed files, full workspace context if small, metadata).

## 4. Run Automated Tests to Verify
- [ ] Run locking tests with concurrency primitives provided by the test framework (threading or multiprocessing). Example: `pytest tests/unit/test_refactornode_locking.py -q`.

## 5. Update Documentation
- [ ] Add docs on sandbox suspension policy and how to resume from `.suspended/<task_id>/` in docs/agents/refactor_node.md under "Failure and Suspension" section.

## 6. Automated Verification
- [ ] Add a CI smoke check that attempts to acquire a lock on a temp file and verifies release behavior; this helps catch platform-specific lock regressions in CI images.
