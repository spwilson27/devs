# Task: Workflow Input Parameter Validation for submit_run (Sub-Epic: 012_Foundational Technical Requirements (Part 3))

## Covered Requirements
- [2_PRD-BR-009]

## Dependencies
- depends_on: []
- shared_components: [devs-core (owner — domain types for input validation)]

## 1. Initial Test Written
- [ ] In `devs-core/src/workflow.rs` (or a new `devs-core/src/input.rs` module), write a unit test that defines a `WorkflowInputDef` with a required `String` parameter named `"task"` and validates a submission map `{"task": Value::String("hello")}` — expect `Ok(())`. Annotate: `// Covers: 2_PRD-BR-009`.
- [ ] Write a test that validates a submission map with the required `"task"` parameter missing — expect an error containing `"missing required parameter: task"`. Annotate: `// Covers: 2_PRD-BR-009`.
- [ ] Write a test that defines a `WorkflowInputDef` with an `Integer` parameter named `"count"` and validates `{"count": Value::String("abc")}` — expect an error containing `"type mismatch"` or `"invalid type for parameter: count"`. Annotate: `// Covers: 2_PRD-BR-009`.
- [ ] Write a test that validates a submission with two errors (one missing required, one type mismatch) and confirms both errors are returned in the result (multi-error collection). Annotate: `// Covers: 2_PRD-BR-009`.
- [ ] Write a test that validates a submission with all parameters correct, including optional parameters that are absent — expect `Ok(())`. Annotate: `// Covers: 2_PRD-BR-009`.
- [ ] Write a test that validates a submission containing an undeclared extra parameter — expect either an error or the parameter to be silently ignored (decide on policy and document it; the spec says "validate all workflow input parameters against their declared types", so undeclared params should be rejected). Annotate: `// Covers: 2_PRD-BR-009`.

## 2. Task Implementation
- [ ] Define an `InputKind` enum in `devs-core` with at least variants: `String`, `Integer`, `Path`, `Boolean`. Derive `Serialize`, `Deserialize`, `Clone`, `Debug`, `PartialEq`.
- [ ] Define a `WorkflowInputDef` struct with fields: `name: String`, `kind: InputKind`, `required: bool`, `default: Option<serde_json::Value>`.
- [ ] Define a `ValidationError` struct (or enum variant) with fields: `parameter: String`, `message: String`. Implement `std::fmt::Display`.
- [ ] Implement `pub fn validate_inputs(defs: &[WorkflowInputDef], provided: &HashMap<String, serde_json::Value>) -> Result<(), Vec<ValidationError>>` that:
  1. Iterates all `defs`; for each required def missing from `provided`, collects a "missing required parameter" error.
  2. For each provided value, checks the value's JSON type against the declared `InputKind` (e.g., `Value::Number` for `Integer`, `Value::String` for `String`/`Path`, `Value::Bool` for `Boolean`).
  3. Rejects any key in `provided` that does not appear in `defs` with an "undeclared parameter" error.
  4. Returns `Ok(())` if no errors, `Err(vec![...])` otherwise — all errors collected in a single pass.
- [ ] Ensure this function has no side effects (no run creation, no state mutation).
- [ ] Ensure no forbidden dependencies (`tokio`, `git2`, `reqwest`, `tonic`) are added.

## 3. Code Review
- [ ] Verify single-pass multi-error collection (not fail-fast).
- [ ] Verify `InputKind` covers string, integer, path, boolean as stated in the project description's "Workflow Inputs" section.
- [ ] Verify error messages identify the offending parameter by name.
- [ ] Verify all public types have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- input` (or relevant module filter) and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `validate_inputs`, `WorkflowInputDef`, `InputKind`, and `ValidationError` explaining the validation contract.
- [ ] Ensure `cargo doc -p devs-core --no-deps` produces zero warnings.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes an entry for `2_PRD-BR-009`.
- [ ] Run `./do lint` and confirm exit code 0.
