# Task: Workflow Input Parameter Definitions and Validation (Sub-Epic: 02_Configuration & Identification)

## Covered Requirements
- [1_PRD-REQ-007]

## Dependencies
- depends_on: ["01_server_config_toml_parsing.md"]
- shared_components: ["devs-core (consumer)", "devs-config (owner)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-config/tests/workflow_input_tests.rs`.
- [ ] Write a test `test_parse_workflow_with_typed_inputs` that deserializes a TOML workflow definition containing an `[[input]]` array with entries having `name`, `type` (enum: `string`, `path`, `integer`), `required` (bool), and `default` (optional). Assert the parsed `WorkflowDefinition` has the correct `inputs` vec.
- [ ] Write a test `test_validate_submission_inputs_all_required_present` that creates a `WorkflowDefinition` with two required inputs (`task_name: string`, `priority: integer`) and calls `validate_inputs({"task_name": "foo", "priority": "42"})`. Assert it returns `Ok`.
- [ ] Write a test `test_validate_submission_inputs_missing_required` that creates a `WorkflowDefinition` with one required input and calls `validate_inputs` with an empty map. Assert it returns `Err` naming the missing field.
- [ ] Write a test `test_validate_submission_inputs_type_mismatch` that submits `priority = "not_a_number"` for an `integer`-typed input. Assert validation returns an error indicating type mismatch.
- [ ] Write a test `test_validate_submission_inputs_default_fills_missing_optional` that creates an input with `required = false` and `default = "hello"`, submits without that key, and asserts the resolved inputs map contains the default value.
- [ ] Write a test `test_template_variable_references_in_prompt` that creates a workflow definition with a stage whose prompt contains `{{inputs.task_name}}` and asserts the parsed stage prompt string retains the template syntax verbatim (template resolution is in `devs-core`, not here).
- [ ] Write a test `test_reject_duplicate_input_names` that defines two inputs with the same `name` and asserts validation fails.
- [ ] Annotate each test with `// Covers: 1_PRD-REQ-007`.

## 2. Task Implementation
- [ ] Define `WorkflowInput` struct in `crates/devs-config/src/workflow.rs` with fields: `name: String`, `input_type: InputType`, `required: bool`, `default: Option<String>`. Derive `Deserialize`.
- [ ] Define `InputType` enum with variants `String`, `Path`, `Integer`. Derive `Deserialize` with `#[serde(rename_all = "lowercase")]`.
- [ ] Add `inputs: Vec<WorkflowInput>` field to `WorkflowDefinition` struct (create `WorkflowDefinition` if it doesn't exist, with fields: `name: String`, `stages: Vec<StageDefinition>`, `inputs: Vec<WorkflowInput>`).
- [ ] Define `StageDefinition` struct with fields: `name: String`, `pool: String`, `prompt: Option<String>`, `prompt_file: Option<String>`, `system_prompt: Option<String>`, `depends_on: Vec<String>`, `completion: Option<String>`, `env: HashMap<String, String>`. Derive `Deserialize`.
- [ ] Implement `WorkflowDefinition::validate_inputs(&self, submitted: &HashMap<String, String>) -> Result<HashMap<String, String>, Vec<ConfigError>>` that: (a) checks all required inputs are present, (b) validates type compatibility (integers must parse as `i64`), (c) fills defaults for missing optional inputs, (d) rejects unknown input names not declared in the definition.
- [ ] Implement input-level validation in `WorkflowDefinition::validate(&self) -> Result<(), Vec<ConfigError>>` checking: no duplicate input names, all input names are non-empty, default values (if present) match the declared type.
- [ ] Re-export `WorkflowDefinition`, `WorkflowInput`, `InputType`, and `StageDefinition` from `crates/devs-config/src/lib.rs`.

## 3. Code Review
- [ ] Verify template variable syntax (`{{inputs.X}}`, `{{stage.X.Y}}`) is NOT resolved in this crate -- only parsed and stored as literal strings. Resolution belongs to `devs-core`'s `TemplateResolver`.
- [ ] Verify type validation for `Integer` inputs uses `str::parse::<i64>()`, not a regex.
- [ ] Verify `validate_inputs` returns ALL errors, not just the first.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `WorkflowInput`, `InputType`, `WorkflowDefinition`, and `validate_inputs`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- --nocapture 2>&1 | grep -E "test result"` and confirm `0 failed`.
- [ ] Run `cargo clippy -p devs-config -- -D warnings` and confirm zero warnings.
