# Task: Implement Workflow Validation in ./do lint (Sub-Epic: 28_Risk 009 Verification)

## Covered Requirements
- [RISK-009-BR-004]

## Dependencies
- depends_on: []
- shared_components: [./do, devs-config]

## 1. Initial Test Written
- [ ] Create a new Python test file `.tools/tests/test_workflow_lint.py`.
- [ ] Mock a file system with `.devs/workflows/` directory.
- [ ] Assert that `./do lint` fails if `.devs/workflows/` is empty.
- [ ] Assert that `./do lint` fails if any TOML file in that directory contains invalid workflow definitions (mocking a `devs submit --dry-run` or similar).
- [ ] Assert that it passes when valid TOML files are present and properly committed.

## 2. Task Implementation
- [ ] Update the `./do lint` command to include workflow validation.
- [ ] Implement a check to ensure that the `.devs/workflows/` directory exists and contains at least one `.toml` file.
- [ ] Use the `devs` server or CLI (in a headless mode or via a dry-run flag) to validate the contents of each `.toml` file against the `WorkflowDefinition` schema defined in `devs-config`.
- [ ] Ensure the validation check is performed only before the `SelfHostingAttempt` state is entered (or always, as a best practice).
- [ ] Confirm that if the workflow validation fails, `./do lint` returns a non-zero exit code.

## 3. Code Review
- [ ] Verify that the workflow validation uses the authoritative logic from `devs-config`.
- [ ] Confirm that the error reporting is detailed enough for the user to fix the invalid TOML.
- [ ] Ensure that this check correctly identifies when the `SelfHostingAttempt` state is relevant.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest .tools/tests/test_workflow_lint.py` and ensure it passes.
- [ ] Create a dummy workflow in `.devs/workflows/test.toml` and run `./do lint` to confirm it passes.
- [ ] Intentionally break the dummy workflow and confirm `./do lint` fails.

## 5. Update Documentation
- [ ] Document the workflow validation gate in `docs/architecture/WorkflowEngine.md`.
- [ ] Add instructions for the agent on how to manually trigger workflow validation before submitting runs.

## 6. Automated Verification
- [ ] Verify the requirement `[RISK-009-BR-004]` is linked in the code using the traceability tool: `python3 .tools/verify_requirements.py --req RISK-009-BR-004`.
