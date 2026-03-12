# Task: Verify Standard Workflow Definitions (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [AC-RISK-009-02]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-cli, devs-server]

## 1. Initial Test Written
- [ ] Create an integration test in `tests/e2e/bootstrap_workflows_test.rs` that:
    - Verifies the existence of 6 mandatory workflow files in `.devs/workflows/`:
        - `tdd-red.toml`
        - `tdd-green.toml`
        - `presubmit-check.toml`
        - `build-only.toml`
        - `unit-test-crate.toml`
        - `e2e-all.toml`
    - Uses a mock server instance or `devs-config` parser to validate each file's syntax and structure.
    - Asserts that no validation errors are returned for any of the 6 files.

## 2. Task Implementation
- [ ] Ensure all 6 standard workflow TOML files exist in the `.devs/workflows/` directory with correct content according to the PRD/TAS.
- [ ] If any files are missing or invalid, implement or fix them.
- [ ] Verify that each workflow can be successfully loaded by the `devs-config` crate.
- [ ] Use `devs-cli submit --dry-run` (if implemented) or a similar validation tool to confirm the server would accept these definitions.

## 3. Code Review
- [ ] Verify that workflow definitions follow the declarative TOML format specified in `1_PRD-REQ-006`.
- [ ] Ensure all `depends_on` relationships in the workflows are correct and form a valid DAG.
- [ ] Confirm that prompt references in the workflows point to valid files in `.devs/prompts/`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test bootstrap_workflows_test` and ensure it passes.

## 5. Update Documentation
- [ ] Update the project's internal "memory" to reflect that standard workflows have been verified.

## 6. Automated Verification
- [ ] Run `./do test` and check `target/traceability.json` to ensure `AC-RISK-009-02` is marked as covered and passed.
