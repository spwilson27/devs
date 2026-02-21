# Task: LangGraph Checkpoint Persistence to SQLite (Sub-Epic: 03_Relational State Rollback)

## Covered Requirements
- [9_ROADMAP-REQ-014]

## 1. Initial Test Written
- [ ] In `src/state/__tests__/langgraph-checkpoints.test.ts`, write unit tests that verify:
  - `CheckpointPersister.save(checkpoint)` inserts a row into the `langgraph_checkpoints` table with columns: `id TEXT PRIMARY KEY`, `graph_id TEXT NOT NULL`, `node_name TEXT NOT NULL`, `turn_type TEXT NOT NULL CHECK(turn_type IN ('Thought','Action'))`, `serialized_state TEXT NOT NULL`, `task_id TEXT NOT NULL`, `created_at TEXT NOT NULL`.
  - If `save` throws mid-execution (mock `db.prepare().run()` to throw), no partial row exists in `langgraph_checkpoints`.
  - `CheckpointPersister.loadLatest(graphId)` returns the checkpoint with the highest `rowid` for a given `graph_id`, or `null` if none exist.
  - `CheckpointPersister.loadForTask(taskId)` returns all checkpoints for a given `task_id` ordered by `rowid ASC`.
  - `CheckpointPersister.deleteAfter(taskId, targetTaskId)` removes all rows where `task_id` sorts after `targetTaskId` in the canonical task ordering — used by the rewind path.
  - Killing the process (simulated via thrown error) between the "Thought" checkpoint save and the "Action" checkpoint save leaves only the "Thought" checkpoint persisted — confirming the system can resume from the exact turn.
- [ ] Write an integration test that replays a 5-turn LangGraph execution (alternating Thought/Action), kills the process after turn 3, then calls `loadLatest` and asserts it returns the turn-3 checkpoint with correct `turn_type`.

## 2. Task Implementation
- [ ] Create `src/state/CheckpointPersister.ts`:
  - `save(checkpoint: LangGraphCheckpoint): void` — uses `db.transaction()` to insert into `langgraph_checkpoints`. Serializes `checkpoint.state` to JSON string via `JSON.stringify`.
  - `loadLatest(graphId: string): LangGraphCheckpoint | null` — `SELECT ... ORDER BY rowid DESC LIMIT 1`.
  - `loadForTask(taskId: string): LangGraphCheckpoint[]` — `SELECT ... WHERE task_id = ? ORDER BY rowid ASC`.
  - `deleteAfter(targetTaskId: string, allTaskIds: string[]): void` — accepts the full ordered list of task IDs; computes the index of `targetTaskId`; deletes all checkpoint rows whose `task_id` is in the slice `allTaskIds[index+1:]` using a parameterized `IN (...)` clause.
- [ ] Define `LangGraphCheckpoint` interface in `src/state/types.ts` with fields: `id`, `graphId`, `nodeName`, `turnType: 'Thought' | 'Action'`, `state: Record<string, unknown>`, `taskId`, `createdAt: Date`.
- [ ] Wire `CheckpointPersister.save` into the LangGraph node execution lifecycle in `src/orchestration/graph-runner.ts` so it is called at the start of every node (before the node's async work) and immediately after the node's output is produced.
- [ ] Add migration for `langgraph_checkpoints` table to `src/state/migrations/index.ts` as a new versioned migration entry.

## 3. Code Review
- [ ] Verify the two `save` calls per node (pre-node "Thought" and post-node "Action") use separate transactions — they must be independently atomic so a crash between them leaves the Thought checkpoint intact.
- [ ] Confirm `deleteAfter` does not use string interpolation for the `IN` clause — build the parameterized placeholders as `Array(ids.length).fill('?').join(',')`.
- [ ] Ensure `graph-runner.ts` wraps the `CheckpointPersister.save` call in a `try/catch` that logs but does not crash the graph on checkpoint persistence failure (fail-open for forward execution, fail-closed for rewind).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/state/__tests__/langgraph-checkpoints.test.ts --coverage` and confirm all tests pass with branch coverage ≥ 90%.
- [ ] Run the integration replay test: `npx jest --testNamePattern="integration.*checkpoint"` and confirm the turn-3 checkpoint is returned correctly.

## 5. Update Documentation
- [ ] Add `CheckpointPersister` to `docs/architecture/state-management.md` under `## LangGraph Checkpoint Persistence`.
- [ ] Document the `langgraph_checkpoints` table schema and the Thought/Action turn model.
- [ ] Update `docs/agent-memory/phase_13_decisions.md`: "LangGraph checkpoints are persisted to SQLite per node turn (Thought and Action separately) so mid-turn crash recovery is possible without re-executing completed turns."

## 6. Automated Verification
- [ ] Run `npx tsc --noEmit` and confirm zero errors in `src/state/CheckpointPersister.ts` and `src/orchestration/graph-runner.ts`.
- [ ] Run `npx jest --ci --forceExit --testPathPattern=langgraph-checkpoints` and assert exit code `0`.
