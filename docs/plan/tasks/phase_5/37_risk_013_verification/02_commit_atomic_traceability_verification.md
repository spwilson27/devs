# Task: Commit-Atomic Traceability Verification (Sub-Epic: 37_Risk 013 Verification)

## Covered Requirements
- [RISK-013], [RISK-013-BR-003]

## Dependencies
- depends_on: [01_enforce_traceability_gates.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python integration test in `.tools/tests/test_commit_atomic_traceability.py`.
- [ ] The test MUST verify that `verify_requirements.py --commit-check` (or a similar flag) fails if a new `[REQ-ID]` is detected in a markdown spec file but no corresponding `// Covers: <id>` exists in the workspace.
- [ ] The test SHOULD simulate this by checking a mocked "current commit" diff.
- [ ] Ensure that existing requirements do NOT trigger this failure; only *new* requirements in the current commit are checked.

## 2. Task Implementation
- [ ] Implement a `find_new_requirements()` function in `.tools/verify_requirements.py` that uses `git diff HEAD` (or a specified commit range) to find newly added `[REQ-ID]` or `[RISK-ID]` strings in markdown files.
- [ ] For each newly added ID, verify that a `// Covers: <id>` annotation also exists in the workspace (preferably added in the same commit).
- [ ] Integrate this check into `./do lint` and/or `./do presubmit`. Since `presubmit` runs on a temporary commit, it can check the diff of that commit against its parent.
- [ ] Update `.tools/verify_requirements.py` to handle this logic gracefully if Git is not available (e.g., during a raw build).
- [ ] Ensure `RISK-013` (Traceability Maintenance Burden) is mitigated by making this tool as helpful as possible (e.g., suggesting exactly where the missing annotation should be).

## 3. Code Review
- [ ] Confirm that the Git-based check handles various diff states correctly (staged vs. committed).
- [ ] Ensure that renaming a file doesn't trigger "new requirement" errors if the IDs themselves haven't changed.
- [ ] Check that the script handles the initial state (where all requirements are already committed) without errors.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_commit_atomic_traceability.py` and ensure all scenarios pass.
- [ ] Run a local `./do presubmit` and confirm it passes.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements/8_risks_mitigation.md` to indicate that `RISK-013` is now mitigated by the commit-atomic check.

## 6. Automated Verification
- [ ] Create a temporary branch.
- [ ] Add a new requirement to `requirements.md` (e.g., `[TASK-TEST-999]`) and commit it without a test.
- [ ] Run `./do presubmit` and verify it fails with an error indicating that the new requirement lacks a covering test in the same commit.
- [ ] Revert or add the test and verify it passes.
