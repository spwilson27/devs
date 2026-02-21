# Task: Implement HITL Gate State Machine for Gated Autonomy (Sub-Epic: 13_Agent Autonomy & Reviewer Intelligence)

## Covered Requirements
- [3_MCP-REQ-UI-001]

## 1. Initial Test Written

- [ ] In `packages/core/src/orchestrator/__tests__/hitl-gate.test.ts`, write the following tests **before** writing any implementation code:
  - **Unit: FREEZE transition** — Given an `OrchestratorStateMachine` instance in `RUNNING` state, calling `triggerGate({ gate_id: "tas_approval", reason: "TAS must be approved" })` MUST transition the machine to a `FROZEN` state and emit a `gate:frozen` event with the `gate_id` payload. Assert the state is `FROZEN` and the emitted event payload is correct.
  - **Unit: RESUME transition** — Given a `FROZEN` machine, calling `resumeGate({ gate_id: "tas_approval", action: "approve", feedback: "Approved" })` MUST transition back to `RUNNING` and emit a `gate:resumed` event. Assert that the state returns to `RUNNING`.
  - **Unit: REJECT transition** — Given a `FROZEN` machine, calling `resumeGate({ gate_id: "tas_approval", action: "reject", feedback: "Rejected" })` MUST transition to `TERMINATED` and emit a `gate:rejected` event.
  - **Unit: Illegal transition guard** — When the machine is in `FROZEN` state, calling `triggerGate(...)` again MUST throw an `InvalidStateTransitionError` with message `"Cannot freeze: already frozen"`.
  - **Unit: `manage_hitl_gate` MCP tool — list action** — Mock the state machine. Call `manage_hitl_gate({ action: "list" })`. Assert the response is an array of all currently open gates with their `gate_id`, `reason`, and `created_at` fields.
  - **Unit: `manage_hitl_gate` MCP tool — approve action** — Mock the state machine. Call `manage_hitl_gate({ action: "approve", gate_id: "tas_approval", feedback: "Looks good" })`. Assert `resumeGate` is called with the correct arguments and the tool returns a `GateStatus` object with `status: "resumed"`.
  - **Integration: Gate persistence** — After triggering a gate, assert that a row is written to `state.sqlite` in the `hitl_gates` table with columns: `id`, `gate_id`, `reason`, `status` (`OPEN`), `created_at`, `resolved_at` (null). After resuming, assert `resolved_at` is populated and `status` is `APPROVED`.

## 2. Task Implementation

- [ ] Create `packages/core/src/orchestrator/hitl-gate.ts`:
  - Define a `HitlGateStatus` enum: `OPEN`, `APPROVED`, `REJECTED`.
  - Define a `HitlGate` interface: `{ id: string; gate_id: string; reason: string; status: HitlGateStatus; created_at: string; resolved_at: string | null; feedback: string | null }`.
  - Implement a `HitlGateManager` class with methods:
    - `openGate(gate_id: string, reason: string): Promise<HitlGate>` — inserts a row into `state.sqlite.hitl_gates` and emits `gate:frozen` via the orchestrator event bus.
    - `resolveGate(gate_id: string, action: "approve" | "reject", feedback: string): Promise<HitlGate>` — updates the row in SQLite, sets `resolved_at` to current ISO timestamp, sets `status`, and emits `gate:resumed` or `gate:rejected`.
    - `listOpenGates(): Promise<HitlGate[]>` — queries `hitl_gates WHERE status = 'OPEN'`.
  - Create the SQLite schema migration in `packages/core/src/db/migrations/005_hitl_gates.sql`:
    ```sql
    CREATE TABLE IF NOT EXISTS hitl_gates (
      id TEXT PRIMARY KEY,
      gate_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      feedback TEXT
    );
    ```
- [ ] Create `packages/core/src/orchestrator/state-machine.ts` (or extend existing):
  - Add a `FROZEN` state to the LangGraph state machine alongside `RUNNING` and `TERMINATED`.
  - On entering `FROZEN`: call `HitlGateManager.openGate(gate_id, reason)`. The machine MUST block further node transitions until state returns to `RUNNING`.
  - The machine returns to `RUNNING` only when `HitlGateManager.resolveGate` is called with `action: "approve"`.
  - On `action: "reject"`: transition to `TERMINATED`, storing the feedback in the active task record.
- [ ] Register `manage_hitl_gate` as an MCP tool in `OrchestratorServer` (`packages/core/src/mcp/orchestrator-server.ts`):
  - Input schema:
    ```typescript
    {
      action: "approve" | "reject" | "list";
      gate_id?: string;
      feedback?: string;
    }
    ```
  - Return type: `GateStatus` (`{ gate_id: string; status: "open" | "resumed" | "rejected"; feedback?: string }`).
  - Route each `action` to the corresponding `HitlGateManager` method.

## 3. Code Review

- [ ] Verify the state machine uses a discriminated union or an explicit state enum — no free-form strings for states.
- [ ] Verify that `HitlGateManager.openGate` wraps the SQLite insert in a transaction (ACID per [3_MCP-REQ-REL-004]).
- [ ] Verify the `manage_hitl_gate` tool input is validated against a Zod schema before any business logic executes.
- [ ] Confirm there is no polling loop — gate resolution MUST be event-driven (emitter-based), not a `setInterval` check.
- [ ] Confirm that the `FROZEN` → node-blocking logic does not discard in-progress SAOP envelopes; they must be suspended and resumable.

## 4. Run Automated Tests to Verify

- [ ] Run: `cd packages/core && npm test -- --testPathPattern="hitl-gate"` and confirm all tests pass with exit code `0`.
- [ ] Run: `npm run lint && npx tsc --noEmit` in `packages/core` and confirm zero errors or warnings.
- [ ] Run the full suite: `npm test` from the monorepo root to confirm no regressions.

## 5. Update Documentation

- [ ] Update `packages/core/src/mcp/orchestrator-server.ts` JSDoc to include the `manage_hitl_gate` tool description, parameters, and return schema.
- [ ] Create `packages/core/src/orchestrator/.agent.md` documenting:
  - The `HitlGateManager` introspection point and its data schema.
  - Valid state transitions: `RUNNING → FROZEN → RUNNING | TERMINATED`.
  - The `gate:frozen` and `gate:resumed` events and their payloads.
- [ ] Append the new `hitl_gates` table schema to `docs/db-schema.md`.
- [ ] Update `.agent/index.agent.md` at the project root to register the `manage_hitl_gate` tool under `OrchestratorServer`.

## 6. Automated Verification

- [ ] Run `node scripts/verify-requirements.js --req 3_MCP-REQ-UI-001` and confirm the script reports `COVERED` by locating the `manage_hitl_gate` tool registration and the `FROZEN` state transition in the state machine source.
- [ ] Run the integration test suite with `npm run test:integration -- --grep "hitl-gate"` to confirm the SQLite gate lifecycle (open → approve → resolved_at populated) passes end-to-end.
