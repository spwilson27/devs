# Task: Implement Graceful Suspension on Network Loss with Auto-Resume (Sub-Epic: 09_Agent Error and Loop Handling)

## Covered Requirements
- [4_USER_FEATURES-REQ-043]

## 1. Initial Test Written
- [ ] In `src/orchestration/__tests__/networkSuspension.test.ts`, write unit and integration tests:
  - **Turn-state persistence**: When `saveCurrentTurnState(taskId, turnState)` is called, the full `turnState` JSON (LangGraph messages array, current node name, partial tool outputs) is written to `agent_turn_states` SQLite table (`task_id TEXT PK, turn_state_json TEXT, saved_at TEXT`).
  - **Network loss detection**: Mock the LLM client (`src/llm/client.ts`) to throw a `NetworkError`. Assert that the orchestrator catches it, calls `saveCurrentTurnState`, transitions the task to `PAUSED_FOR_INTERVENTION`, and does NOT re-throw (i.e., does not crash the process).
  - **Auto-resume on reconnection**: Simulate `networkMonitor` emitting `'reconnected'`. Assert that `resumeFromTurnState(taskId)` is called, the task status reverts to `IN_PROGRESS`, and the LangGraph graph re-invokes from the saved node with the saved messages.
  - **Idempotence**: Calling `saveCurrentTurnState` twice for the same task overwrites the previous snapshot (upsert semantics).
  - **No-op resume**: If `agent_turn_states` has no row for the given `taskId`, `resumeFromTurnState` returns `null` and does not attempt to resume.
- [ ] Write an E2E test: start a real agent turn against a stub LLM, drop the network mid-turn using `nock` or `msw`, verify the turn state row appears in SQLite, re-enable the network, verify the turn completes successfully.

## 2. Task Implementation
- [ ] Create `src/orchestration/networkSuspension.ts`:
  - `saveCurrentTurnState(taskId: string, turnState: TurnState): void` — upserts into `agent_turn_states`.
  - `resumeFromTurnState(taskId: string): TurnState | null` — reads and returns the stored turn state; updates task status to `IN_PROGRESS`.
  - `clearTurnState(taskId: string): void` — deletes the row after successful completion.
- [ ] Add the `agent_turn_states` table to `src/db/migrations/XXXX_add_turn_states.sql` with columns: `task_id TEXT PRIMARY KEY, turn_state_json TEXT NOT NULL, saved_at TEXT NOT NULL`.
- [ ] In `src/llm/client.ts`, wrap all LLM API calls in a try/catch that catches `NetworkError` (HTTP 5xx, ECONNREFUSED, ETIMEDOUT) and emits a `networkMonitor.emit('disconnected', { taskId })` event before rethrowing to the orchestrator.
- [ ] In `src/orchestration/orchestrator.ts`:
  - Catch `NetworkError` from the LLM client during a task turn.
  - Call `saveCurrentTurnState(taskId, currentTurnState)` immediately on catch.
  - Transition the task to `PAUSED_FOR_INTERVENTION` with reason `NETWORK_LOSS`.
  - Subscribe to `networkMonitor.on('reconnected', ...)` to call `resumeFromTurnState` and reinstate the task.
- [ ] Define `TurnState` interface in `src/types/turnState.ts`: `{ taskId: string, currentNode: string, messages: LangGraphMessage[], partialToolOutputs: Record<string, unknown> }`.
- [ ] Implement `NetworkMonitor` in `src/infrastructure/networkMonitor.ts` using `node:net` or `dns.lookup` polling every 5 seconds to detect reconnection; emits `'reconnected'` once connectivity is restored.

## 3. Code Review
- [ ] Verify that `saveCurrentTurnState` is called inside the same try/catch as the failing LLM call — not in a `finally` block that would also run on success (which would be wasteful).
- [ ] Confirm `NetworkMonitor` polling interval is configurable via environment variable `DEVS_NETWORK_POLL_INTERVAL_MS` (default 5000).
- [ ] Ensure `resumeFromTurnState` does not duplicate messages already processed — verify the `messages` array is replayed from the correct checkpoint, not from the beginning.
- [ ] Confirm all `TurnState` properties are strictly typed — no `any`.
- [ ] Verify the auto-resume flow has a maximum retry count (configurable, default 3) to prevent infinite reconnection loops.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=networkSuspension` and confirm all unit and integration tests pass.
- [ ] Run `npm test -- --coverage --testPathPattern=networkSuspension` and confirm line coverage ≥ 90% for `src/orchestration/networkSuspension.ts` and `src/infrastructure/networkMonitor.ts`.

## 5. Update Documentation
- [ ] Create or update `src/orchestration/networkSuspension.agent.md`:
  - Intent: persist in-flight LLM turn state to SQLite on network loss; auto-resume when connectivity is restored.
  - Edge Cases: network loss during DB write itself, reconnection while task is already cleaned up, repeated disconnections before resume.
  - Testability: unit tests with mocked LLM client and in-memory SQLite; E2E test with `nock`.
- [ ] Update `docs/reliability.md` to describe the network suspension/auto-resume lifecycle with a Mermaid sequence diagram.

## 6. Automated Verification
- [ ] Add CI step: `npm test -- --testPathPattern=networkSuspension --ci` must pass with zero failures.
- [ ] Add a smoke-test script `scripts/smoke_network_suspension.ts` that:
  1. Starts the orchestrator in test mode.
  2. Injects a `NetworkError` via a test hook.
  3. Queries SQLite to assert a `agent_turn_states` row exists.
  4. Emits a `reconnected` event.
  5. Asserts the row is deleted and the task is back to `IN_PROGRESS`.
- [ ] Run `npx ts-node scripts/smoke_network_suspension.ts` as a CI step and assert exit code 0.
