# Task: Define Standard Workflow Definitions (Sub-Epic: 13_Roadmap Phase 4 Infrastructure)

## Covered Requirements
- [AC-ROAD-P4-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a unit test module at `devs-config/src/workflow_validation.rs` (or equivalent test location) with the following tests:
  - `test_all_standard_workflows_exist()`: Iterates through the six mandatory workflow filenames and asserts each file exists in `.devs/workflows/`
  - `test_all_standard_workflows_parse()`: Reads each TOML file and parses it using `WorkflowDefinition::from_toml()`, asserting no parse errors
  - `test_workflow_has_required_fields()`: For each parsed workflow, asserts that `name`, `[[stage]]` entries, and `pool` are present
  - `test_presubmit_check_has_correct_stages()`: Asserts `presubmit-check.toml` contains stages for build, unit tests, and E2E tests with correct `depends_on` relationships
- [ ] Tests must fail with descriptive error messages indicating which workflow file is missing or which field is invalid
- [ ] Add test to `devs-config/Cargo.toml` test suite and ensure it runs via `cargo test -p devs-config`

## 2. Task Implementation
- [ ] Create the `.devs/workflows/` directory at the project root
- [ ] Implement **`tdd-red.toml`**:
  ```toml
  [workflow]
  name = "tdd-red"
  
  [[stage]]
  name = "create-failing-test"
  pool = "standard"
  prompt = "Create a new unit test in tests/ that demonstrates the desired behavior. The test should fail when run."
  completion = "exit_code"
  ```
- [ ] Implement **`tdd-green.toml`**:
  ```toml
  [workflow]
  name = "tdd-green"
  
  [[stage]]
  name = "implement-to-pass"
  pool = "standard"
  prompt = "Implement the minimum code required to make the failing test pass. Do not refactor yet."
  completion = "exit_code"
  ```
- [ ] Implement **`build-only.toml`**:
  ```toml
  [workflow]
  name = "build-only"
  
  [[stage]]
  name = "compile-workspace"
  pool = "standard"
  prompt = "Run `./do build` and ensure compilation succeeds with no errors."
  completion = "exit_code"
  ```
- [ ] Implement **`unit-test-crate.toml`**:
  ```toml
  [workflow]
  name = "unit-test-crate"
  
  [workflow.inputs]
  crate_name = { type = "string", required = true }
  
  [[stage]]
  name = "run-crate-tests"
  pool = "standard"
  prompt = "Run `cargo test -p {{inputs.crate_name}}` and ensure all tests pass."
  completion = "exit_code"
  ```
- [ ] Implement **`e2e-all.toml`**:
  ```toml
  [workflow]
  name = "e2e-all"
  
  [[stage]]
  name = "run-e2e-tests"
  pool = "standard"
  prompt = "Run `./do test` for E2E tests and ensure all pass."
  completion = "exit_code"
  ```
- [ ] Implement **`presubmit-check.toml`**:
  ```toml
  [workflow]
  name = "presubmit-check"
  
  [[stage]]
  name = "build"
  pool = "standard"
  prompt = "Run `./do build`"
  completion = "exit_code"
  
  [[stage]]
  name = "format"
  pool = "standard"
  prompt = "Run `./do format`"
  completion = "exit_code"
  depends_on = ["build"]
  
  [[stage]]
  name = "lint"
  pool = "standard"
  prompt = "Run `./do lint`"
  completion = "exit_code"
  depends_on = ["build"]
  
  [[stage]]
  name = "unit-tests"
  pool = "standard"
  prompt = "Run `./do test` for unit tests"
  completion = "exit_code"
  depends_on = ["build"]
  
  [[stage]]
  name = "coverage"
  pool = "standard"
  prompt = "Run `./do coverage`"
  completion = "exit_code"
  depends_on = ["unit-tests"]
  
  [[stage]]
  name = "e2e-tests"
  pool = "standard"
  prompt = "Run E2E tests for CLI, TUI, and MCP interfaces"
  completion = "exit_code"
  depends_on = ["format", "lint"]
  ```
- [ ] Ensure all workflows use `completion = "exit_code"` for stage completion signals
- [ ] Ensure all workflows reference `pool = "standard"` (the bootstrap pool configuration)

## 3. Code Review
- [ ] Verify that all six workflows follow the DAG structure with correct `depends_on` declarations
- [ ] Ensure `presubmit-check.toml` correctly models the presubmit sequence: build → format/lint/test in parallel → coverage → e2e
- [ ] Validate that workflow input parameters use correct TOML syntax for the `[workflow.inputs]` table
- [ ] Confirm no circular dependencies exist in any workflow graph
- [ ] Verify all stage names are unique within each workflow

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config workflow_validation` and ensure all tests pass
- [ ] Manually verify each TOML file parses correctly using `toml-cli` or similar tool

## 5. Update Documentation
- [ ] Create `.devs/workflows/README.md` documenting:
  - Purpose of each standard workflow
  - How to submit a workflow: `devs submit <workflow-name>`
  - How to pass input parameters: `devs submit unit-test-crate --input crate_name=devs-core`
  - DAG visualization for `presubmit-check` workflow

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config` and ensure 100% pass rate for workflow validation tests
- [ ] Run `./do lint` to ensure no TOML syntax errors in workflow files
- [ ] Verify the test output includes: `test workflow_validation::test_all_standard_workflows_exist ... ok` and `test workflow_validation::test_all_standard_workflows_parse ... ok`
