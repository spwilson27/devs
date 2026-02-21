# Task: End-to-end Integration Tests for ADD Workflow (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create `tests/phase_6/test_add_integration.py` (pytest E2E) that performs a full simulated workflow:
  - Start with a clean temporary working directory (use `tmp_path` fixture) and copy canonical PRD/TAS fixtures into place.
  - Assert the Blueprint Gate blocks implementation initially (`blueprint.gate.assert_allowed()` raises `BlueprintNotApprovedError`).
  - Simulate approval via `approval.create_approval()` and then assert `assert_allowed()` passes.
  - Start a mock Developer Agent implementation step (a trivial function `task.run_implementation()` that calls gate first) and assert it runs only after approval.

## 2. Task Implementation
- [ ] Implement minimal scaffolding for E2E testability:
  - Provide fixture helpers in `tests/conftest.py` under `tests/phase_6/` to create canonical PRD/TAS fixtures, a test MCP server instance, and to isolate blueprints state (checksums and approvals) per-test.
  - Ensure `task.run_implementation()` is a small test helper that calls `mcp.enforce_blueprint_allowed()` / `blueprint.gate.assert_allowed()` and then returns a success sentinel.

## 3. Code Review
- [ ] Verify that the E2E tests are hermetic, do not require network, and clean up any persisted state. Tests should run under CI with a single command.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_add_integration.py` and assert green.

## 5. Update Documentation
- [ ] Update `docs/architecture_add.md` with an "Integration Tests" section describing the E2E scenarios covered and how to run them locally and in CI.

## 6. Automated Verification
- [ ] CI command: `pytest -q tests/phase_6/test_add_integration.py && echo OK` (fail on non-zero exit).