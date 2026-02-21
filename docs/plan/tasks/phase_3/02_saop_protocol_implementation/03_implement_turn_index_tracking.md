# Task: Implement turn_index Tracking in agent_logs (Sub-Epic: 02_SAOP Protocol Implementation)

## Covered Requirements
- [3_MCP-TAS-088], [TAS-035]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/turn-tracker.test.ts`, write unit tests that:
  - Test `TurnTracker` class instantiation with `new TurnTracker(agentId: string, phase: string)` and assert `currentIndex` starts at `0`.
  - Test `TurnTracker.nextIndex()` increments `currentIndex` by exactly `1` on each call and returns the new value.
  - Test that after calling `nextIndex()` five times, `currentIndex` equals `5`.
  - Test `TurnTracker.reset()` sets `currentIndex` back to `0`.
  - Test `TurnTracker.toLogEntry(): TurnLogEntry` returns an object with `{ turn_index, agent_id, phase, timestamp_ns }` where `timestamp_ns` is a `bigint` and `turn_index` matches `currentIndex`.
  - Test that `timestamp_ns` values from two successive `toLogEntry()` calls are strictly increasing (monotonic nanosecond clock).
  - Test `TurnTracker.attach(envelope: SaopEnvelope): SaopEnvelope` clones the envelope (does not mutate the original) and sets `turn_index` to `currentIndex`.
  - Test `TurnTracker.attach` with a frozen (immutable) envelope object and assert no mutation occurs on the original.

- [ ] In `packages/core/src/protocol/__tests__/agent-log-store.test.ts`, write unit tests that:
  - Test `AgentLogStore.append(entry: TurnLogEntry): void` appends to an in-memory log without error.
  - Test `AgentLogStore.getAll(): TurnLogEntry[]` returns entries in insertion order.
  - Test `AgentLogStore.getByAgent(agentId: string): TurnLogEntry[]` returns only entries for the given `agent_id`.
  - Test `AgentLogStore.getByTurnIndex(index: number): TurnLogEntry | undefined` returns the correct entry or `undefined`.
  - Test that `AgentLogStore` enforces a configurable `maxSize` (e.g., 1000 entries) and drops the oldest entries when the limit is exceeded (FIFO eviction).
  - Test that all `TurnLogEntry` objects in the store have strictly monotonically increasing `timestamp_ns` values after sequential appends.
  - Test `AgentLogStore.clear()` empties the log.

## 2. Task Implementation
- [ ] Create `packages/core/src/protocol/turn-tracker.ts`:
  - Export interface `TurnLogEntry` with fields: `turn_index: number`, `agent_id: string`, `phase: string`, `timestamp_ns: bigint`.
  - Export class `TurnTracker`:
    - Constructor: `constructor(private agentId: string, private phase: string)` initializing `private currentIndex = 0`.
    - `get currentIndex(): number` — returns current value.
    - `nextIndex(): number` — increments and returns new `currentIndex`.
    - `reset(): void` — sets `currentIndex` to `0`.
    - `attach(envelope: SaopEnvelope): SaopEnvelope` — returns `{ ...envelope, turn_index: this.currentIndex }` (shallow clone, no mutation).
    - `toLogEntry(): TurnLogEntry` — returns `{ turn_index: this.currentIndex, agent_id: this.agentId, phase: this.phase, timestamp_ns: process.hrtime.bigint() }`.
- [ ] Create `packages/core/src/protocol/agent-log-store.ts`:
  - Export class `AgentLogStore`:
    - Constructor: `constructor(private maxSize = 1000)`.
    - `private log: TurnLogEntry[] = []`.
    - `append(entry: TurnLogEntry): void` — pushes entry; if `log.length > maxSize`, shifts the oldest entry.
    - `getAll(): TurnLogEntry[]` — returns a shallow copy of `this.log`.
    - `getByAgent(agentId: string): TurnLogEntry[]` — filters by `agent_id`.
    - `getByTurnIndex(index: number): TurnLogEntry | undefined` — finds first entry with matching `turn_index`.
    - `clear(): void` — sets `this.log = []`.
- [ ] Export `TurnTracker`, `TurnLogEntry`, `AgentLogStore` from `packages/core/src/protocol/index.ts`.

## 3. Code Review
- [ ] Verify `TurnTracker.attach` never mutates the passed-in `SaopEnvelope` object (uses spread/clone, not assignment).
- [ ] Verify `process.hrtime.bigint()` is used for nanosecond-precision timestamps (not `Date.now()` which is millisecond-precision).
- [ ] Verify `AgentLogStore` enforces `maxSize` on `append`, not lazily (i.e., the size never temporarily exceeds `maxSize`).
- [ ] Verify `AgentLogStore.getAll()` returns a shallow copy, not the internal array reference, to prevent external mutation.
- [ ] Verify `TurnTracker` is stateful but not a singleton — callers must instantiate one per agent/phase pair.
- [ ] Verify `TurnLogEntry.timestamp_ns` is typed as `bigint` (not `number`) to correctly represent nanosecond values above `Number.MAX_SAFE_INTEGER`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="turn-tracker|agent-log-store"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Add a `## Turn Tracking` section to `packages/core/src/protocol/README.md` describing:
  - `TurnTracker` purpose: stamps each envelope with a monotonically increasing `turn_index` before the orchestrator processes it.
  - `AgentLogStore` purpose: in-memory ring buffer (configurable max size) for persisting `TurnLogEntry` records to prevent context bloat.
  - A sequence diagram (Mermaid) showing: `Orchestrator → TurnTracker.nextIndex() → TurnTracker.attach(envelope) → AgentLogStore.append(entry)`.
- [ ] Update `packages/core/index.agent.md` to record: "`TurnTracker` and `AgentLogStore` implemented in `@devs/core/protocol/turn-tracker.ts` and `agent-log-store.ts`. `turn_index` is stamped onto envelopes before orchestrator execution. `AgentLogStore` uses FIFO eviction at configurable maxSize (default 1000) to prevent context bloat."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="turn-tracker" --verbose 2>&1 | grep -E "PASS|FAIL"` and confirm output contains only `PASS`.
- [ ] Run the following node snippet to assert monotonic timestamps:
  ```bash
  node -e "
    const { TurnTracker } = require('./packages/core/dist/protocol');
    const t = new TurnTracker('agent-1', 'phase-3');
    const e1 = t.toLogEntry(); t.nextIndex();
    const e2 = t.toLogEntry();
    if (e2.timestamp_ns <= e1.timestamp_ns) process.exit(1);
    console.log('monotonic_ok');
  "
  ```
  and assert it prints `monotonic_ok` and exits with code `0`.
