# Task: Implement agent_id Partitioning Schema in agent_logs (Sub-Epic: 14_Multi-Agent & Distributed Execution)

## Covered Requirements
- [3_MCP-UNKNOWN-101]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/agent-log-partition.test.ts`, write unit tests for the `agent_logs` partitioning schema:
  - Test that writing a log entry with a unique `agent_id` stores it in its own partition (i.e., reading logs filtered by `agent_id` returns only that agent's entries).
  - Test that two agents writing concurrently to the same Glass-Box session do NOT overwrite each other's entries (use `Promise.all` to simulate concurrent writes).
  - Test that reading all logs for a session returns a merged, chronologically ordered view from all `agent_id` partitions.
  - Test that an entry without `agent_id` is rejected with a typed `AgentLogPartitionError`.
  - Test that querying logs by both `session_id` and `agent_id` returns correct filtered results.

## 2. Task Implementation
- [ ] Define the `AgentLogEntry` TypeScript interface in `packages/core/src/protocol/types.ts`:
  ```ts
  interface AgentLogEntry {
    agent_id: string;        // UUID identifying the specific agent instance
    session_id: string;      // Glass-Box session this log belongs to
    turn_index: number;      // Turn number within this agent's execution
    timestamp_ns: bigint;    // Nanosecond-precision timestamp
    level: 'reasoning' | 'observation' | 'action' | 'error';
    payload: unknown;        // SAOP envelope or raw string
  }
  ```
- [ ] Update the SQLite schema in `packages/core/src/db/schema.sql` to add a composite primary key `(session_id, agent_id, turn_index)` and a `agent_id` column (TEXT NOT NULL) to the `agent_logs` table.
- [ ] Implement `AgentLogRepository` in `packages/core/src/db/agent-log-repository.ts`:
  - `insert(entry: AgentLogEntry): Promise<void>` — validates that `agent_id` is present (throws `AgentLogPartitionError` otherwise), then writes with the composite key.
  - `findByAgent(sessionId: string, agentId: string): Promise<AgentLogEntry[]>` — query filtered by both columns.
  - `findBySession(sessionId: string): Promise<AgentLogEntry[]>` — merges all partitions ordered by `timestamp_ns`.
- [ ] Add `AgentLogPartitionError` to `packages/core/src/protocol/errors.ts`.
- [ ] Export new types and repository from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify the composite primary key `(session_id, agent_id, turn_index)` is enforced at the DB level (check the migration file).
- [ ] Confirm no code path allows writing an `AgentLogEntry` without an `agent_id` (static type + runtime guard).
- [ ] Ensure the concurrent write test uses a real in-memory SQLite instance (via `better-sqlite3` or `@databases/sqlite`), not mocks, to prove actual isolation.
- [ ] Verify `timestamp_ns` uses `BigInt` (not `number`) to avoid precision loss at nanosecond scale.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern agent-log-partition` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core test -- --coverage` and confirm the `agent-log-repository.ts` file achieves ≥ 90% line coverage.

## 5. Update Documentation
- [ ] Update `packages/core/src/db/README.md` with a section "Agent Log Partitioning" describing the `agent_id` partition strategy, the composite key schema, and query patterns.
- [ ] Add a JSDoc comment to `AgentLogRepository` explaining concurrency safety guarantees.
- [ ] Update `index.agent.md` (the tool registration manifest) to record that `agent_logs` now requires an `agent_id` field in all write operations.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm TypeScript compilation exits with code 0.
- [ ] Run `pnpm --filter @devs/core test` and confirm all tests pass (exit code 0).
- [ ] Execute `node -e "const {AgentLogRepository} = require('./packages/core/dist'); console.log(typeof AgentLogRepository)"` and confirm output is `function`.
