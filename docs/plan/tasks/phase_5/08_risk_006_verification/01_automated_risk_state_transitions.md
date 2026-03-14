# Task: 01_Automated Risk State Transitions (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-006]

## Dependencies
- depends_on: []
- shared_components: [Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python unit test file at `.tools/tests/test_risk_transition.py` with a test class `TestRiskStateTransitions`.
- [ ] Write a test `test_mitigated_risk_with_failing_test_transitions_to_open` that:
  - Creates a mock `target/traceability.json` with a risk entry `RISK-015` having `status: "Mitigated"` but `covering_tests: [{name: "test_something", status: "failed"}]`.
  - Creates a mock `docs/plan/requirements/8_risks_mitigation.md` snippet with `- **[RISK-015]** ... status: Mitigated`.
  - Invokes the transition logic and asserts the markdown is updated to `status: Open`.
- [ ] Write a test `test_mitigated_risk_with_passing_test_remains_mitigated` that verifies no transition occurs when covering tests pass.
- [ ] Write a test `test_open_risk_with_failing_test_remains_open` that verifies no transition for risks already in `Open` state.
- [ ] Ensure all tests use pytest fixtures for mock data and assert exact markdown output with diff comparison.

## 2. Task Implementation
- [ ] Create `.tools/risk_manager.py` with a class `RiskTransitionManager` that:
  - Parses `docs/plan/requirements/8_risks_mitigation.md` using regex to extract risk IDs, statuses, and severity scores.
  - Loads `target/traceability.json` and builds a map of `risk_id -> covering_tests`.
  - Implements `check_and_transition_risks()` method that identifies `Mitigated` risks with failing tests.
  - Performs atomic file update using temp-file + rename pattern to change status from `Mitigated` to `Open`.
- [ ] Integrate the risk manager into `.tools/verify_requirements.py` by calling `check_and_transition_risks()` after test execution.
- [ ] Add logging output: `print(f"[RISK-TRANSITION] {risk_id}: Mitigated -> Open (covering test {test_name} failed)")`.
- [ ] Ensure the tool handles edge cases: missing traceability file, malformed markdown, concurrent modifications.

## 3. Code Review
- [ ] Verify the regex pattern `r'\*\*\[RISK-\d+\]\*\*.*?status:\s*(\w+)'` correctly captures risk statuses without affecting other markdown sections.
- [ ] Confirm atomic file write pattern (temp file + `os.rename`) is used to prevent corruption on interruption.
- [ ] Verify that `target/traceability.json` is treated as the single source of truth per [RISK-BR-006] — no other state sources consulted.
- [ ] Ensure error handling provides actionable messages (file not found, JSON parse error, permission denied).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_transition.py -v` and confirm all tests pass.
- [ ] Create a manual test scenario: set `RISK-015` to `Mitigated` in the markdown, simulate a failing test in `traceability.json`, run the tool, and verify the status changes to `Open`.
- [ ] Run `./do test` end-to-end and verify the risk transition logic executes without errors.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/8_risks_mitigation.md` section on [RISK-BR-006] to document: "Automated transition implemented in `.tools/risk_manager.py`, executed by `./do test`."
- [ ] Add a note to `docs/plan/adversarial_review.md` under risk management describing the automated regression detection.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and verify it exits 0 with no risk transition warnings for the current codebase.
- [ ] Verify `target/traceability.json` contains `risk_coverage` entries for all `RISK-NNN` IDs found in the requirements document.
