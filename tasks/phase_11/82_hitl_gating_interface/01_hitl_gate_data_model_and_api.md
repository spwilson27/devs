# Task: HITL Gate Data Model & Backend API (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [1_PRD-REQ-INT-010], [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written
- [ ] In `packages/core/src/hitl/__tests__/hitlGateModel.test.ts`, write unit tests for a `HitlGate` data model covering:
  - A gate record has fields: `id: string`, `phaseId: string`, `checkpointLabel: string`, `status: 'PENDING' | 'APPROVED' | 'REJECTED'`, `createdAt: Date`, `resolvedAt: Date | null`, `resolvedBy: string | null`.
  - Validate that creating a gate with missing required fields throws a `ValidationError`.
  - Validate that transitioning status from `PENDING` → `APPROVED` sets `resolvedAt` and is idempotent.
  - Validate that transitioning from a terminal state (`APPROVED` / `REJECTED`) to any other state throws an `InvalidStateTransitionError`.
- [ ] In `packages/core/src/hitl/__tests__/hitlGateService.test.ts`, write integration tests (using an in-memory SQLite DB via `better-sqlite3`) for `HitlGateService`:
  - `createGate(phaseId, label)` persists a new `PENDING` gate and returns it.
  - `getGate(gateId)` retrieves a gate by ID; throws `NotFoundError` for unknown IDs.
  - `listGates(phaseId)` returns all gates for a phase, ordered by `createdAt ASC`.
  - `approveGate(gateId, resolvedBy)` transitions a `PENDING` gate to `APPROVED`.
  - `rejectGate(gateId, resolvedBy)` transitions a `PENDING` gate to `REJECTED`.
  - Concurrent duplicate `approveGate` calls are idempotent (no duplicate DB writes).
- [ ] In `packages/core/src/hitl/__tests__/hitlGateRouter.test.ts`, write HTTP-level integration tests (using `supertest`) for REST endpoints:
  - `POST /api/hitl/gates` → 201 with gate body.
  - `GET /api/hitl/gates/:id` → 200 with gate body; 404 for unknown.
  - `GET /api/hitl/gates?phaseId=<id>` → 200 array.
  - `PATCH /api/hitl/gates/:id/approve` → 200 with updated gate.
  - `PATCH /api/hitl/gates/:id/reject` → 200 with updated gate.
  - `PATCH /api/hitl/gates/:id/approve` on an already-approved gate → 200 (idempotent).
  - `PATCH /api/hitl/gates/:id/approve` on a non-existent gate → 404.

## 2. Task Implementation
- [ ] Create `packages/core/src/hitl/HitlGate.ts` — define the `HitlGate` interface and a `createHitlGate(params)` factory that validates required fields, throwing typed errors on failure.
- [ ] Create `packages/core/src/hitl/hitlGateSchema.ts` — define the `hitl_gates` table schema for `better-sqlite3`:
  ```sql
  CREATE TABLE IF NOT EXISTS hitl_gates (
    id TEXT PRIMARY KEY,
    phase_id TEXT NOT NULL,
    checkpoint_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    resolved_by TEXT
  );
  ```
- [ ] Create `packages/core/src/hitl/HitlGateService.ts` — implement `HitlGateService` class with `createGate`, `getGate`, `listGates`, `approveGate`, `rejectGate` methods. Use UUIDs (`crypto.randomUUID()`) for IDs and ISO-8601 strings for timestamps. Enforce state machine transitions via a private `_transition(gate, newStatus)` method.
- [ ] Create `packages/core/src/hitl/hitlGateRouter.ts` — implement an Express Router mounting the five REST endpoints, delegating to `HitlGateService`. Ensure proper HTTP status codes and JSON error bodies `{ error: string, code: string }`.
- [ ] Register `hitlGateRouter` in the main Express app at `packages/core/src/app.ts` under the `/api/hitl` prefix.
- [ ] Export all public types from `packages/core/src/hitl/index.ts`.

## 3. Code Review
- [ ] Verify the state machine is the single source of truth for status transitions — no ad-hoc `if (status === ...)` checks outside `_transition`.
- [ ] Confirm all DB queries use parameterized statements (no string interpolation) to prevent SQL injection.
- [ ] Confirm the router layer contains zero business logic — it only maps HTTP → service and service result → HTTP response.
- [ ] Confirm `NotFoundError` and `InvalidStateTransitionError` are custom typed error classes extending `Error`, not plain string throws.
- [ ] Confirm all exported types are re-exported from `packages/core/src/hitl/index.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=hitl` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=hitl` and confirm statement coverage ≥ 90% for all files under `src/hitl/`.

## 5. Update Documentation
- [ ] Add a `## HITL Gate API` section to `packages/core/README.md` documenting the five REST endpoints with request/response shapes.
- [ ] Update `packages/core/src/hitl/index.ts` with JSDoc comments on each exported type and function describing its purpose and error conditions.
- [ ] Append an entry to `docs/agent-memory/architecture-decisions.md`:
  ```
  ## [ADR-HITL-001] HITL Gate State Machine
  - Status transitions are unidirectional: PENDING → APPROVED | REJECTED.
  - Terminal states are immutable; idempotent re-approval is allowed but re-rejection after approval is not.
  - All timestamps are stored as ISO-8601 UTC strings in SQLite.
  ```

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --ci --testPathPattern=hitl` in CI mode and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/core build` and assert it exits with code `0` (no TypeScript errors).
- [ ] Confirm that `grep -r "hitl_gates" packages/core/src/hitl/hitlGateSchema.ts` returns the `CREATE TABLE` statement (schema file is present and correct).
