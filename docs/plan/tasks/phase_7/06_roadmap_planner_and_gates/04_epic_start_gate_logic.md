# Task: Implement Epic Start Gate Logic (Sub-Epic: 06_Roadmap_Planner_And_Gates)

## Covered Requirements
- [9_ROADMAP-REQ-004]

## 1. Initial Test Written
- [ ] Create unit tests at tests/phase_7/test_epic_start_gate.py using pytest.
  - test_start_blocked_when_epic_has_unapproved_changes: Create an epic fixture where one or more tasks have status 'requires_review' and assert evaluate_epic_start returns allowed=False and includes reason 'Pending reviews'.
  - test_start_blocked_when_less_than_min_tasks: Create an epic with 10 tasks (<25) and assert allowed=False with reason 'Insufficient tasks'.
  - test_start_allowed_when_all_checks_pass: Create an epic with >=25 tasks, all approved, no unresolved dependencies -> evaluate_epic_start returns allowed=True.
- [ ] Use fixtures and monkeypatch to simulate project_state and dependency analyzer outputs.

## 2. Task Implementation
- [ ] Implement src/roadmap/epic_gate.py with function evaluate_epic_start(epic: Dict, project_state: Dict, config: Optional[Dict]=None) -> Dict:
  - Configurable checks (via config or defaults):
    - min_tasks_per_epic (default 25)
    - require_all_tasks_approved (default True)
    - allow_partial_automation_pass (configurable)
  - Checks to perform:
    - Count tasks and compare to min_tasks_per_epic
    - Ensure no tasks are flagged as 'requires_review' or 'blocked'
    - Verify no unresolved cross-epic dependencies via project_state['dependency_graph'] analysis
    - Optionally check budget/token_estimate vs project_state.remaining_budget
  - Return {'allowed': bool, 'reasons': List[str], 'required_actions': List[str]}
- [ ] Implement a small API helper commence_epic(epic_id: str, project_store) that calls evaluate_epic_start and, if allowed, sets epic.state='in_progress' and emits an event (e.g., via an event bus or simple log).

## 3. Code Review
- [ ] Ensure gate logic is configuration-driven, well-documented, and pure; side-effects only happen in the explicit commence_epic wrapper.
- [ ] Confirm tests cover boundary conditions (exactly 25 tasks, missing metadata).
- [ ] Verify that dependency checks are efficient (do not perform expensive graph traversals on each call unless cached).

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/test_epic_start_gate.py
- [ ] Integration check: create a sample roadmap JSON, call commence_epic on an allowed epic, and assert the epic state transitions to 'in_progress' and event emitted.

## 5. Update Documentation
- [ ] Add docs/roadmap/epic_start_gate.md documenting gate rules, configuration parameters, example JSON payloads for evaluate_epic_start, and recommended remediation steps.
- [ ] Add a short note in docs/phase_7.md linking to the epic start gate docs.

## 6. Automated Verification
- [ ] Provide scripts/verify_epic_start_gate.sh which runs unit tests and a sample commence flow asserting idempotency (calling commence twice does not duplicate events and is safe).
