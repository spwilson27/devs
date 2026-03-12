# Task: Traceability Failure Enforcement in ./do test (Sub-Epic: 037_Detailed Domain Specifications (Part 2))

## Covered Requirements
- [1_PRD-KPI-BR-011]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_traceability_enforcement.py` that:
    - Simulates the execution of the traceability scanner (`.tools/verify_requirements.py`) on a project with uncovered requirements.
    - Verifies that `./do test` exits non-zero if ANY `1_PRD-REQ-*` tag has zero covering tests.
    - Verifies that the exit code and error output correctly list all uncovered requirement IDs.
    - Verifies that `target/traceability.json` correctly reflects `passed: false` in such cases.

## 2. Task Implementation
- [ ] Integrate the traceability scanner execution into the `./do test` subcommand.
- [ ] Implement logic in `./do` (or the verification script it calls) to extract requirement tags from `docs/plan/specs/1_prd.md` and cross-reference them with detected test annotations.
- [ ] Ensure that a lack of test coverage for any PRD requirement triggers a non-zero exit status for the entire test command.
- [ ] Standardize the error reporting to print a clear list of uncovered requirements to stderr.
- [ ] Verify that `target/traceability.json` is correctly updated with the final pass/fail status and the list of missing tests.

## 3. Code Review
- [ ] Verify that the requirement extraction from the PRD is accurate and exhaustive.
- [ ] Confirm that the exit code behavior is consistent with the `1_PRD-KPI-BR-011` requirement.
- [ ] Ensure that valid requirements aren't accidentally flagged as uncovered due to regex or path issues.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` with a temporary requirement tag that has no corresponding test and verify it fails as expected.
- [ ] Run `python3 -m pytest tests/test_traceability_enforcement.py`.

## 5. Update Documentation
- [ ] Document the traceability requirement for developers and explain how to add test coverage to clear a failure.

## 6. Automated Verification
- [ ] Run the traceability scanner and cross-verify with the requirement manifest manually once to ensure correctness.
- [ ] Verify that the `passed: false` flag appears in `target/traceability.json` during a failing test run.
