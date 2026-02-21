# Task: Implement Human-in-the-Loop Approval Gate for PRD/TAS Documents (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-134]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/approval_gate.test.ts`, write unit tests covering:
  - `createApprovalRequest(documentType: 'PRD' | 'TAS', documentId: string, userId: string): Promise<ApprovalRequest>` — assert the returned object contains `id`, `documentType`, `documentId`, `status: 'PENDING'`, `created_at`, and `expires_at` (24 hours from creation).
  - `processApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED', feedback?: string): Promise<void>` — assert status transitions: `PENDING → APPROVED` and `PENDING → REJECTED`; assert that calling `processApproval` on a non-`PENDING` request throws `ApprovalStateError`.
  - `isApproved(documentId: string): Promise<boolean>` — returns `true` only when the latest `ApprovalRequest` for the document has `status === 'APPROVED'`.
  - Write an integration test that simulates the full PRD approval flow: create request → UI mock emits `APPROVED` event → orchestrator proceeds to Epic generation; assert Epic generation is NOT called when status is `PENDING` or `REJECTED`.
  - Assert that attempting to start Epic generation without an `APPROVED` PRD throws `ApprovalGateBlockedError`.

## 2. Task Implementation
- [ ] Create SQLite migration `migrations/015_approval_requests.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS approval_requests (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    document_type TEXT NOT NULL CHECK(document_type IN ('PRD','TAS','REQUIREMENTS')),
    document_id   TEXT NOT NULL,
    requested_by  TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'PENDING'
                       CHECK(status IN ('PENDING','APPROVED','REJECTED','EXPIRED')),
    feedback      TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    expires_at    TEXT NOT NULL,
    resolved_at   TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_approval_doc ON approval_requests(document_id, status);
  ```
- [ ] Create `src/orchestrator/approval_gate.ts` exporting:
  - `createApprovalRequest(documentType, documentId, userId, db)` — inserts a record; `expires_at` set to `NOW + 24h`.
  - `processApproval(approvalId, decision, feedback?, db)` — updates status and `resolved_at`; enforces state machine transitions.
  - `isApproved(documentId, db)` — queries for the most recent non-expired `APPROVED` record.
  - `enforceApprovalGate(documentType, documentId, db)` — throws `ApprovalGateBlockedError` if `isApproved` returns `false`; called by `task_runner.ts` at the Phase transition boundaries (post-PRD, post-TAS, post-Requirements).
- [ ] Integrate `enforceApprovalGate` calls into `src/orchestrator/task_runner.ts` at three explicit checkpoints:
  1. Before generating epics: `enforceApprovalGate('PRD', prdDocId, db)`.
  2. Before generating tasks: `enforceApprovalGate('TAS', tasDocId, db)`.
  3. Before beginning TDD implementation: `enforceApprovalGate('REQUIREMENTS', reqDocId, db)`.
- [ ] Add a `devs approve --document <docId>` CLI subcommand in `src/cli/commands/approve.ts` that calls `processApproval` with `decision: 'APPROVED'`.
- [ ] Add a `devs reject --document <docId> --feedback "<text>"` variant that calls `processApproval` with `decision: 'REJECTED'`.
- [ ] Emit a `APPROVAL_REQUESTED` WebSocket event from the Webview server when `createApprovalRequest` is called, so the UI can surface the approval UI panel.

## 3. Code Review
- [ ] Verify that `enforceApprovalGate` is called at all three orchestrator checkpoints — search for any code path that enters epic/task/TDD generation without passing through the gate.
- [ ] Confirm the `approval_requests` migration is idempotent and the `CHECK` constraint is correctly applied.
- [ ] Confirm the `expires_at` computation uses UTC and is tested against boundary conditions (exactly 24h, 24h+1s).
- [ ] Ensure `processApproval` writes the `resolved_at` timestamp and that UI events are non-blocking (fire-and-forget with error logging).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="approval_gate"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="task_runner"` to confirm gate integration tests pass.
- [ ] Run full suite `npm test`.

## 5. Update Documentation
- [ ] Add `docs/approval_workflow.md` describing:
  - The three approval gates (PRD, TAS, Requirements) and their purpose.
  - CLI commands: `devs approve`, `devs reject`.
  - How approval status is stored and queried from SQLite.
- [ ] Update `docs/cli.md` with `devs approve` and `devs reject` command references.
- [ ] Update the `src/orchestrator/orchestrator.agent.md` with a diagram of the approval state machine.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Implemented Human-in-the-Loop approval gate for PRD/TAS/Requirements".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-134` and confirm `covered`.
- [ ] Run the approval integration test scenario: `npm test -- --testPathPattern="approval_gate" --verbose` and confirm the gate correctly blocks Epic generation when no approval exists.
