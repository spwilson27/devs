# Task: Implement Multi-Agent Collaboration Coordinator (Sub-Epic: 14_Multi-Agent & Distributed Execution)

## Covered Requirements
- [3_MCP-UNKNOWN-101], [UNKNOWN-801]

## 1. Initial Test Written
- [ ] In `packages/core/src/orchestration/__tests__/multi-agent-coordinator.test.ts`, write the following tests:
  - Test that the `MultiAgentCoordinator` can register multiple agent instances under the same `session_id` and returns each agent's unique `agent_id`.
  - Test that the coordinator enforces turn-ordering: if agent A is in an active turn, agent B's `requestTurn()` returns a pending promise that resolves only after A calls `completeTurn()`.
  - Test that the coordinator correctly serializes concurrent `requestTurn()` calls from three agents into a sequential execution queue per session.
  - Test that when an agent crashes mid-turn (throws an unhandled error), the coordinator releases the turn lock and allows the next agent to proceed.
  - Test that `getActiveTurnAgent(sessionId)` returns `null` when no agent is currently in a turn.
  - Test that coordinator emits a `'turn:completed'` event on the `EventEmitter` when an agent completes its turn, including the `agent_id` and `turn_index`.

## 2. Task Implementation
- [ ] Create `packages/core/src/orchestration/multi-agent-coordinator.ts`:
  - Implement `MultiAgentCoordinator` class extending `EventEmitter`.
  - Internal state: `Map<sessionId, { queue: Array<{agentId, resolve}>, currentAgentId: string | null, turnIndex: number }>`.
  - `registerAgent(sessionId: string): string` — generates a UUID `agent_id`, stores it in the session registry, returns it.
  - `requestTurn(sessionId: string, agentId: string): Promise<TurnHandle>` — enqueues the agent; resolves with a `TurnHandle` when it is the agent's turn. `TurnHandle.complete()` releases the lock and processes the queue.
  - `completeTurn(sessionId: string, agentId: string): void` — called internally by `TurnHandle.complete()`; emits `'turn:completed'` with `{ sessionId, agentId, turnIndex }` and advances the queue.
  - `getActiveTurnAgent(sessionId: string): string | null` — returns `currentAgentId` for the session.
  - Wrap queue processing in a `try/finally` block to guarantee lock release on agent error.
- [ ] Define `TurnHandle` interface in `packages/core/src/orchestration/types.ts`:
  ```ts
  interface TurnHandle {
    agentId: string;
    turnIndex: number;
    complete(): void;
  }
  ```
- [ ] Export `MultiAgentCoordinator` and `TurnHandle` from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify the `try/finally` pattern in queue processing guarantees the turn lock is always released even on uncaught agent errors.
- [ ] Confirm no shared mutable state exists outside of the internal `Map` (no module-level variables).
- [ ] Check that `registerAgent` uses a cryptographically random UUID (e.g., `crypto.randomUUID()`) rather than a sequential counter.
- [ ] Verify that events emitted from `completeTurn` include all three fields: `sessionId`, `agentId`, `turnIndex`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern multi-agent-coordinator` and confirm all tests pass.
- [ ] Run the concurrent test specifically: ensure the test that spawns three agents completes in the expected sequential order without deadlocks (test should have a 5s timeout).

## 5. Update Documentation
- [ ] Add `packages/core/src/orchestration/README.md` with a section "Multi-Agent Turn Coordination" explaining the queue-based turn serialization model, why it is needed (Glass-Box log integrity), and usage examples.
- [ ] Document the `'turn:completed'` event contract in JSDoc on `MultiAgentCoordinator`.
- [ ] Update `index.agent.md` to record that the `MultiAgentCoordinator` is the canonical mechanism for multi-agent turn management within a session.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` (exit code 0).
- [ ] Run `pnpm --filter @devs/core test` (exit code 0, no skipped tests).
- [ ] Confirm no TypeScript errors: `pnpm --filter @devs/core tsc --noEmit` exits with code 0.
