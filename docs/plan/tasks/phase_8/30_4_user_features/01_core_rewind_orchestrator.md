# Task: Core Rewind Orchestrator & State Reversion (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-002], [4_USER_FEATURES-REQ-023]

## 1. Initial Test Written
- [ ] Create `src/core/orchestrator/__tests__/rewind_orchestrator.test.ts`.
- [ ] Write a test `should correctly fetch the git commit hash for a given task ID from SQLite`.
- [ ] Write a test `should execute git reset --hard to the retrieved commit hash`.
- [ ] Write a test `should delete all task records in SQLite that occurred after the target task ID`.
- [ ] Write a test `should call the vector database pruner to remove embeddings created after the target task timestamp`.
- [ ] Write an integration test `src/core/orchestrator/__tests__/rewind.integration.test.ts` to simulate a full rewind cycle using a temporary git repository and an in-memory SQLite instance.

## 2. Task Implementation
- [ ] Create `src/core/orchestrator/RewindOrchestrator.ts`.
- [ ] Implement the `executeRewind(targetTaskId: string)` method.
- [ ] Query the `tasks` table via the `SQLiteSaver` to retrieve the `git_commit_hash` and `completed_at` timestamp for `targetTaskId`.
- [ ] If no commit hash exists, throw a `RewindStateError`.
- [ ] Instantiate `GitManager` and execute `await gitManager.resetHard(commitHash)`.
- [ ] Execute a SQLite transaction to `DELETE FROM tasks WHERE completed_at > ?`, passing the target timestamp. Repeat for `agent_logs`, `entropy_events`, and `documents` tables to ensure database state aligns with the file system.
- [ ] Invoke `VectorMemoryManager.pruneAfter(timestamp)` to remove newer architectural embeddings from LanceDB.

## 3. Code Review
- [ ] Verify that all state cleanup operations (SQLite deletes) are wrapped in a single ACID transaction to prevent partial rewinds if the process crashes.
- [ ] Ensure `git reset --hard` handles untracked files appropriately (consider running `git clean -fd` as well).
- [ ] Check that `RewindOrchestrator` uses constructor dependency injection for the database and git managers.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit -- src/core/orchestrator/__tests__/rewind_orchestrator.test.ts` and verify all pass.
- [ ] Run `npm run test:integration -- src/core/orchestrator/__tests__/rewind.integration.test.ts` and verify it passes.

## 5. Update Documentation
- [ ] Update `docs/architecture/state_management.md` to document the exact sequence of operations during a rewind (Git -> SQLite -> LanceDB).
- [ ] Add an entry in `.agent.md` summarizing the `RewindOrchestrator` capabilities.

## 6. Automated Verification
- [ ] Run `npm run verify:coverage -- --lines 95 --file src/core/orchestrator/RewindOrchestrator.ts` to ensure the new class has at least 95% line coverage.
