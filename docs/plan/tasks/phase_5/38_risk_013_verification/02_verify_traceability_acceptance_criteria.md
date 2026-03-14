# Task: Final Verification of Traceability Acceptance Criteria (Sub-Epic: 38_Risk 013 Verification)

## Covered Requirements
- [AC-RISK-013-01], [AC-RISK-013-02], [AC-RISK-013-03]

## Dependencies
- depends_on: ["37_risk_013_verification/01_enforce_traceability_gates.md", "37_risk_013_verification/04_implement_traceability_exit_logic.md", "37_risk_013_verification/05_implement_stale_annotation_detection.md"]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python integration test `.tools/tests/test_traceability_acceptance.py` that treats the traceability system as the system under test.
- [ ] The test MUST verify **[AC-RISK-013-01]** by:
    1. Creating a temporary git repository with a valid test file containing `// Covers: TEST-REQ-001` and a spec containing `[TEST-REQ-001]`.
    2. Running `verify_requirements.py` and confirming it exits 0 with `traceability_pct == 100.0`.
    3. Temporarily removing the `// Covers: TEST-REQ-001` annotation from the test file.
    4. Executing `verify_requirements.py` and asserting that it exits non-zero (exit code 1) and reports `traceability_pct < 100.0`.
    5. Restoring the annotation and verifying it exits 0 again.
- [ ] The test MUST verify **[AC-RISK-013-02]** by:
    1. Running `verify_requirements.py` with all valid annotations and confirming `stale_annotations` is an empty list in the output.
    2. Adding a `// Covers: NON-EXISTENT-ID` annotation to a dummy file.
    3. Running the verification script and asserting that `stale_annotations` now contains `NON-EXISTENT-ID` with exact file path and line number.
    4. Removing the stale annotation and verifying `stale_annotations` is empty again.
- [ ] The test MUST verify **[AC-RISK-013-03]** by:
    1. Adding a new `[TEST-AC-013-NEW]` requirement to a temporary spec markdown file.
    2. Running `verify_requirements.py` and asserting it fails with exit code 1 and reports `TEST-AC-013-NEW` as uncovered.
    3. Adding a matching `// Covers: TEST-AC-013-NEW` to a test file.
    4. Running `verify_requirements.py` and asserting it passes with exit code 0.

## 2. Task Implementation
- [ ] Ensure that `verify_requirements.py` generates a `traceability.json` report (or similar structured output) during every run with the following schema:
    ```json
    {
      "generated_at": "ISO8601 timestamp",
      "traceability_pct": 100.0,
      "total_requirements": 5,
      "covered_requirements": 5,
      "uncovered_ids": [],
      "stale_annotations": [],
      "risk_matrix_violations": []
    }
    ```
- [ ] Implement the automated verification logic described in the tests above within `.tools/tests/test_traceability_acceptance.py`.
- [ ] Ensure the tests run in an isolated temporary directory (using `tempfile.TemporaryDirectory`) so they don't corrupt the actual repository state.
- [ ] Finalize the formatting of error reports to be consistent across all traceability failures:
    - Uncovered IDs: `Uncovered: [TEST-REQ-001] (found in docs/plan/specs/X.md:NN)`
    - Stale annotations: `Stale: NON-EXISTENT-ID (found in src/foo.rs:42)`
- [ ] Integrate the acceptance test into `./do test` so it runs as part of the standard test suite.

## 3. Code Review
- [ ] Confirm that the acceptance tests are comprehensive and match the literal wording of the acceptance criteria.
- [ ] Verify that `traceability_pct` is computed correctly: `(covered_ids / total_ids) * 100`.
- [ ] Check that the test isolation is complete: no files modified in the main repo, no git state changed.
- [ ] Ensure error messages are actionable and point to exact file locations.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_traceability_acceptance.py -v` and ensure all three acceptance criteria scenarios pass.
- [ ] Verify that the generated `traceability.json` (or equivalent output) contains the expected structure for each scenario.
- [ ] Run `./do test` and confirm the acceptance tests are included and pass.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/8_risks_mitigation.md` to mark [AC-RISK-013-01], [AC-RISK-013-02], [AC-RISK-013-03] as fully verified (add verification date and test reference).
- [ ] Update `.agent/MEMORY.md` to document that traceability acceptance tests are now part of the standard test suite.
- [ ] Add a note to `CONTRIBUTING.md` explaining how to interpret `traceability.json` output when tests fail.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify it completes successfully with all traceability gates passing.
- [ ] Check the traceability report output to confirm it shows `Traceability: 100.0% (N of N covered)` with empty `stale_annotations`.
- [ ] Temporarily break one acceptance criterion (e.g., remove an annotation) and verify `./do presubmit` fails at the test stage with a clear error message.
- [ ] Restore the annotation and re-run `./do presubmit` to confirm it passes again.
