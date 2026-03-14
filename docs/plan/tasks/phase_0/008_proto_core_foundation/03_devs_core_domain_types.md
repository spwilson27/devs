# Task: Implement devs-core Domain Types, StateMachine, TemplateResolver, and ValidationError (Sub-Epic: 008_Proto & Core Foundation)

## Covered Requirements
- [2_TAS-REQ-023]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Create `devs-core/tests/domain_types_test.rs` with tests for `BoundedString`:
  - `test_bounded_string_valid()`: Create `BoundedString<1, 128>` with "hello" — succeeds
  - `test_bounded_string_empty_rejected()`: `BoundedString<1, 128>` with "" — returns `Err`
  - `test_bounded_string_too_long()`: `BoundedString<1, 5>` with "toolong" — returns `Err`
  - `test_bounded_string_exact_bounds()`: Min and max length strings both succeed
  - `test_bounded_string_deref()`: Verify `Deref<Target=str>` works
- [ ] Create `devs-core/tests/state_machine_test.rs` with tests:
  - `test_workflow_run_state_transitions()`: Verify valid transitions: Pending→Running, Running→Completed, Running→Failed, Running→Cancelled, Running→Paused, Paused→Running, Paused→Cancelled
  - `test_workflow_run_invalid_transition()`: Verify Completed→Running returns error, Failed→Running returns error, Pending→Completed returns error
  - `test_stage_run_state_transitions()`: Verify valid transitions: Waiting→Eligible, Eligible→Running, Running→Completed, Running→Failed, Running→Cancelled, Running→Paused
  - `test_stage_run_invalid_transition()`: Verify invalid transitions return errors
- [ ] Create `devs-core/tests/template_resolver_test.rs` with tests:
  - `test_resolve_simple_variable()`: `{{stage.plan.exit_code}}` with context resolves correctly
  - `test_resolve_nested_variable()`: `{{stage.plan.output.field}}` resolves
  - `test_resolve_missing_variable()`: Unknown variable returns error
  - `test_resolve_no_variables()`: Plain text passes through unchanged
  - `test_resolve_multiple_variables()`: Template with 2+ variables resolves all
  - `test_resolve_workflow_input()`: `{{input.name}}` resolves from workflow inputs
- [ ] Create `devs-core/tests/validation_error_test.rs` with tests:
  - `test_validation_error_collects_multiple()`: `ValidationError` can hold multiple field errors and iterating yields all of them
  - `test_validation_error_display()`: Display format shows all collected errors
  - `test_validation_error_empty()`: No errors collected means validation passes

## 2. Task Implementation
- [ ] Create `devs-core/Cargo.toml` with:
  - `[package]` name = "devs-core"
  - `[dependencies]` serde = { workspace = true, features = ["derive"] }, thiserror = { workspace = true }
  - NO tokio, git2, reqwest, or tonic dependencies (REQ-001E enforced by other sub-epic)
- [ ] Implement `devs-core/src/types/bounded_string.rs`:
  - `pub struct BoundedString<const MIN: usize, const MAX: usize>(String)`
  - `impl BoundedString { pub fn new(s: impl Into<String>) -> Result<Self, ValidationError>` }
  - Implement `Deref<Target=str>`, `Display`, `Debug`, `Serialize`, `Deserialize`, `Clone`, `PartialEq`, `Eq`, `Hash`
- [ ] Implement `devs-core/src/state_machine.rs`:
  - `pub trait StateMachine { type State; type Error; fn transition(&mut self, to: Self::State) -> Result<(), Self::Error>; fn current(&self) -> &Self::State; }`
  - `pub enum WorkflowRunState { Pending, Running, Completed, Failed, Cancelled, Paused }`
  - `pub enum StageRunState { Waiting, Eligible, Running, Completed, Failed, Cancelled, Paused }`
  - Implement `StateMachine` for wrapper types `WorkflowRunStateMachine` and `StageRunStateMachine` with valid transition tables
- [ ] Implement `devs-core/src/template.rs`:
  - `pub struct TemplateContext` with maps for stage outputs and workflow inputs
  - `pub struct TemplateResolver;`
  - `impl TemplateResolver { pub fn resolve(template: &str, context: &TemplateContext) -> Result<String, TemplateError> }`
  - Parse `{{stage.<name>.<field>}}` and `{{input.<name>}}` patterns using regex or manual parsing
- [ ] Implement `devs-core/src/error.rs`:
  - `pub struct ValidationError { errors: Vec<FieldError> }`
  - `pub struct FieldError { field: String, message: String }`
  - Implement `Display`, `Error`, `IntoIterator` for `ValidationError`
  - `impl ValidationError { pub fn add(&mut self, field: impl Into<String>, msg: impl Into<String>); pub fn is_empty(&self) -> bool; pub fn into_result<T>(self, value: T) -> Result<T, Self>; }`
- [ ] Create `devs-core/src/lib.rs` re-exporting all public types
- [ ] Create module structure: `devs-core/src/types/mod.rs`, `devs-core/src/types/bounded_string.rs`

## 3. Code Review
- [ ] Verify `Cargo.toml` has zero forbidden dependencies (no tokio, git2, reqwest, tonic)
- [ ] Verify `StateMachine` trait is generic and reusable
- [ ] Verify state transition tables match the project description state machines exactly
- [ ] Verify `TemplateResolver` handles edge cases (empty template, no matches, nested braces)
- [ ] Verify `ValidationError` supports multi-error collection pattern per REQ-023 ("collected multi-error reporting")
- [ ] Verify all types derive `Serialize`/`Deserialize` where appropriate

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify all tests pass
- [ ] Run `cargo doc -p devs-core --no-deps` and verify zero warnings

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-023` annotation to all test functions
- [ ] Add doc comments to all public types and functions in devs-core

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `cargo tree -p devs-core` and confirm no tokio/git2/reqwest/tonic in output
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-023' devs-core/tests/` and confirm matches
