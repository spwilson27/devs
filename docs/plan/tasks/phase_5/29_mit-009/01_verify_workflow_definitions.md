# Task: Verify Standard Workflow Definitions (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [AC-RISK-009-02]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config (Consumer), devs-cli (Consumer)]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-config/tests/workflow_validation_test.rs` that:
    - Creates a temporary directory structure mimicking `.devs/workflows/`.
    - Creates 6 valid TOML workflow files with minimal but complete definitions:
        1. `tdd-red.toml` - TDD red phase workflow
        2. `tdd-green.toml` - TDD green phase workflow
        3. `presubmit-check.toml` - Full presubmit verification workflow
        4. `build-only.toml` - Build-only verification workflow
        5. `unit-test-crate.toml` - Per-crate unit test workflow
        6. `e2e-all.toml` - Full E2E test suite workflow
    - Uses `devs_config::WorkflowDefinition::load_from_path()` to parse each file.
    - Asserts that `validate()` returns `Ok(())` for all 6 workflows.
    - Verifies each workflow has required fields: `name`, at least one `[[stage]]`, valid `depends_on` references.
- [ ] Write a negative test that creates an invalid workflow (missing required field, circular dependency) and asserts `validate()` returns `Err` with specific error messages.

## 2. Task Implementation
- [ ] Create the `.devs/workflows/` directory in the project root if it doesn't exist.
- [ ] Implement each of the 6 standard workflow TOML files following the declarative format from `1_PRD-REQ-006`:
    - Each workflow must have a unique `name` field.
    - Each stage must have: `name`, `pool`, `prompt`, `completion` fields.
    - `depends_on` arrays must reference only stages defined earlier in the same workflow or in shared dependencies.
    - Use template variables like `{{inputs.crate_name}}` where appropriate.
- [ ] Ensure prompt file references point to existing files in `.devs/prompts/` or create minimal placeholder prompts.
- [ ] Implement or verify the `devs-config` crate's `WorkflowDefinition::validate()` method checks:
    - All `depends_on` references resolve to defined stages.
    - No circular dependencies exist (DAG validation).
    - Required fields are present.
    - Stage names are unique within a workflow.

## 3. Code Review
- [ ] Verify TOML syntax is valid using `toml_edit` or similar parser.
- [ ] Confirm all `depends_on` relationships form valid DAGs (no cycles).
- [ ] Check that workflow names follow kebab-case convention.
- [ ] Ensure prompt templates use correct `{{variable}}` syntax.
- [ ] Verify workflows don't reference non-existent agent pools.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config --test workflow_validation_test` and ensure all tests pass.
- [ ] Run `cargo test -p devs-config` to ensure no regressions in config parsing.

## 5. Update Documentation
- [ ] Add documentation in `docs/workflows/standard-workflows.md` describing each of the 6 standard workflows.
- [ ] Document the workflow validation rules in `crates/devs-config/README.md`.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` shows `AC-RISK-009-02` as covered.
- [ ] Run `./do lint` to ensure no clippy warnings or formatting issues in the config crate.
