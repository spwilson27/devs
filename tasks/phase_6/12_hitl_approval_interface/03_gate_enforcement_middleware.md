# Task: Implement Gate Enforcement (Wait-for-Approval) in Orchestrator (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-HITL-002], [1_PRD-REQ-UI-017]

## 1. Initial Test Written
- [ ] Create `tests/integration/test_gate_enforcement.py` with the following tests:
  - `test_distiller_blocked_without_approval`: Simulate a Distiller job request for a given `doc_type` and `doc_id` when no approval exists and assert the orchestrator returns a `WaitForApprovalError` or HTTP `403`/`412` depending on component boundaries.
  - `test_distiller_proceeds_with_approval_token`: Persist an ApprovalRequest with `status=='approved'` and correct checksum, then assert the Distiller job proceeds to the generation step (mock the generation function and assert it is called).
  - `test_partial_block_blocking`: If document has required blocks not approved and the gate requires block-level approvals, assert Distiller is blocked until those blocks are approved.

## 2. Task Implementation
- [ ] Implement gate enforcement module `src/orchestrator/gates.py` with function `require_approval_or_raise(doc_type: str, doc_id: str, required_blocks: Optional[List[str]] = None)` which:
  - Queries `ApprovalRequest` by `(doc_type, doc_id)` and/or `approval_token`.
  - Validates checksum matches current document snapshot.
  - If missing or pending approvals are found, raises `WaitForApprovalError` (define in `src/orchestrator/errors.py`) with payload listing missing `req_id`s.
- [ ] Integrate `require_approval_or_raise` into the Distiller entrypoint (`src/distiller.py`, `src/commands/distill.py`, or equivalent) immediately prior to code generation, ensuring the gate is synchronous and blocks until explicit approval is present.
- [ ] Persist `approval_token` into job metadata and log a structured event `approval_required` when blocked.
- [ ] Add support to bypass the gate only via a clearly labeled override flag `--force-with-approval-token <token>` that still records an audit entry when used (do not implement hidden backdoors).

## 3. Code Review
- [ ] Verify: atomic DB access patterns to avoid race conditions (use DB transactions/row locking where supported); clear error types and messages; proper logging of approval_required events; no silent bypass options.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/integration/test_gate_enforcement.py` and confirm gate behavior passes tests.

## 5. Update Documentation
- [ ] Add `docs/gate_logic.md` describing gate semantics, error types, job metadata fields (`approval_token`), and the CLI override flag semantics.

## 6. Automated Verification
- [ ] Add CI check `scripts/ci_gate_check.sh` that:
  - Runs the gate integration tests,
  - Mocks a Distiller invocation and asserts `approval_required` is emitted for unapproved documents.
