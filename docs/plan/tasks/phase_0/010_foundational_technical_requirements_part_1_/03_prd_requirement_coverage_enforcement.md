# Task: PRD Requirement Coverage Enforcement Policy (Sub-Epic: 010_Foundational Technical Requirements (Part 1))

## Covered Requirements
- [1_PRD-BR-004], [2_PRD-BR-003]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/007_traceability_and_reporting_schema/01_implement_traceability_scanner.md, docs/plan/tasks/phase_0/007_traceability_and_reporting_schema/02_implement_traceability_reporter.md]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] In `tests/test_coverage_enforcement.py`, create a test that:
    - Adds a fake requirement ID to a temporary markdown file in `docs/plan/requirements/`.
    - Runs the verification script.
    - Asserts that the script fails (exits non-zero) because the new requirement is not covered by any test.
    - Adds a `// Covers: REQ-ID` to a temporary Rust file.
    - Runs the verification script again.
    - Asserts that the script now passes.

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to:
    - Extract all requirement IDs from `docs/plan/requirements/*.md`.
    - Match these IDs against the output of the traceability scanner (or the `target/traceability.json` report).
    - Print a detailed report of any requirements that are mentioned in the PRD but have zero covering tests.
    - Exit with a non-zero status if any PRD requirement is uncovered.
- [ ] Integrate this script into the `./do test` and `./do presubmit` subcommands.

## 3. Code Review
- [ ] Ensure the requirement ID extraction is robust (handles different markdown header levels and list formats).
- [ ] Verify that the script provides helpful error messages to the developer, listing the exact requirement IDs that are missing tests.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_coverage_enforcement.py`.
- [ ] Run `./do test` and verify that the traceability check is executed as part of the pipeline.

## 5. Update Documentation
- [ ] Update `README.md` or a dedicated quality-standards document to explain that every PRD requirement must have at least one test, and that this is enforced automatically at presubmit.

## 6. Automated Verification
- [ ] Confirm that `target/traceability.json` correctly reflects all requirements in the codebase.
- [ ] Verify that the CI pipeline fails if a developer removes a test annotation for a required feature.
