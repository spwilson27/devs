# Task: Implement Epic Start Gate and Planning Definition-of-Done checks (Sub-Epic: 05_Task_Constraints_And_Planning)

## Covered Requirements
- [9_ROADMAP-DOD-P5], [1_PRD-REQ-PLAN-006], [9_ROADMAP-TAS-014]

## 1. Initial Test Written
- [ ] Write integration tests `tests/integration/test_epic_start_gate.py` that:
  - Build a sample Epic with its assigned tasks and RTI report.
  - Assert `epic_start_gate(epic, tasks, rti_report, token_estimate)` returns `pass=True` only if:
     - The global epic partitioning results in 8-16 epics (validate via sample runner).
     - This epic contains >=25 tasks (or documents reasons if fewer).
     - All tasks have non-empty `success_criteria` and `estimated_loc <= 200`.
     - The task dependency graph contains no cycles (use small DAG utility).
     - The RTI for requirements covered by this epic is `1.0` (or >= configurable threshold).
     - A token/cost estimate exists and is within configured tolerance.
  - Assert gate returns structured diagnostics listing failing checks and remediation recommendations.

## 2. Task Implementation
- [ ] Implement `src/planner/gates.py`:
  1. Implement `epic_start_gate(epic, tasks, rti_report, token_estimate, config) -> dict {pass: bool, issues: list[dict], remediation: list[str]}`.
  2. Implement supporting utilities:
     - `dag_cycle_check(tasks) -> list[cycles]`
     - `rti_checker(rti_report, epic_req_ids) -> float`
     - `task_completeness_checker(tasks) -> list[issues]`
  3. Provide clear remediation steps for each failure (e.g., "split large tasks", "add success criteria", "resolve cycles by reordering").
  4. Allow config overrides for thresholds (`min_tasks_per_epic=25`, `rti_threshold=1.0`).
  5. Keep implementation testable and dependency-free (stdlib + network-free).

## 3. Code Review
- [ ] Verify:
  - Gate returns machine-readable diagnostics and stable exit codes.
  - All checks are idempotent and deterministic.
  - Performance is acceptable for epic sizes up to 500 tasks.
  - No silent failures; each failed check includes suggested remediation.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/integration/test_epic_start_gate.py -q` and ensure pass.

## 5. Update Documentation
- [ ] Add `docs/gates.md` describing the Epic Start Gate, DoD checklist for Planning (P5), threshold configs, and example remediation workflows.

## 6. Automated Verification
- [ ] Add `scripts/verify_epic_start_gate.py` that runs gate against `artifacts/partitioning_result.json` and `artifacts/sample_rti.json` and writes `gate_report.json`; CI step must fail if `pass=False`.
