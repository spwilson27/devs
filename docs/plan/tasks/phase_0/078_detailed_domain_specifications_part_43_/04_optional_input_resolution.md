# Task: Optional Input Resolution Logic (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-468]

## Dependencies
- depends_on: ["03_input_count_limits.md"]
- shared_components: ["devs-core (consumer — TemplateResolver, domain types)", "devs-config (consumer — WorkflowInput type)"]

## 1. Initial Test Written
- [ ] In the workflow input resolution test module (e.g., `crates/devs-config/src/workflow_input.rs` or `crates/devs-core/src/template.rs`), add tests:
  - `test_optional_input_no_default_is_valid` — a `WorkflowInput { required: false, default: None }` passes definition validation.
  - `test_optional_input_with_default_is_valid` — a `WorkflowInput { required: false, default: Some("foo") }` passes validation.
  - `test_optional_input_not_provided_resolves_to_null` — when resolving inputs at submission time, an optional input with no default that is not provided by the user resolves to `serde_json::Value::Null`.
  - `test_optional_input_with_default_not_provided_uses_default` — when not provided, the default value is used.
  - `test_required_input_not_provided_is_error` — a required input not provided at submission returns an error (control test).
- [ ] Each test must include `// Covers: 2_TAS-REQ-468`.

## 2. Task Implementation
- [ ] Ensure the `WorkflowInput` struct has fields: `name: String`, `required: bool`, `default: Option<serde_json::Value>` (or equivalent typed value).
- [ ] In the input resolution function (called at `submit_run` time), implement:
  - For each declared input, check if the user provided a value.
  - If not provided and `required: true` → return error.
  - If not provided and `required: false` → use `default` if present, otherwise resolve to `Value::Null`.
- [ ] Ensure `Value::Null` is correctly propagated to template resolution (i.e., `{{input.foo}}` resolves to empty string or `"null"` depending on template policy).

## 3. Code Review
- [ ] Verify that `required: false` with no default does NOT cause a validation error at definition time.
- [ ] Verify runtime resolution produces `Null`, not an error or empty string, for missing optional inputs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- optional_input` and `cargo test -p devs-core -- optional_input` and confirm all pass.

## 5. Update Documentation
- [ ] Add doc comments on `WorkflowInput` explaining the `required`/`default` interaction and null resolution behavior.

## 6. Automated Verification
- [ ] Run `cargo test -- optional_input --no-fail-fast 2>&1 | tail -20` and verify zero failures.
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-468' crates/` and confirm annotations exist.
