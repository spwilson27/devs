# Task: Implement Synchronous Requirement Rename and ID Change Audit (Sub-Epic: 38_Risk 013 Verification)

## Covered Requirements
- [RISK-013-BR-005], [MIT-013]

## Dependencies
- depends_on: [37_risk_013_verification/01_enforce_traceability_gates.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python integration test ` .tools/tests/test_rename_audit.py` that mocks a Git repository state.
- [ ] The test MUST verify that when a spec file is renamed (`git mv`) or a requirement ID within a spec file is changed, the audit script (running as part of `./do lint`) detects it.
- [ ] The test MUST verify that if the corresponding `// Covers:` annotations in the source code are NOT updated in the same set of staged changes, the audit fails with a non-zero exit code.
- [ ] Ensure the test covers:
    - Renaming `docs/plan/specs/X.md` to `docs/plan/specs/Y.md`.
    - Changing `[X-REQ-001]` to `[X-REQ-001-NEW]` in a spec file.
    - Staging ONLY the spec change (failure) vs. staging both spec and annotation change (success).

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to add an `--audit-staged` flag that checks the Git index (using `git diff --cached --name-status` and `git diff --cached -U0`).
- [ ] If a rename (`R`) is detected for a file in `docs/plan/specs/` or `docs/plan/requirements/`, immediately trigger a full stale annotation check across the whole workspace.
- [ ] If a requirement ID is modified (removed or renamed) in the staged diff, verify that no `// Covers: <old_id>` annotations remain in the *staged* workspace files.
- [ ] Integrate this `--audit-staged` check into `./do lint`. If the user has staged changes, `./do lint` MUST perform this extra audit to catch out-of-sync annotations early.
- [ ] Ensure that `git mv` specifically is detected and correctly mapped to the new path to avoid hallucinating "deleted" requirements.

## 3. Code Review
- [ ] Confirm that the Git-based audit is robust and doesn't fail if the workspace is not in a clean state.
- [ ] Ensure that it doesn't significantly slow down a normal `./do lint` when no spec files are changed.
- [ ] Verify that the error messages are actionable: "ID [X-REQ-001] was changed to [X-REQ-001-NEW] in docs/plan/specs/X.md, but 3 files still contain // Covers: [X-REQ-001]. Update them before committing."

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_rename_audit.py` and ensure it passes.
- [ ] Perform a manual `git mv` of a small spec file and run `./do lint` to observe the audit in action.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to note that `./do lint` now proactively audits for requirement synchronicity on staged changes.

## 6. Automated Verification
- [ ] Create a temporary branch.
- [ ] Rename an ID in `requirements.md` and stage only that file.
- [ ] Run `./do lint` and verify it fails with a sync error.
- [ ] Update the corresponding test file annotation and stage it.
- [ ] Run `./do lint` and verify it now passes.
