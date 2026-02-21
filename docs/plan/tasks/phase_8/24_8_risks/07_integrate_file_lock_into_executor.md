# Task: Integrate FileLockManager into task executor to enforce write locks (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-047]

## 1. Initial Test Written
- [ ] Write integration tests at tests/integration/executor-locking.spec.ts that simulate two parallel tasks with overlapping input_files; assert that the executor enforces the FileLockManager policy (second task waits or fails to acquire lock) and that only one task writes to each file at a time.

## 2. Task Implementation
- [ ] Modify the task execution pipeline (e.g., src/lib/executor or DeveloperAgent execution code) to:
  - Before any write operation, call FileLockManager.acquire(ownerTaskId, input_files, { wait: true, timeoutMs: configurable }).
  - On success proceed with writes; on failure, pause the task and persist state to state.sqlite and mark task as PAUSED_FOR_LOCK.
  - Ensure release(ownerTaskId) is called on successful commit or on abort/exception.

## 3. Code Review
- [ ] Validate that lock acquisition happens prior to any writes, that release is guaranteed in finally blocks, and that paused states are persisted for manual inspection. Check that timeouts are reasonable and documented.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/integration/executor-locking.spec.ts --run and ensure exclusive-write semantics are enforced by the executor.

## 5. Update Documentation
- [ ] Update docs/risks/file_locking.md with an executor integration section describing state transitions (RUNNING -> PAUSED_FOR_LOCK -> RESUMED/ABORTED).

## 6. Automated Verification
- [ ] Run an end-to-end simulation that starts two executor instances (simulated) attempting overlapping writes and assert via logs and FileLockManager.status() that only one owner held overlapping locks at any point.
