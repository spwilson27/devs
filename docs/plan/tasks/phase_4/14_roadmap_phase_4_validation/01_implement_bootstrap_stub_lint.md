# Task: Implement BOOTSTRAP-STUB Lint Enforcement (Sub-Epic: 14_Roadmap Phase 4 Validation)

## Covered Requirements
- [AC-ROAD-P4-005], [9_PROJECT_ROADMAP-REQ-299]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a test case in `.tools/tests/test_lint.py` (or the equivalent linting test suite) that:
    - Creates a temporary Rust file containing the string `// TODO: BOOTSTRAP-STUB`.
    - Simulates the presence of a Phase 3 PTC (e.g., creating a dummy `docs/adr/0003-phase-3-complete.md`).
    - Executes `./do lint` and asserts that it exits with a non-zero status.
    - Removes the stub and asserts that `./do lint` now exits with status 0 (assuming no other lint errors).
- [ ] Verify that the test fails initially because the lint rule is not yet implemented or active for Phase 4.

## 2. Task Implementation
- [ ] Update the `./do lint` script or the underlying Python linting logic (likely in `.tools/workflow.py` or a dedicated linter) to:
    - Check if the Phase 3 PTC ADR exists (`docs/adr/*-phase-3-complete.md`).
    - If it exists, perform a recursive grep/search across all `.rs` files in the workspace for the literal string `// TODO: BOOTSTRAP-STUB`.
    - If any matches are found, print the filenames and line numbers to stderr with a descriptive error message (e.g., "ERROR: BOOTSTRAP-STUB remains after Phase 3 completion").
    - Ensure the linting process returns a non-zero exit code if stubs are found.
- [ ] Ensure that this check is platform-agnostic (works on Linux, macOS, and Windows).

## 3. Code Review
- [ ] Verify that the implementation uses an efficient search method (like `grep -r` or a fast Python-based search).
- [ ] Ensure the error message clearly instructs the developer to implement the stubbed behavior before proceeding.
- [ ] Check that the rule only activates after the Phase 3 PTC is committed, allowing stubs during Phases 0–3.

## 4. Run Automated Tests to Verify
- [ ] Run the newly created lint tests: `pytest .tools/tests/test_lint.py`.
- [ ] Manually verify by adding a stub to a crate and running `./do lint`.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/9_project_roadmap.md` or relevant developer guides to note that `BOOTSTRAP-STUB` is now a blocking lint error.

## 6. Automated Verification
- [ ] Run `./do lint` on the current codebase to ensure no stubs were accidentally left behind.
- [ ] Verify that the CI pipeline (GitLab CI) correctly triggers this lint check and fails on stubs.
