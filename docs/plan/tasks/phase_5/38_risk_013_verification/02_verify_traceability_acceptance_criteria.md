# Task: Final Verification of Traceability Acceptance Criteria (Sub-Epic: 38_Risk 013 Verification)

## Covered Requirements
- [AC-RISK-013-01], [AC-RISK-013-02], [AC-RISK-013-03]

## Dependencies
- depends_on: [01_implement_rename_id_sync_audit.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a dedicated E2E test file `tests/test_traceability_acceptance.rs` (or similar) that treats the whole `devs` repository as the system under test.
- [ ] The test MUST verify **[AC-RISK-013-01]** by:
    1.  Confirming `./do test` currently exits 0.
    2.  Temporarily removing one `// Covers: [REQ-ID]` annotation from a production test file.
    3.  Executing `./do test` and asserting that it exits non-zero (specifically status 1) and mentions the missing requirement.
    4.  Restoring the annotation and verifying it exits 0 again.
- [ ] The test MUST verify **[AC-RISK-013-02]** by:
    1.  Verifying `traceability.json` exists after a `./do test` run.
    2.  Asserting that `stale_annotations` is currently an empty list.
    3.  Adding a `// Covers: [NON-EXISTENT-ID]` annotation to a dummy file.
    4.  Running the verification script and asserting that `stale_annotations` now contains `[NON-EXISTENT-ID]`.
- [ ] The test MUST verify **[AC-RISK-013-03]** by:
    1.  Adding a new `[TEST-AC-013-NEW]` requirement to a spec markdown file.
    2.  Running `./do test` and asserting it fails.
    3.  Adding a matching `// Covers: [TEST-AC-013-NEW]` to a file.
    4.  Running `./do test` and asserting it passes.

## 2. Task Implementation
- [ ] Ensure that `traceability.json` is correctly generated into the project root or `.devs/` directory during every `./do test` run.
- [ ] Implement the automated verification scripts described in the tests above.
- [ ] Ensure the tests run in an isolated environment (or use a temporary copy of the repo) so they don't corrupt the actual repository state.
- [ ] Finalize the formatting of error reports to be consistent across all traceability failures.

## 3. Code Review
- [ ] Confirm that the acceptance tests are comprehensive and match the literal wording of the requirements.
- [ ] Verify that `traceability_pct` is reported correctly and enforced strictly at 100%.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test tests/test_traceability_acceptance.rs` and ensure all scenarios pass.
- [ ] Verify that the generated `traceability.json` contains the expected structure: `{ "traceability_pct": 100.0, "uncovered_ids": [], "stale_annotations": [] }`.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements/8_risks_mitigation.md` (or the corresponding AC status in the spec) to mark [AC-RISK-013-01], [AC-RISK-013-02], [AC-RISK-013-03] as fully verified and implemented.

## 6. Automated Verification
- [ ] Run `./do presubmit` one final time.
- [ ] Check the output of the traceability report in the CI logs to ensure it shows "Traceability: 100.0% (N of N covered)".
