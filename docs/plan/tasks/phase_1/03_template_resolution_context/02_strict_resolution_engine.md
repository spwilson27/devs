# Task: Template Engine & Strict Resolution (Sub-Epic: 03_Template Resolution & Context)

## Covered Requirements
- [2_TAS-REQ-075]

## Dependencies
- depends_on: [01_template_resolver_skeleton.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/template/tests.rs` for the full substitution logic (e.g., `resolve_string`).
- [ ] Write a test that fails when a variable like `{{missing_var}}` is present in a template but not in the `ResolutionContext`.
- [ ] Ensure the error message matches `"unresolved template variable: {{<expr>}}"` as specified in [2_TAS-REQ-075].
- [ ] Verify that empty strings are NOT substituted for missing variables.

## 2. Task Implementation
- [ ] Integrate a template engine (e.g., `handlebars`, `tera`, or a custom implementation if simpler).
- [ ] Implement `TemplateResolver::resolve_string(&self, template: &str, ctx: &ResolutionContext) -> Result<String, ResolutionError>`.
- [ ] Set up the engine to be "strict," meaning any missing key should trigger an error rather than rendering a default or empty value.
- [ ] Ensure `ResolutionError` preserves the name of the missing variable for the final error message.

## 3. Code Review
- [ ] Verify the engine correctly handles nested JSON fields like `{{stage.plan.structured.field_name}}`.
- [ ] Check for potential template injection vulnerabilities (ensure we only resolve variables, not execute code).
- [ ] Confirm the error message exactly matches the requirement.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib template::tests` and ensure all substitution and strictness tests pass.

## 5. Update Documentation
- [ ] Update internal documentation to note the strict resolution policy and list common error messages.

## 6. Automated Verification
- [ ] Verify traceability annotations: `// Covers: 2_TAS-REQ-075`.
- [ ] Run `./tools/verify_requirements.py` to ensure requirements are correctly mapped.
