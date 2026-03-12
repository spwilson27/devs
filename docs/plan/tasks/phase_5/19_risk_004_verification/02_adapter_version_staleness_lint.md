# Task: Adapter Version Staleness Lint (Sub-Epic: 19_Risk 004 Verification)

## Covered Requirements
- [AC-RISK-004-04]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create (or update) a test in `tests/test_do_lint.py` (or similar) that mocks the existence and content of `target/adapter-versions.json`.
- [ ] Test 1: Verify `./do lint` returns non-zero if `target/adapter-versions.json` is missing.
- [ ] Test 2: Verify `./do lint` returns non-zero if `captured_at` is older than 7 days from the current date.
- [ ] Test 3: Verify `./do lint` returns zero if `target/adapter-versions.json` exists and is fresh (e.g., captured 1 day ago).

## 2. Task Implementation
- [ ] Update `cmd_lint()` in `./do` script to include the adapter version check.
- [ ] Define a helper `check_adapter_versions()` in the script.
- [ ] The check should:
    - Determine the location of `target/adapter-versions.json` relative to the project root.
    - If the file is missing, print a descriptive error message and return a failure.
    - Parse the JSON and extract `captured_at`.
    - Use `datetime.datetime.fromisoformat()` to parse the timestamp.
    - Compare it with `datetime.datetime.now(datetime.timezone.utc)`.
    - If the difference is greater than 7 days, print a staleness warning and return a failure.
- [ ] Ensure that this check is integrated into the `checks` list in `cmd_lint()` (or if it doesn't have one, create it).
- [ ] Make sure the error message suggests running `./do setup` to refresh the versions.

## 3. Code Review
- [ ] Verify that the script handles invalid JSON gracefully without crashing (it should report a failure).
- [ ] Ensure timezones are handled correctly (using UTC) to avoid failures based on runner locale.
- [ ] Confirm that `target/` is the correct path and is not ignored by the script.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and specifically the newly created linting tests.
- [ ] Manually run `./do setup` (once implemented in Phase 1) followed by `./do lint` to verify the end-to-end flow.

## 5. Update Documentation
- [ ] Document the 7-day version freshness requirement in `8_risks_mitigation.md` or a developer guide if applicable.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `[AC-RISK-004-04]` is marked as verified by the traceability script.
