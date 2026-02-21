# Task: Implement Plan Requirements Mapping Component (Sub-Epic: 06_Roadmap_Planner_And_Gates)

## Covered Requirements
- [9_ROADMAP-REQ-PLAN-001]

## 1. Initial Test Written
- [ ] Create unit tests at tests/phase_7/test_plan_requirements_mapper.py using pytest.
  - test_maps_requirement_to_plan_fields: Provide a deterministic sample requirement list with at least one requirement object: {"id":"9_ROADMAP-REQ-PLAN-001","title":"Plan requirements mapping","description":"Map plan fields: epic:planning priority:high","tags":["planning","map"]}. Call PlanRequirementsMapper.map([req]) and assert the return is a dict keyed by requirement id with the value containing the fields: "epic" (string), "priority" ("low"|"medium"|"high"), "dependencies" (list of REQ ids), and "estimate_tokens" (int).
  - test_handles_missing_fields: Input a requirement with no tags or description; assert dependencies = [] and estimator returns a positive integer.
  - test_multiple_requirements: Given several synthetic requirements, assert mapper returns an entry for each id and maintains stable ordering when called with same seed.
- [ ] Use monkeypatch/fixtures to stub any external NLP or ML helpers so tests remain offline and deterministic.

## 2. Task Implementation
- [ ] Implement src/roadmap/plan_mapper.py with a class PlanRequirementsMapper and method map(requirements: List[Dict], *, seed: int = 0) -> Dict[str, Dict]:
  - For each requirement, implement the following deterministic heuristics:
    - epic: if requirement.id or tags contain "PLAN" or "roadmap" set epic="planning"; otherwise "unassigned".
    - priority: from description keywords: "critical|urgent" -> "high", "should|important" -> "medium", otherwise "low".
    - dependencies: look for an explicit "depends_on" list field; if missing, run a regex to find "depends on <REQ-ID>" and collect referenced REQ-IDs.
    - estimate_tokens: simple heuristic len(description.split()) * 5 (or 50 if missing description).
  - Keep implementation pure (no network calls) and deterministic with an optional seed parameter.
  - Add typing, docstrings, and unit-level logging via standard logging module.
  - Export the class from src/roadmap/__init__.py.

## 3. Code Review
- [ ] Verify single responsibility and small helper functions (parsing, estimation) are private and well-tested.
- [ ] Confirm all new functions include type hints, docstrings, and small examples in docstrings.
- [ ] Ensure overall module size is concise (<200 LoC for main mapper logic) and tests cover edge cases (empty inputs, malformed IDs).

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/test_plan_requirements_mapper.py and confirm all tests pass locally.
- [ ] If a project test wrapper exists, run the wrapper (e.g., ./run_tests.sh or tox) to validate integration.

## 5. Update Documentation
- [ ] Add docs/roadmap/plan_mapper.md documenting heuristics, example inputs/outputs, configuration knobs (seed), and expected JSON schema of the returned mapping.
- [ ] Add a short entry in docs/phase_7.md referencing this task and linking the test file.

## 6. Automated Verification
- [ ] Add scripts/verify_plan_mapper.sh that runs the unit tests and then executes a small sample: python -c "from src.roadmap.plan_mapper import PlanRequirementsMapper; print(PlanRequirementsMapper().map([{'id':'9_ROADMAP-REQ-PLAN-001','description':'sample'}]))" and verifies the output schema exists (keys: epic, priority, dependencies, estimate_tokens).
