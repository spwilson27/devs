# Task: Implement RTI calculator service (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [9_ROADMAP-TAS-505], [1_PRD-REQ-MET-003], [9_ROADMAP-TAS-043]

## 1. Initial Test Written
- [ ] Create tests/unit/test_rti_calculator.py using pytest. Tests must be written first and include:
  - A fixture that builds a set of 3 requirements and 3 tasks with links such that every requirement has at least one task and at least one associated passing test case; assert RTI == 1.0.
  - A fixture where one requirement has no linked passing test -> assert RTI == expected fraction (e.g., 0.75 for 3/4 satisfied).
  - Tests for edge cases: zero requirements (define RTI as 1.0 by convention or decide policy), duplicate links, and tasks linked to multiple requirements.

## 2. Task Implementation
- [ ] Implement src/analysis/rti_calculator.py with a class or pure functions exposing:
  - compute_rti(requirements: List[Requirement], links: List[RequirementLink], test_status_lookup: Callable[[task_id], bool]) -> float
  - compute_rti_report(...) -> dict with keys: total_requirements, covered_requirements, uncovered_requirements[], rti_value

- Implementation details:
  - A requirement counts as covered if there exists at least one RequirementLink to a task whose latest test_status is "passing".
  - test_status_lookup should be injectable (so tests can pass fixtures). Provide a small adapter that queries the project's test result store or test harness; for tests use a lambda/dict.
  - Ensure deterministic ordering and explain any rounding rules (e.g., 3 decimal places).
  - Add logging and metrics (timing, counts) for observability.

## 3. Code Review
- [ ] Verify:
  - Correctness of coverage definition (documented with reference to [1_PRD-REQ-MET-003]).
  - Complexity: algorithm runs in O(R + L) where R=requirements, L=links.
  - The function is pure and easily unit-testable.
  - Adequate tests for edge cases and rounding.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_rti_calculator.py -q

## 5. Update Documentation
- [ ] Document algorithm in docs/metrics/rti_algorithm.md. Include pseudocode, complexity analysis, and an example computation showing inputs and outputs.

## 6. Automated Verification
- [ ] Add a script scripts/compute_rti.py that instantiates RTICalculator using a test double for test_status_lookup and prints a JSON report. CI and scripts/verify_rti.sh will call this script to validate runtime behavior.
