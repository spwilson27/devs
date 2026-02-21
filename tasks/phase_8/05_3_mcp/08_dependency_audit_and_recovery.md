# Task: Implement dependency audit and rollback recovery (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-TAS-093]

## 1. Initial Test Written
- [ ] Create `tests/tasks/test_dependency_audit_recovery.py` using pytest:
  - Prepare a temporary repo with `package.json` containing a known vulnerable dependency.
  - Call `dependency_manager.apply_and_audit(repo_path)` which should:
    - Run `npm audit --json` and parse the results.
    - If the audit returns `severity: high` for any package, revert the `package.json` change and create a rollback commit with message `rollback: dependency failed audit`.
  - Assert that after the call, `git log` contains either the original commit or a rollback commit and that `.devs/state.sqlite` records the attempt and rollback with appropriate status codes.

## 2. Task Implementation
- [ ] Implement `mcp/tools/dependency_manager.py` additional functions:
  - `run_audit(repo_path: Path) -> dict` which shells out to `npm audit --json` with a timeout, parses JSON, and returns structured findings.
  - `apply_and_audit(repo_path: Path, edits: dict) -> dict` which performs `update_dependencies`, runs `run_audit`, and on severe results creates a rollback commit and updates the `.devs/state.sqlite` task record with status `ROLLED_BACK`.
  - Ensure fallback behavior when `npm` is not available: mark as `NEEDS_MANUAL_REVIEW` and log the reason in `agent_logs`.

## 3. Code Review
- [ ] Verify:
  - Audit parsing is robust (no assumptions about field ordering), includes timeouts, and gracefully handles missing `npm` binary.
  - Rollback creates an explicit, auditable commit and updates the task state in the DB.
  - Tests mock `npm audit` output to avoid network dependency.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_dependency_audit_recovery.py -q` and confirm the rollback behavior and DB updates.

## 5. Update Documentation
- [ ] Add `docs/mcp/dependency-audit.md` describing the audit JSON format, action mapping (OK / ROLLED_BACK / NEEDS_MANUAL_REVIEW), and examples of recovery workflows.

## 6. Automated Verification
- [ ] As part of CI, run a mocked `npm audit` scenario and assert that a rollback commit appears in the `git` history and that `.devs/state.sqlite` has the corresponding `ROLLED_BACK` record.