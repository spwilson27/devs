# Task: MCP Tool — `request_tas_revision` for Agent-Initiated TAS Changes (Sub-Epic: 06_Architecture Governance Gate)

## Covered Requirements
- [3_MCP-UNKNOWN-301]

## 1. Initial Test Written

- [ ] In `src/mcp/orchestratorServer/__tests__/tools/requestTasRevision.test.ts`, write unit and integration tests:
  - **Schema validation**: Test that calling `request_tas_revision` with a missing `blocker_description` field returns a structured MCP error `{ code: "INVALID_ARGUMENTS", field: "blocker_description" }`.
  - **Happy path**: Test that a valid call with `{ agent_id, task_id, blocker_description, proposed_changes }` returns `{ gate_id: <uuid>, status: "PENDING_APPROVAL" }` and inserts one row into the `tas_revision_requests` SQLite table.
  - **Duplicate gate prevention**: Test that calling `request_tas_revision` while another `TAS_REVISION_GATE` is already `PENDING_APPROVAL` returns `{ code: "GATE_ALREADY_ACTIVE", existing_gate_id: <uuid> }` and does NOT insert a new row.
  - **Frozen guard integration**: Test that after `request_tas_revision` succeeds, any subsequent call to the `write_task_result` MCP tool returns `{ code: "GATE_BLOCKED", gate_id }` until the gate resolves.
  - **Event emission**: Test that the tool emits a `HITL_GATE_REQUIRED` SSE event on the orchestrator event bus (assert with a mock event bus listener).

## 2. Task Implementation

- [ ] In `src/mcp/orchestratorServer/tools/requestTasRevision.ts`, implement the `request_tas_revision` MCP tool handler:
  - **Input schema** (Zod):
    ```typescript
    const RequestTasRevisionInput = z.object({
      agent_id: z.enum(["researcher", "architect", "developer", "reviewer"]),
      task_id: z.string().uuid(),
      blocker_description: z.string().min(20).max(2000),
      proposed_changes: z.object({
        sections_to_modify: z.array(z.string()),
        rationale: z.string().min(20),
        risk_assessment: z.string().min(20),
      }),
    });
    ```
  - **Logic**:
    1. Check `tas_revision_requests` table for any row with `status = "PENDING_APPROVAL"`. If found, return `GATE_ALREADY_ACTIVE` error.
    2. Generate `gate_id = crypto.randomUUID()`.
    3. Insert row into `tas_revision_requests` (columns: `gate_id`, `agent_id`, `task_id`, `blocker_description`, `proposed_changes_json`, `status`, `created_at`, `git_head`). Wrap in SQLite transaction.
    4. Dispatch `REQUEST_TAS_REVISION` event to the orchestrator state machine (via `OrchestratorStateMachineService`).
    5. Emit `HITL_GATE_REQUIRED` event on the SSE event bus with payload `{ gate_type: "TAS_REVISION", gate_id, agent_id, task_id }`.
    6. Return `{ gate_id, status: "PENDING_APPROVAL" }`.
  - **Guard middleware**: Register a middleware in `src/mcp/orchestratorServer/middleware/gateGuard.ts` that intercepts all write-capable MCP tool calls (e.g., `write_task_result`, `commit_task`) and rejects them with `GATE_BLOCKED` when `context.implementationFrozen === true`.
- [ ] Add the `tas_revision_requests` table migration to `src/db/migrations/`. Schema:
  ```sql
  CREATE TABLE IF NOT EXISTS tas_revision_requests (
    gate_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    blocker_description TEXT NOT NULL,
    proposed_changes_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    resolution_reason TEXT,
    reviewer_id TEXT,
    resolved_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    git_head TEXT NOT NULL
  );
  ```
- [ ] Register the tool in `src/mcp/orchestratorServer/index.ts` under the tool registry.

## 3. Code Review

- [ ] Confirm the Zod schema rejects empty strings and strings below the minimum lengths — this prevents agents from submitting vacuous revision requests.
- [ ] Confirm the `GATE_ALREADY_ACTIVE` guard is checked inside the same SQLite transaction as the insert (SELECT + INSERT must be atomic to avoid TOCTOU race conditions).
- [ ] Confirm the SSE event emission is fire-and-forget (non-blocking) — the tool must return before the SSE client acknowledges the event.
- [ ] Confirm the gate guard middleware is applied at the router level, not at individual tool handlers, so new write tools are protected by default.
- [ ] Confirm the `git_head` column is populated using `git rev-parse HEAD` at the moment of insertion (not at request time).

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="requestTasRevision"` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="gateGuard"` and confirm the middleware tests pass.
- [ ] Run `npm run type-check` and confirm no new TypeScript errors.
- [ ] Run `npm run lint` and confirm no violations.

## 5. Update Documentation

- [ ] Update `src/mcp/orchestratorServer/orchestratorServer.agent.md` to document the `request_tas_revision` tool: its input schema, return values, error codes, and the gate lifecycle it initiates.
- [ ] Add the tool to the OrchestratorServer tool registry table in `docs/mcp/orchestrator-tools.md`.
- [ ] Document the `tas_revision_requests` table in `docs/architecture/database-schema.md`.

## 6. Automated Verification

- [ ] Run `node scripts/verify_mcp_tool_registry.js` — asserts that `request_tas_revision` appears in the tool registry manifest. MUST exit 0.
- [ ] Run `node scripts/verify_sqlite_schema.js` — asserts that `tas_revision_requests` table exists with all required columns. MUST exit 0.
- [ ] Run `node scripts/verify_gate_guard_coverage.js` — asserts that all write-capable MCP tools are registered in the gate guard middleware's protected list. MUST exit 0.
