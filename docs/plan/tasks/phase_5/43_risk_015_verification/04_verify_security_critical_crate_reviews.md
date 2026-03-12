# Task: Security-Critical Crate Code Review Verification (Sub-Epic: 43_Risk 015 Verification)

## Covered Requirements
- [RISK-016-BR-003]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python script `.tools/verify_reviews.py` that checks for the presence of code review JSON files for the following crates: `devs-mcp`, `devs-adapters`, `devs-checkpoint`, and `devs-core`.
- [ ] For each review file (e.g., `docs/reviews/devs-mcp-2026-03-12.json`), parse the JSON and verify that `critical_findings` and `high_findings` are both `0`.
- [ ] Write a test case in `.tools/tests/test_verify_reviews.py` that mocks review files with and without findings to ensure the verification script correctly flags violations.

## 2. Task Implementation
- [ ] Create the `docs/reviews/` directory.
- [ ] Implement `.tools/verify_reviews.py`. Ensure it handles the list of required crates and searches for JSON files matching `<crate_name>-*.json` in `docs/reviews/`.
- [ ] Incorporate a call to `python3 .tools/verify_reviews.py` into the `./do test` command or as a separate lint check.
- [ ] Create initial "clean" review record files for the specified crates to satisfy the initial check (representing the final review before MVP).
- [ ] Ensure that a missing review file or a review file with `critical_findings > 0` or `high_findings > 0` causes the verification step to fail.

## 3. Code Review
- [ ] Confirm that the review record format matches the expected schema (e.g., includes `crate_name`, `date`, `agent_tool`, `critical_findings`, `high_findings`, `remediation_sha`).
- [ ] Verify that the script correctly identifies the most recent review file for each crate if multiple files exist.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure it passes (after creating the initial review files).
- [ ] Modify one review file to have `critical_findings: 1` and verify that `./do test` fails with a descriptive error.

## 5. Update Documentation
- [ ] Add `// Covers: RISK-016-BR-003` to a new test in `tests/traceability/review_verification_test.rs` that verifies the code review requirement for security-critical crates.
- [ ] Update `target/traceability.json` to reflect coverage for `RISK-016-BR-003`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `RISK-016-BR-003` is covered and that all required crates have verified, clean review records.
