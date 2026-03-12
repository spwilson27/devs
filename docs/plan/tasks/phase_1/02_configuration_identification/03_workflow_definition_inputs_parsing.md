# Task: devs-config: Workflow Definition and Input Parameter Parsing (Sub-Epic: 02_Configuration & Identification)

## Covered Requirements
- [1_PRD-REQ-007]

## Dependencies
- depends_on: [01_server_config_implementation.md]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a test suite in `crates/devs-config/src/workflow.rs` that parses a sample workflow definition with a `[workflow.inputs]` section.
- [ ] Test with multiple input kinds: `string`, `path`, and `integer`.
- [ ] Test validation: Ensure that a submission with a missing required parameter or a parameter value of the wrong type (e.g., string passed for integer) is rejected [2_PRD-BR-009].
- [ ] Test that template strings (e.g., `{{stage.name.field}}`) are correctly parsed into a structured representation (e.g., `TemplateString`).

## 2. Task Implementation
- [ ] Define the `WorkflowDefinition` struct (shared or re-exported from `devs-core`) with an `inputs` field.
- [ ] Define `WorkflowInput` struct and `InputKind` enum (String, Path, Integer).
- [ ] Implement TOML/YAML parsing for the `inputs` section of the workflow definition [1_PRD-REQ-007].
- [ ] Implement `validate_inputs(params: HashMap<String, Value>)` which checks supplied run parameters against the `WorkflowDefinition` requirements.
- [ ] Define a `TemplateString` wrapper in `devs-core` (or use a library such as `handlebars`) that `devs-config` can use to identify strings that require interpolation.
- [ ] Ensure the validation logic is atomic and held under a project lock during run creation [3_PRD-BR-043].

## 3. Code Review
- [ ] Verify that all input parameter names are validated against the same identifier rules as environment variables [3_PRD-BR-013].
- [ ] Confirm that required parameters without a default value cause a validation error if not supplied at submission.
- [ ] Ensure that no resolution of template variables happens during the parsing phase; the structure should only represent the un-resolved templates.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config --lib workflow`.
- [ ] Verify that the type coercion logic (e.g., string to path) works correctly.

## 5. Update Documentation
- [ ] Update `devs-config/README.md` with examples of typed workflow inputs.

## 6. Automated Verification
- [ ] Run `./do lint`.
- [ ] Run `cargo-llvm-cov` and verify that the workflow input parsing has ≥ 90% coverage.
