# Task: Implement Task Failure Gate (HITL Recovery) Triggered by Agent Entropy Limit (Sub-Epic: 13_Human-in-the-Loop Recovery)

## Covered Requirements
- [9_ROADMAP-REQ-006]

## 1. Initial Test Written
- [ ] Create `src/orchestration/__tests__/TaskFailureGate.test.ts` with the following test coverage:
  - **Unit: `evaluate()` does NOT trigger HITL below entropy threshold** — Call `TaskFailureGate.evaluate({ entropyScore: 0.4, taskId: 't1', threshold: 0.75 })` and assert the return is `{ triggered: false }` and `HumanInTheLoopManager.pause()` is NOT called.
  - **Unit: `evaluate()` triggers HITL when `entropyScore >= threshold`** — Call `evaluate({ entropyScore: 0.8, taskId: 't1', threshold: 0.75 })` and assert `{ triggered: true, sessionId: '<uuid>' }` is returned and `HumanInTheLoopManager.pause()` is called once with `taskId = 't1'`.
  - **Unit: `evaluate()` triggers HITL at exactly the threshold boundary** — Call `evaluate({ entropyScore: 0.75, taskId: 't1', threshold: 0.75 })` and assert `triggered === true`.
  - **Unit: `evaluate()` persists a `hitl_failure_gates` record on trigger** — Assert a row is inserted into `hitl_failure_gates` with: `task_id`, `entropy_score`, `triggered_at`, `session_id`, `reason = 'entropy_limit'`.
  - **Unit: `evaluate()` does NOT create duplicate gates for the same `taskId`** — Call `evaluate()` twice with the same `taskId` above threshold; assert `HumanInTheLoopManager.pause()` is called only once (idempotency guard via UNIQUE on `task_id` in `hitl_failure_gates`).
  - **Unit: `getGateStatus(taskId)` returns correct status** — Insert a `hitl_failure_gates` row with `session_id`; assert `getGateStatus(taskId)` returns `{ triggered: true, sessionId, reason: 'entropy_limit' }`.
  - **Integration: full entropy-limit flow suspends LangGraph execution** — Run a stubbed LangGraph graph configured to return high `entropyScore`; assert the graph emits a `GraphSuspendedSignal` and the HITL session is retrievable via `HumanInTheLoopManager.listPendingSessions()`.

## 2. Task Implementation
- [ ] Create `src/orchestration/TaskFailureGate.ts`:
  - Export interface `GateEvaluationInput { entropyScore: number; taskId: string; graphState: GraphState; threshold?: number; }`.
  - Export interface `GateEvaluationResult { triggered: boolean; sessionId?: string; }`.
  - Export class `TaskFailureGate` accepting `{ db: Database, manager: HumanInTheLoopManager, defaultThreshold?: number }` (default threshold: `0.75`).
  - Implement `async evaluate(input: GateEvaluationInput): Promise<GateEvaluationResult>`:
    1. Resolve `threshold = input.threshold ?? this.defaultThreshold`.
    2. If `input.entropyScore < threshold`, return `{ triggered: false }`.
    3. Check `hitl_failure_gates` for an existing row with `task_id = input.taskId`; if found, return `{ triggered: true, sessionId: existingRow.session_id }` (idempotency).
    4. Call `const session = await this.manager.pause(input.graphState, input.taskId)`.
    5. INSERT into `hitl_failure_gates` (`id UUID`, `task_id`, `entropy_score`, `triggered_at INTEGER`, `session_id`, `reason = 'entropy_limit'`).
    6. Return `{ triggered: true, sessionId: session.id }`.
  - Implement `getGateStatus(taskId: string): GateEvaluationResult | null`: SELECT from `hitl_failure_gates` WHERE `task_id = ?`; return mapped result or `null`.
- [ ] Create migration `src/db/migrations/014_create_hitl_failure_gates.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS hitl_failure_gates (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,
    entropy_score REAL NOT NULL,
    triggered_at INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT 'entropy_limit',
    FOREIGN KEY (session_id) REFERENCES hitl_sessions(id)
  );
  ```
- [ ] Integrate `TaskFailureGate.evaluate()` into the LangGraph orchestration loop in `src/orchestration/graph.ts`: after each agent node returns, extract `entropyScore` from the node output metadata and call `gate.evaluate(...)`. If `triggered`, throw `GraphSuspendedSignal`.
- [ ] Expose the configured entropy threshold in `src/config/defaults.ts` as `HITL_ENTROPY_THRESHOLD = 0.75` and allow override via the `DEVS_HITL_ENTROPY_THRESHOLD` environment variable.
- [ ] Export `TaskFailureGate` from `src/orchestration/index.ts`.

## 3. Code Review
- [ ] Verify the idempotency check (existing gate lookup) and the `pause()` call + INSERT are wrapped in a single SQLite transaction to prevent race conditions.
- [ ] Confirm `entropyScore` is validated to be in range `[0, 1]` before evaluation; throw `RangeError` if out of range.
- [ ] Verify the `DEVS_HITL_ENTROPY_THRESHOLD` env var override is parsed as a float and validated to be in `[0, 1]` at startup; log a warning and fall back to `0.75` if invalid.
- [ ] Confirm `GraphSuspendedSignal` is documented as a non-fatal signal (not an `Error`) to ensure upstream error handlers do not treat it as a crash.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=TaskFailureGate` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --coverage --testPathPattern=TaskFailureGate` and confirm line coverage ≥ 90% for `TaskFailureGate.ts`.

## 5. Update Documentation
- [ ] Create `src/orchestration/TaskFailureGate.agent.md` documenting: purpose, `evaluate()` and `getGateStatus()` contracts, idempotency guarantees, the `hitl_failure_gates` schema, the `DEVS_HITL_ENTROPY_THRESHOLD` env var, and the integration point in the LangGraph loop.
- [ ] Update `src/db/migrations/README.md` to list `014_create_hitl_failure_gates.sql`.
- [ ] Update `docs/configuration.md` to document the `DEVS_HITL_ENTROPY_THRESHOLD` environment variable with its default value and valid range.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=TaskFailureGate --reporter=json > /tmp/failure_gate_results.json` and assert `numFailedTests === 0` by running `node -e "const r=require('/tmp/failure_gate_results.json'); process.exit(r.numFailedTests)"`.
- [ ] Run `node -e "const db=require('better-sqlite3')(':memory:'); require('./dist/db/migrate').runMigrations(db); const cols=db.prepare(\"PRAGMA table_info(hitl_failure_gates)\").all(); console.assert(cols.length>=6,'Schema mismatch')"` to verify the migration applies cleanly.
- [ ] Run `npm run build` and confirm TypeScript compilation emits zero errors.
