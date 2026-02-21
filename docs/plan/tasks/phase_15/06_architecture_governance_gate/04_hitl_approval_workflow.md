# Task: HITL Approval Workflow for TAS Revision Gate (Sub-Epic: 06_Architecture Governance Gate)

## Covered Requirements
- [3_MCP-UNKNOWN-301]

## 1. Initial Test Written

- [ ] In `src/mcp/orchestratorServer/__tests__/tools/manageTasRevisionGate.test.ts`, write unit and integration tests:
  - **List pending gates**: Test that `manage_hitl_gate { action: "list", gate_type: "TAS_REVISION" }` returns an array of all rows from `tas_revision_requests` with `status = "PENDING_APPROVAL"`, each including `gate_id`, `agent_id`, `task_id`, `blocker_description`, `diff_id`, and `prd_validation`.
  - **Approve — happy path**: Test that `manage_hitl_gate { action: "approve", gate_id: "<uuid>", reviewer_id: "user" }` updates `tas_revision_requests.status` to `"APPROVED"`, sets `resolved_at` and `reviewer_id`, dispatches `TAS_REVISION_APPROVED` to the state machine, and returns `{ status: "APPROVED", gate_id }`.
  - **Approve — applies diff**: Test that after approval, the `TasDocument` stored in `context.currentTas` reflects the approved changes (mock the `TasApplicator` service).
  - **Reject — happy path**: Test that `manage_hitl_gate { action: "reject", gate_id: "<uuid>", reviewer_id: "user", feedback: "..." }` updates `status` to `"REJECTED"`, sets `resolution_reason`, dispatches `TAS_REVISION_REJECTED` to the state machine, and returns `{ status: "REJECTED", gate_id }`.
  - **Reject — agent notification**: Test that rejection emits a `GATE_RESOLVED` SSE event with `{ gate_id, resolution: "REJECTED", feedback }` that agents can subscribe to and use to update their strategy.
  - **Unknown gate_id**: Test that `manage_hitl_gate { action: "approve", gate_id: "nonexistent" }` returns `{ code: "GATE_NOT_FOUND" }`.
  - **Already resolved**: Test that calling approve/reject on a gate with `status != "PENDING_APPROVAL"` returns `{ code: "GATE_ALREADY_RESOLVED", current_status }`.

## 2. Task Implementation

- [ ] In `src/mcp/orchestratorServer/tools/manageTasRevisionGate.ts`, extend the existing `manage_hitl_gate` tool (or create a dedicated handler) with TAS revision-specific logic:
  - **`action: "list"`**: Query `tas_revision_requests JOIN tas_revision_diffs USING (gate_id)` where `status = "PENDING_APPROVAL"`. Return full detail including the human-readable diff summary.
  - **`action: "approve"`**:
    1. Validate `gate_id` exists and `status = "PENDING_APPROVAL"` (inside a SQLite transaction).
    2. Fetch the `diff_json` from `tas_revision_diffs` for this `gate_id`.
    3. Call `TasApplicator.applyDiff(currentTas, diff)` to produce the updated `TasDocument`.
    4. Write the updated TAS back to `docs/architecture/TAS.md` via the filesystem (inside the same transaction, using a Git-staged write).
    5. Update `tas_revision_requests` row: `status = "APPROVED"`, `resolved_at`, `reviewer_id`.
    6. Dispatch `TAS_REVISION_APPROVED` event to the orchestrator state machine with `{ gate_id, approved_diff_id }`.
    7. Emit `GATE_RESOLVED` SSE event.
    8. Return `{ status: "APPROVED", gate_id, updated_tas_path: "docs/architecture/TAS.md" }`.
  - **`action: "reject"`**:
    1. Validate `gate_id` and `status` (inside a SQLite transaction).
    2. Update `tas_revision_requests`: `status = "REJECTED"`, `resolution_reason = feedback`, `resolved_at`, `reviewer_id`.
    3. Dispatch `TAS_REVISION_REJECTED` event to the orchestrator state machine with `{ gate_id, rejection_reason: feedback }`.
    4. Emit `GATE_RESOLVED` SSE event with `{ gate_id, resolution: "REJECTED", feedback }`.
    5. Return `{ status: "REJECTED", gate_id }`.
- [ ] Create `src/orchestrator/tasApplicator.ts` implementing `TasApplicator`:
  - `applyDiff(currentTas: TasDocument, diff: TasDiff): TasDocument` — applies the structural diff to produce the updated `TasDocument`.
  - `serialize(tas: TasDocument): string` — converts the structured `TasDocument` back to the canonical Markdown format for writing to `TAS.md`.
  - The serialized output MUST preserve the section heading hierarchy and formatting style of the original `TAS.md` template.

## 3. Code Review

- [ ] Verify the approve flow writes to `TAS.md` atomically — the file write and the DB update MUST either both succeed or both roll back (use a SQLite transaction and only write the file inside the transaction callback, with a rollback hook to restore the file if the transaction fails).
- [ ] Verify the `TasApplicator.serialize()` output round-trips through `TasParser.parse()` without data loss (a parsed-serialized-reparsed document must be deeply equal to the parsed document).
- [ ] Verify rejection feedback is stored in `resolution_reason` and is included in the SSE event — agents MUST receive actionable feedback to revise their approach.
- [ ] Verify the `manage_hitl_gate` tool handler is idempotent for `action: "list"` (read-only, no side effects).
- [ ] Confirm all DB operations use `db.transaction(fn)` with explicit rollback on error.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="manageTasRevisionGate"` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="tasApplicator"` and confirm the applicator tests (including round-trip) pass.
- [ ] Run `npm run type-check` and confirm no new TypeScript errors.
- [ ] Run `npm run lint` and confirm no violations.

## 5. Update Documentation

- [ ] Update `src/mcp/orchestratorServer/orchestratorServer.agent.md` to document the `action: "approve"` and `action: "reject"` behaviors for `gate_type: "TAS_REVISION"`.
- [ ] Update `docs/architecture/tas-revision-workflow.md` with the full approval/rejection sequence diagram (Mermaid `sequenceDiagram`) showing: Agent → `request_tas_revision` → SSE event → User → `manage_hitl_gate` → State machine → Agent notification.
- [ ] Add a user-facing section in `docs/user-guide/hitl-gates.md` explaining how to list, approve, and reject TAS revision requests via the CLI (`devs gate list --type TAS_REVISION`) and VSCode Extension UI.

## 6. Automated Verification

- [ ] Run `node scripts/verify_mcp_tool_registry.js` — asserts `manage_hitl_gate` supports `gate_type: "TAS_REVISION"` action. MUST exit 0.
- [ ] Run `node scripts/verify_tas_applicator_roundtrip.js` — parses `docs/templates/TAS.template.md`, applies a no-op diff, serializes, re-parses, and asserts deep equality. MUST exit 0.
- [ ] Run `node scripts/verify_gate_resolution_db.js` — runs the approve flow against an in-memory SQLite fixture and asserts the `tas_revision_requests` row reaches `status = "APPROVED"` and `tas_revision_diffs` is not mutated. MUST exit 0.
