# Task: Deterministic Filesystem Snapshotting (Sub-Epic: 11_Escalation & Checkpoints)

## Covered Requirements
- [1_PRD-REQ-UI-016]

## 1. Initial Test Written
- [ ] Write integration tests in `tests/snapshot/snapshot_manager.test.ts`.
- [ ] Add a test that modifies a file within the workspace, creates a snapshot, modifies the file again, and then restores the snapshot, validating the file contents are perfectly reverted to the snapshot state.
- [ ] Add a test that verifies the snapshot metadata (e.g., Git commit hash) is correctly correlated and stored alongside the active Task ID in the SQLite database.

## 2. Task Implementation
- [ ] Implement a `SnapshotManager` module in `src/snapshot/snapshot_manager.ts`.
- [ ] Add a `createSnapshot(taskId)` method that uses `simple-git` (or a similar tool) to stage all current changes in the `/workspace`, create an atomic commit, and store the resulting commit hash in the SQLite `tasks` table for the given `taskId`.
- [ ] Add a `restoreSnapshot(taskId)` method that fetches the commit hash from the database for the given task, performs a hard reset (`git reset --hard <hash>`), and explicitly cleans untracked files (`git clean -fd`) to ensure deterministic recovery.
- [ ] Integrate the `SnapshotManager` into the pre-execution sequence of the LangGraph implementation node, ensuring a deterministic snapshot is automatically captured before any major or experimental task execution begins.

## 3. Code Review
- [ ] Ensure the snapshot logic gracefully handles edge cases such as excessively large files, `node_modules` (which should remain ignored via `.gitignore`), and system-locked files.
- [ ] Verify that the critical internal directories (`.devs/state.sqlite`, `.git`, etc.) are securely protected and not corrupted or deleted during a filesystem reset and clean operation.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/snapshot/snapshot_manager.test.ts` to verify the reliability of the deterministic snapshot and restore functionality.

## 5. Update Documentation
- [ ] Update `docs/snapshot_recovery.md` to outline the programmatic snapshot API and the rollback lifecycle.
- [ ] Add details to the Agent-Oriented Documentation (`.agent.md`) noting that pre-task snapshots are actively taken and can be relied upon for deterministic recovery if a catastrophic task failure occurs.

## 6. Automated Verification
- [ ] Execute a verification script (`scripts/verify_deterministic_snapshot.sh`) that generates a random source file, triggers `createSnapshot`, corrupts the source file, triggers `restoreSnapshot`, and automatically validates that the file's checksum perfectly matches the original pre-corruption state.
