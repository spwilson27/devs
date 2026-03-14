# Task: 03_Risk Lifecycle & Matrix Integrity (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-007], [RISK-BR-010]

## Dependencies
- depends_on: ["02_high_severity_risk_merge_gating.md"]
- shared_components: [Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python unit test file at `.tools/tests/test_risk_matrix_integrity.py` with a test class `TestRiskMatrixIntegrity`.
- [ ] Write a test `test_mitigation_tag_without_corresponding_risk_row_fails` that:
  - Creates a mock markdown with `[MIT-015]` in the mitigation section but no `[RISK-015]` row in the risk matrix (§1).
  - Invokes the integrity checker and asserts it returns `IntegrityResult.FAIL` with error "MIT-015: no corresponding RISK-015 in matrix".
- [ ] Write a test `test_risk_row_without_mitigation_tag_passes` that verifies risks can exist without mitigations (not all risks require mitigations).
- [ ] Write a test `test_manual_deletion_detected_by_baseline_comparison` that:
  - Creates a baseline list of risk IDs (simulating last committed state).
  - Creates a current list with one risk ID removed.
  - Asserts the checker detects the deletion and fails with "RISK-XXX: manually deleted (must transition to Retired with ADR)".
- [ ] Write a test `test_retired_risk_requires_adr_link` that verifies a risk with `status: Retired` must have an `ADR` link (e.g., `docs/adr/0015-risk-elimination.md`).
- [ ] Ensure all tests use pytest fixtures and assert exact error messages.

## 2. Task Implementation
- [ ] Create `.tools/risk_matrix_integrity.py` with a class `RiskMatrixIntegrityChecker` that:
  - Parses `docs/plan/requirements/8_risks_mitigation.md` to extract:
    - All `[RISK-NNN]` rows from the risk matrix (§1) with their statuses.
    - All `[MIT-NNN]` tags from mitigation sections (§2-§4).
  - Implements `check_matrix_consistency()` method that:
    - For each `[MIT-NNN]`, verifies a corresponding `[RISK-NNN]` exists in the matrix.
    - Returns a list of orphan mitigations (MIT without RISK).
  - Implements `check_deletion_detection(baseline_risks: Set[str])` method that:
    - Compares baseline risk IDs against current risk IDs.
    - Returns a list of deleted risk IDs.
  - Implements `check_retired_risks_have_adr()` method that:
    - For each risk with `status: Retired`, verifies an ADR link exists in the requirement description or matrix row.
    - Returns a list of retired risks missing ADR documentation.
- [ ] Integrate the checker into `./do lint` by adding a step that runs `python -m tools.risk_matrix_integrity` before the test phase.
- [ ] Add logging: `print(f"[RISK-INTEGRITY] Checking {len(risk_ids)} risks and {len(mit_ids)} mitigations...")`.
- [ ] Ensure the tool exits with code 1 on any integrity violation.

## 3. Code Review
- [ ] Verify the matrix parsing correctly identifies section boundaries (§1 for matrix, §2-§4 for mitigations).
- [ ] Confirm the deletion detector uses a persistent baseline file (e.g., `.gen_state.json` with `last_committed_risks` array) updated on each successful commit.
- [ ] Verify ADR link validation checks for actual file existence: `os.path.exists(adr_path)`.
- [ ] Ensure error messages are actionable: "RISK-015: status=Retired but no ADR link found (expected: docs/adr/NNNN-risk-elimination.md)".

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_matrix_integrity.py -v` and confirm all tests pass.
- [ ] Manually test deletion detection: remove a risk ID from the markdown, run the checker, and verify it fails.
- [ ] Manually test retired risk ADR requirement: set a risk to `status: Retired` without an ADR, run the checker, and verify it fails.
- [ ] Run `./do lint` and verify the integrity check executes without errors for the current codebase.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/8_risks_mitigation.md` sections on [RISK-BR-007] and [RISK-BR-010] to document: "Matrix integrity enforced by `.tools/risk_matrix_integrity.py`, executed by `./do lint`."
- [ ] Add a baseline tracking mechanism documentation to `docs/plan/adversarial_review.md` describing how deletion detection works.

## 6. Automated Verification
- [ ] Run `python -m tools.risk_matrix_integrity` on the current codebase and verify it exits 0 with no integrity violations.
- [ ] Verify the checker is invoked in `./do lint` by checking the script output for `[RISK-INTEGRITY]` log lines.
- [ ] Confirm the baseline file `.gen_state.json` is updated on each commit via a git hook or CI step.
