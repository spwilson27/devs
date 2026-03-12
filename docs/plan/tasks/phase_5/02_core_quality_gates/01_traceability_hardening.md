# Task: Traceability Hardening (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-3.20], [3_MCP_DESIGN-REQ-056]

## Dependencies
- depends_on: [01_core_quality_gates/04_traceability_report.md]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test case `tests/test_traceability_unknown_id.py` that:
    - Adds a test file with `// Covers: NONEXISTENT-REQ-999`.
    - Runs the traceability tool (`.tools/verify_requirements.py`).
    - Asserts that `target/traceability.json` has `overall_passed: false`.
    - Asserts that `NONEXISTENT-REQ-999` is listed in the `uncovered_requirements` (or similar list indicating it was found but is invalid).
- [ ] Create a Python test case `tests/test_traceability_100pct_gate.py` that:
    - Asserts that if any single requirement ID is missing a matching `// Covers:` annotation, the overall `traceability_pct` is `< 100.0` and `overall_passed` is `false`.

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py`:
    - Collect all requirement IDs from spec files (`docs/plan/specs/*.md`).
    - Extract all `// Covers: REQ-ID` annotations from the codebase.
    - Match annotations against the collected IDs.
    - If an annotation contains an ID not in the collected list, treat it as an "unknown requirement" and ensure `overall_passed` is set to `false` and `traceability_pct` is impacted (or the requirement is listed as uncovered).
    - Ensure `overall_passed` is only `true` if `traceability_pct == 100.0` (all requirements have at least one test) AND all tests for those requirements are passing.
- [ ] Ensure that `./do test` exits with a non-zero status if `overall_passed` is `false` in `target/traceability.json`.

## 3. Code Review
- [ ] Verify that requirement IDs are correctly parsed from all specification files.
- [ ] Verify that the `traceability_pct` calculation correctly handles unknown/stale IDs.
- [ ] Ensure that `./do test` is the only way for the agent to bypass the traceability gate.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_traceability_unknown_id.py` and `pytest tests/test_traceability_100pct_gate.py`.
- [ ] Run `./do test` on the current codebase to verify the current coverage status.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that 100% traceability is required for all PRs and any unknown ID annotation will break the build.

## 6. Automated Verification
- [ ] Verify that `./do test` returns a non-zero exit code when a requirement is not covered by any test.
- [ ] Verify that the traceability tool provides actionable output (e.g., listing which requirements are missing coverage).
