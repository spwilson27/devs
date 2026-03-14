# Task: Implement Template Injection Prevention Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-003], [SEC-006], [SEC-007], [SEC-040], [SEC-041], [SEC-042], [SEC-043], [SEC-044], [SEC-045], [SEC-046], [SEC-047], [SEC-048], [SEC-049], [SEC-050], [SEC-051], [SEC-NNN], [5_SECURITY_DESIGN-REQ-106], [5_SECURITY_DESIGN-REQ-107], [5_SECURITY_DESIGN-REQ-108], [5_SECURITY_DESIGN-REQ-109], [5_SECURITY_DESIGN-REQ-110], [5_SECURITY_DESIGN-REQ-111], [5_SECURITY_DESIGN-REQ-112], [5_SECURITY_DESIGN-REQ-113], [5_SECURITY_DESIGN-REQ-211], [5_SECURITY_DESIGN-REQ-212], [5_SECURITY_DESIGN-REQ-213], [5_SECURITY_DESIGN-REQ-214], [5_SECURITY_DESIGN-REQ-215], [5_SECURITY_DESIGN-REQ-216], [5_SECURITY_DESIGN-REQ-217], [5_SECURITY_DESIGN-REQ-218], [5_SECURITY_DESIGN-REQ-219], [5_SECURITY_DESIGN-REQ-220], [AC-SEC-1-011], [AC-SEC-1-012], [AC-SEC-1-015], [AC-SEC-1-017], [AC-SEC-1-018], [AC-SEC-1-019], [AC-SEC-1-020], [AC-SEC-2-016], [AC-SEC-2-017]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_template_single_pass_no_recursion` asserting that template output containing `{{stage.other.stdout}}` is NOT re-expanded
- [ ] Write test `test_template_resolve_valid_variable` asserting `{{stage.plan.exit_code}}` resolves correctly
- [ ] Write test `test_template_resolve_missing_variable_errors` asserting unknown variables produce an error
- [ ] Write test `test_prompt_file_path_validation` asserting paths with `..` components are rejected
- [ ] Write test `test_env_var_key_validation` asserting keys matching `^[A-Z_][A-Z0-9_]*$` pass and others fail
- [ ] Write test `test_structured_output_depth_limit` asserting JSON nesting > 128 levels is rejected
- [ ] Write test `test_structured_output_field_type_check` asserting non-scalar types in expected scalar positions are rejected
- [ ] Write test `test_stdout_truncation_limit` asserting output > 10 KiB is truncated

## 2. Task Implementation
- [ ] Implement `TemplateResolver` in `crates/devs-core/src/template.rs` with single-pass `resolve(template: &str, context: &TemplateContext) -> Result<String, TemplateError>` that replaces `{{stage.<name>.<field>}}` variables WITHOUT recursive re-expansion
- [ ] Define `TemplateContext` holding stage outputs as `HashMap<String, HashMap<String, String>>`
- [ ] Define `TemplateError` enum with `UnknownVariable`, `InvalidSyntax`
- [ ] Define `validate_env_var_key(key: &str) -> Result<(), EnvVarKeyError>` enforcing `^[A-Z_][A-Z0-9_]*$`
- [ ] Define `validate_prompt_file_path(path: &Path, workspace: &Path) -> Result<PathBuf, PathValidationError>`
- [ ] Define `StructuredOutputValidator` with `max_depth: usize` (default 128) and `validate(json: &serde_json::Value) -> Result<(), ValidationError>`
- [ ] Define `OutputTruncation` with configurable `max_bytes: usize` (default 10240) and `truncate(output: &str) -> (String, bool)` returning truncated output and whether truncation occurred

## 3. Code Review
- [ ] Verify template resolution is strictly single-pass
- [ ] Verify no shell metacharacter injection is possible through template variables
- [ ] Verify JSON depth checking does not itself cause stack overflow (use iterative approach)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core template` and confirm all tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate

## 5. Update Documentation
- [ ] Add doc comments to `TemplateResolver::resolve` explicitly stating the single-pass guarantee and why recursive expansion is prohibited
- [ ] Document `StructuredOutputValidator` depth limit and the iterative algorithm used to avoid stack overflow
- [ ] Document `OutputTruncation` byte-length semantics

## 6. Automated Verification
- [ ] `cargo clippy -p devs-core -- -D warnings` passes with no warnings
- [ ] `cargo test -p devs-core template` passes
- [ ] `cargo fmt --check -p devs-core` passes
