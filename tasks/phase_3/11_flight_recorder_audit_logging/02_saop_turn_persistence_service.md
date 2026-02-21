# Task: Implement SAOP Turn Persistence Service (Sub-Epic: 11_Flight Recorder & Audit Logging)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-065], [3_MCP-TAS-075], [5_SECURITY_DESIGN-REQ-SEC-SD-068]

## 1. Initial Test Written
- [ ] In `packages/core/src/flight-recorder/__tests__/saopPersistence.test.ts`, write unit tests that:
  - Mock the SQLite database and assert that `persistSaopTurn()` writes a record to `agent_logs` **before** the function resolves (i.e., not deferred/async-batched).
  - Assert that calling `persistSaopTurn()` with a `THOUGHT` phase stores the `reasoning_chain` blob containing the full raw JSON of `payload.analysis.reasoning_chain` from the SAOP envelope.
  - Assert that calling `persistSaopTurn()` with an `ACTION` phase stores the serialized tool call in the `reasoning_chain` blob.
  - Assert that calling `persistSaopTurn()` with an `OBSERVATION` phase stores the raw observation in the `reasoning_chain` blob.
  - Assert that if the DB write throws, `persistSaopTurn()` rethrows the error and does **not** swallow it (the turn must not proceed on persistence failure).
  - Assert that `turn_index` is incremented monotonically per `(thread_id, task_id)` sequence.
- [ ] In `packages/core/src/flight-recorder/__tests__/saopPersistence.integration.test.ts`, write an integration test that:
  - Uses an in-memory SQLite database (after applying all migrations).
  - Simulates a full 3-turn SAOP sequence (THOUGHT → ACTION → OBSERVATION) via `persistSaopTurn()`.
  - Queries `agent_logs` and asserts exactly 3 rows are present, with `turn_index` values 0, 0, 0 (same turn, different phases) and `saop_phase` values `THOUGHT`, `ACTION`, `OBSERVATION`.
  - Asserts the `reasoning_chain` blob for `THOUGHT` is non-empty and can be deserialized to a valid `ReasoningChain` type.

## 2. Task Implementation
- [ ] Create `packages/core/src/flight-recorder/saopPersistence.ts` exporting:
  - `persistSaopTurn(db: Database, envelope: SAOP_Envelope, context: TurnContext): Promise<void>`:
    - Extracts `thread_id`, `task_id`, `agent_role`, `turn_index`, `git_commit_hash` from `context`.
    - Serializes `envelope.payload.analysis.reasoning_chain` to a `Buffer` (JSON-encoded UTF-8 blob) for all phases.
    - Calls `nowNanoseconds()` from `@devs/core/db/clock` to produce `timestamp_ns`.
    - Generates a UUID v4 for the `id` field using `crypto.randomUUID()`.
    - Executes an `INSERT INTO agent_logs (...)` statement **synchronously within the current transaction** (or begins one if none is active), then **commits before returning**.
    - Throws `FlightRecorderError` (a typed subclass of `Error`) if the insert fails, preserving the original SQLite error as `cause`.
  - `interface TurnContext { threadId: string; taskId: string; agentRole: AgentRole; turnIndex: number; gitCommitHash?: string; }`.
  - `class FlightRecorderError extends Error { constructor(message: string, cause?: unknown); }`.
- [ ] Register `persistSaopTurn` as a middleware step in `packages/core/src/protocol/saopProcessor.ts` so it is called at the start of each phase handler, **before** the phase logic executes.
- [ ] Add JSDoc on all exports referencing `[5_SECURITY_DESIGN-REQ-SEC-SD-065]` and `[5_SECURITY_DESIGN-REQ-SEC-SD-068]`.

## 3. Code Review
- [ ] Confirm `persistSaopTurn` is called **before** the next turn begins — verify no `await` is deferred to after turn logic in `saopProcessor.ts`.
- [ ] Confirm `reasoning_chain` is stored as a `Buffer` (binary blob), not a plain JSON string, to preserve binary fidelity.
- [ ] Confirm error handling: a DB failure surfaces immediately as a thrown `FlightRecorderError`; the turn processing halts.
- [ ] Confirm `turn_index` is derived from the envelope and not auto-incremented by the DB (the agent is authoritative on turn ordering).
- [ ] Confirm no partial-write scenario: the INSERT is atomic (single statement or wrapped in explicit transaction).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="saopPersistence"` and confirm all unit and integration tests pass.
- [ ] Run `pnpm --filter @devs/core build` and confirm TypeScript compilation produces no errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/flight-recorder.md` (create if absent) with a section **SAOP Turn Persistence** describing the middleware contract: "Every SAOP phase (THOUGHT, ACTION, OBSERVATION) is persisted atomically to `agent_logs` before the next phase begins. Failure is fatal to the turn."
- [ ] Update `docs/agent-memory/short-term.md` to reference `persistSaopTurn` as the entry-point for per-turn reasoning capture, noting req IDs `[5_SECURITY_DESIGN-REQ-SEC-SD-065]` and `[5_SECURITY_DESIGN-REQ-SEC-SD-068]`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:ci` and assert exit code is `0`.
- [ ] Run the integration test in isolation with `pnpm --filter @devs/core test -- --testPathPattern="saopPersistence.integration"` and assert the SQLite query returns exactly 3 rows.
- [ ] Confirm the middleware is wired by running `grep -rn "persistSaopTurn" packages/core/src/protocol/saopProcessor.ts` and asserting at least one match exists.
