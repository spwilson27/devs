# Task: Implement Blueprint Gate Logic (synchronous wait and enforcement) (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create `tests/phase_6/test_blueprint_gate.py`:
  - `test_gate_blocks_implementation()` simulates a Developer Agent calling into `blueprint.gate.assert_allowed()` for a given set of documents and expects a `BlueprintNotApprovedError` when approvals are missing.
  - `test_gate_allows_after_approval()` creates approvals (use `approval.create_approval` in tmpdir), then asserts `assert_allowed()` returns `None` (no exception) and does not block.
  - `test_wait_for_approval_timeout()` verifies that a synchronous wait API `assert_allowed(wait_for_approval=True, timeout_seconds=5)` times out and raises `BlueprintApprovalTimeout` when approval not provided within timeout.

## 2. Task Implementation
- [ ] Implement `src/blueprint/gate.py` with:
  - `def assert_allowed(document_paths: List[pathlib.Path], wait_for_approval: bool=False, timeout_seconds: int=0) -> None` — raises `BlueprintNotApprovedError` if any document is unapproved; if `wait_for_approval` is True, block (sleep/poll) until approval or timeout, then raise `BlueprintApprovalTimeout`.
  - Ensure gate checks checksums via `blueprint.approval.is_approved()` and logs attempts.
  - Make the waiting logic cancellable and deterministic for tests (use a fast-poll interval defaulted for tests).

## 3. Code Review
- [ ] Verify:
  - Gate is synchronous and deterministic, does not perform network calls, and exposes observability (log lines including document path, token, and timestamps).
  - Exceptions are explicit and well-documented.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_blueprint_gate.py` and validate behavior for blocked/allowed/wait-timeout scenarios.

## 5. Update Documentation
- [ ] Document the Gate API and usage examples in `docs/architecture_add.md` under "Blueprint Gate (Gate 1)" including the `wait_for_approval` semantics and recommended timeouts.

## 6. Automated Verification
- [ ] CI command: `pytest -q tests/phase_6/test_blueprint_gate.py && echo OK` (non-zero exit fails CI).