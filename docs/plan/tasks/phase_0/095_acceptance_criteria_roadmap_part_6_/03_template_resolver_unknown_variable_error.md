# Task: TemplateResolver Unknown Variable Error Handling (Sub-Epic: 095_Acceptance Criteria & Roadmap (Part 6))

## Covered Requirements
- [AC-ROAD-P0-005]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (Domain Types & Invariants)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/template_resolver.rs` (or equivalent), write a unit test `test_unknown_variable_returns_error`:
  1. Create a `TemplateResolver` with a context containing known variables (e.g., `{"stage.plan.exit_code": "0"}`).
  2. Call `resolve("Result: {{stage.nonexistent.field}}")`.
  3. Assert the result is `Err(TemplateError::UnknownVariable { name: "stage.nonexistent.field" })`.
  4. Explicitly assert that `Ok(String)` is NOT returned — in particular, assert the `Ok` variant never contains an empty string where the variable should have been.
- [ ] Write a second test `test_unknown_variable_not_silently_empty` that attempts resolution and uses `assert!(result.is_err())` followed by matching on the specific error variant.
- [ ] Write a positive test `test_known_variable_resolves` confirming `resolve("Code: {{stage.plan.exit_code}}")` returns `Ok("Code: 0")`.
- [ ] Include `// Covers: AC-ROAD-P0-005` annotation on all related tests.

## 2. Task Implementation
- [ ] In `devs-core`, ensure `TemplateResolver::resolve(template: &str, context: &TemplateContext) -> Result<String, TemplateError>` scans for `{{...}}` patterns and looks up each variable name in the context.
- [ ] When a variable name is not found in the context, return `Err(TemplateError::UnknownVariable { name: String })` immediately — do NOT substitute an empty string or a placeholder.
- [ ] Ensure `TemplateError::UnknownVariable` variant exists and carries the missing variable name.
- [ ] Ensure `TemplateError` implements `Debug`, `Display`, and `std::error::Error`.
- [ ] Handle edge cases: nested braces `{{{{`, unclosed `{{`, and empty variable name `{{}}` should return appropriate errors (`MalformedTemplate` or similar), not silently produce garbage.

## 3. Code Review
- [ ] Verify the resolver never returns `Ok("")` or `Ok` with a missing-variable placeholder for unknown variables.
- [ ] Verify the regex/parser correctly handles `{{` delimiters and doesn't conflict with literal braces.
- [ ] Verify `TemplateError` variants are exhaustive for the documented failure modes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- template_resolver` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `TemplateResolver::resolve()` documenting the error contract: unknown variables always produce `Err`, never silent substitution.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- template_resolver --nocapture` and assert exit code 0.
- [ ] Run `grep -r 'Covers: AC-ROAD-P0-005' crates/devs-core/` and assert at least 1 match.
