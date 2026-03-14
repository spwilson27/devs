# Task: Implement Stub Check in ./do lint (Sub-Epic: 28_Risk 009 Verification)

## Covered Requirements
- [RISK-009-BR-003]

## Dependencies
- depends_on: []
- shared_components: [./do]

## 1. Initial Test Written
- [ ] Create a new Python test file `.tools/tests/test_stub_check.py`.
- [ ] Mock a file system with files containing `// TODO: BOOTSTRAP-STUB`.
- [ ] Assert that a simulated `./do lint` run returns a non-zero exit code if the `BootstrapComplete` state (e.g., a file `docs/adr/0000-bootstrap-complete.md` exists) is detected and stubs are present.
- [ ] Assert that it returns zero if stubs are present but `BootstrapComplete` state is NOT yet reached.
- [ ] Assert that it returns zero if `BootstrapComplete` state is reached and NO stubs are present.

## 2. Task Implementation
- [ ] Modify the `lint` command in the `./do` script or add a check to `.tools/workflow.py`.
- [ ] Implement a function to scan the entire workspace for the string `// TODO: BOOTSTRAP-STUB`.
- [ ] Implement detection logic for the `BootstrapComplete` state by checking for the presence of the ADR `docs/adr/NNNN-bootstrap-complete.md` (where NNNN is the next sequential number).
- [ ] If the ADR exists, make the stub check fail if the count is greater than zero.
- [ ] Ensure that even before the milestone is reached, the count of stubs is reported to the user during `./do lint`.

## 3. Code Review
- [ ] Verify that the file scan excludes `.git/`, `target/`, and other ignored directories.
- [ ] Confirm that the stub detection is case-sensitive and matches the required format `// TODO: BOOTSTRAP-STUB`.
- [ ] Ensure the exit code and error message clearly explain the failure and point to this requirement.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest .tools/tests/test_stub_check.py` and ensure it passes.
- [ ] Run `./do lint` on the current project and observe the stub count reporting.

## 5. Update Documentation
- [ ] Update the `Documentation & Release` section of Phase 5 plan in `docs/plan/phases/phase_5.md` if needed to confirm this gate.
- [ ] Update agent memory in `GEMINI.md` to mention the requirement to remove stubs before release.

## 6. Automated Verification
- [ ] Verify the requirement `[RISK-009-BR-003]` is linked in the code using the traceability tool: `python3 .tools/verify_requirements.py --req RISK-009-BR-003`.
