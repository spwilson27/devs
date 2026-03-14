# Task: Implement Synchronous Requirement Rename and ID Change Audit (Sub-Epic: 38_Risk 013 Verification)

## Covered Requirements
- [RISK-013-BR-005], [MIT-013]

## Dependencies
- depends_on: [37_risk_013_verification/01_enforce_traceability_gates.md, 37_risk_013_verification/05_implement_stale_annotation_detection.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python integration test `.tools/tests/test_rename_audit.py` that mocks a Git repository state.
- [ ] The test MUST verify **[RISK-013-BR-005]** by:
    1. Creating a temporary git repository with a spec file containing `[TEST-REQ-001]`.
    2. Simulating `git mv docs/plan/specs/old.md docs/plan/specs/new.md`.
    3. Running the audit and verifying it detects stale `// Covers: TEST-REQ-001` annotations referencing the old path.
    4. Simulating changing `[TEST-REQ-001]` to `[TEST-REQ-002]` in a spec file.
    5. Running the audit and verifying it detects stale `// Covers: TEST-REQ-001` annotations.
- [ ] The test MUST verify that if the corresponding `// Covers:` annotations are NOT updated in the same staged changes, the audit fails with exit code 1.
- [ ] The test MUST verify the "two-together" convention: staging both spec change AND annotation update succeeds.
- [ ] Ensure the test covers edge cases:
    - Renaming `docs/plan/specs/X.md` to `docs/plan/specs/Y.md`.
    - Changing `[X-REQ-001]` to `[X-REQ-001-NEW]` in a spec file.
    - Staging ONLY the spec change (expected: failure) vs. staging both spec and annotation change (expected: success).
    - Multiple files with stale annotations (all must be listed in error output).

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to add an `--audit-staged` flag that:
    1. Checks the Git index using `git diff --cached --name-status` and `git diff --cached -U0`.
    2. Detects renames (`R` status) for files in `docs/plan/specs/` or `docs/plan/requirements/`.
    3. Detects requirement ID changes by parsing the staged diff for removed/added `[ID]` patterns.
- [ ] If a rename is detected, trigger a full stale annotation check across the whole workspace.
- [ ] If a requirement ID is modified (removed or renamed) in the staged diff:
    1. Scan all staged `.rs` files for `// Covers: <old_id>` annotations.
    2. Report each file and line number where stale annotations are found.
- [ ] Integrate the `--audit-staged` check into `./do lint`:
    1. Check if there are staged changes (`git diff --cached --quiet`).
    2. If staged changes exist, run `python .tools/verify_requirements.py --audit-staged`.
    3. Propagate non-zero exit code if audit fails.
- [ ] Ensure `git mv` is correctly detected and mapped to the new path to avoid false "deleted requirement" errors.
- [ ] Error message format: `[RISK-013-BR-005] ID [TEST-REQ-001] was changed/removed in docs/plan/specs/X.md:NN, but 3 files still contain // Covers: TEST-REQ-001. Update annotations before commit.`

## 3. Code Review
- [ ] Confirm the Git-based audit is robust and doesn't fail if the workspace is not in a clean state.
- [ ] Ensure it doesn't significantly slow down normal `./do lint` when no spec files are changed (< 500ms overhead).
- [ ] Verify error messages are actionable with exact file paths and line numbers.
- [ ] Check that the audit handles edge cases:
    - Untracked files (ignored).
    - Deleted spec files (treated as rename to /dev/null).
    - Binary files (skipped).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_rename_audit.py -v` and ensure all scenarios pass.
- [ ] Perform a manual `git mv` of a small spec file and run `./do lint` to observe the audit in action.
- [ ] Verify the audit passes when both spec and annotations are updated together.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to document that `./do lint` now proactively audits for requirement synchronicity on staged changes.
- [ ] Add a section to `CONTRIBUTING.md` explaining the "two-together" rule: when changing requirement IDs, update annotations in the same commit.

## 6. Automated Verification
- [ ] Create a temporary branch.
- [ ] Rename an ID in `docs/plan/requirements/8_risks_mitigation.md` from `[TEST-OLD-001]` to `[TEST-NEW-001]` and stage only that file.
- [ ] Run `./do lint` and verify it fails with exit code 1 and error message listing stale annotations.
- [ ] Update the corresponding test file annotation from `// Covers: TEST-OLD-001` to `// Covers: TEST-NEW-001` and stage it.
- [ ] Run `./do lint` and verify it now passes with exit code 0.
- [ ] Clean up the temporary branch.
