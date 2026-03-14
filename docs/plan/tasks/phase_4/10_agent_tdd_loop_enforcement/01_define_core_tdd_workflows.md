# Task: Define Core TDD and Presubmit Workflow TOML Definitions (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-031] (partial)

## Dependencies
- depends_on: []
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-config/src/workflow/tests.rs` that verify the parsing and validation of the three mandatory development workflows:
    1. `tdd-red.toml`: Verify it defines a single stage with `completion = "exit_code"` and requires `test_name` and `prompt_file` inputs.
    2. `tdd-green.toml`: Verify it defines a single stage with `completion = "exit_code"` and same inputs.
    3. `presubmit-check.toml`: Verify it defines the 5-stage pipeline (`format-check`, `clippy`, `test-and-traceability`, `coverage`, `doc-check`) with correct dependencies and a 900-second global timeout.
- [ ] Use `WorkflowDefinition::from_toml` to ensure the generated TOML files are valid according to the schema.

## 2. Task Implementation
- [ ] Create the `.devs/workflows/` directory in the workspace root.
- [ ] Implement `.devs/workflows/tdd-red.toml` as specified in §3.2.1 of the Glass-Box design.
- [ ] Implement `.devs/workflows/tdd-green.toml` as specified in §3.2.2.
- [ ] Implement `.devs/workflows/presubmit-check.toml` as specified in §3.2.3.
- [ ] Create the corresponding prompt templates in `.devs/prompts/` (e.g., `run-fmt-check.md`, `run-clippy.md`, `run-tests.md`, `run-coverage.md`, `run-doc-check.md`).
- [ ] Ensure all prompt files include the mandatory `<!-- devs-prompt: <name> -->` header.

## 3. Code Review
- [ ] Verify that the `presubmit-check` stages use `completion = "structured_output"` where necessary (test, coverage) to provide the gate results for assertion.
- [ ] Ensure that `tdd-red` and `tdd-green` have `timeout_secs` configured at the stage level to prevent hanging the pool indefinitely.
- [ ] Confirm that no Rust builder-API workflows are used here, as these must be declarative for runtime execution.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-config` to verify the TOML definitions are parseable and valid.
- [ ] Run `./do lint` and ensure no "prompt-header missing" warnings are produced for the new files.

## 5. Update Documentation
- [ ] Update the project's agent "memory" (GEMINI.md or equivalent) with the available workflow names and their required inputs.

## 6. Automated Verification
- [ ] Run `devs list-workflows` (via CLI) and verify that `tdd-red`, `tdd-green`, and `presubmit-check` are all listed and have the correct input schemas.
