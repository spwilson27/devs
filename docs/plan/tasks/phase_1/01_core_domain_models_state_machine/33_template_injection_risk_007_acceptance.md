# Task: Implement Template Injection Risk Acceptance Criteria (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-007-03], [AC-RISK-007-04], [MIT-007]

## Dependencies
- depends_on: ["13_template_injection_prevention.md"]
- shared_components: [devs-core (Owner), devs-scheduler (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_template_single_pass_no_recursive_expansion` that provides input `{{stage.a.output}}` where `output` contains `{{stage.b.output}}` and asserts the nested template is NOT expanded
- [ ] Write test `test_template_injection_malicious_payload` that provides attacker-controlled stage output with shell metacharacters and asserts they are not interpreted
- [ ] Write test `test_template_injection_path_traversal` that provides `{{stage.../../etc/passwd.field}}` and asserts path traversal is rejected
- [ ] Write test `test_template_injection_html_xss_attempt` that provides stage output with `<script>` tags and asserts they are preserved as literal text (not escaped, since output is not HTML)
- [ ] Write test `test_mit_007_single_pass_documented` that asserts the single-pass guarantee is documented in `TemplateResolver` with security rationale

## 2. Task Implementation
- [ ] Extend `TemplateResolver` in `crates/devs-core/src/template.rs` with explicit single-pass guarantee:
  - Implement `resolve_single_pass(template: &str, context: &TemplateContext) -> Result<String, TemplateError>` that uses regex replacement WITHOUT recursive re-expansion
  - Add `SINGLE_PASS_GUARANTEE: &str` constant documenting the security property
- [ ] Define `TemplateInjectionTestSuite` struct with known attack payloads:
  - Shell metacharacters: `$(rm -rf /)`, `` `whoami` ``, `; cat /etc/passwd`
  - Path traversal: `../../etc/passwd`, `..\\..\\windows\\system32`
  - Template injection: `{{stage.self.output}}`, `{{constructor.constructor}}`
  - Unicode confusables: Cyrillic `а` vs Latin `a` in variable names
- [ ] Implement `MIT-007` mitigation: Single-pass template resolution with input sanitization
  - Document the single-pass algorithm in `TemplateResolver` doc comments
  - Add security comment explaining why recursive expansion is prohibited
  - Validate all template variable paths against `stage.<name>.<field>` format
- [ ] Implement `TemplateInputSanitizer` with `sanitize(input: &str) -> String` that:
  - Strips null bytes
  - Validates UTF-8 encoding
  - Rejects control characters except newline/tab
- [ ] Add `pub use template::{TemplateInjectionTestSuite, MIT_007_VERIFIED: bool};` to `crates/devs-core/src/lib.rs`

## 3. Code Review
- [ ] Verify single-pass resolution is enforced (no recursive `resolve` calls)
- [ ] Verify attack payloads from test suite are all neutralized
- [ ] Verify `MIT-007` mitigation is correctly implemented per the risk matrix
- [ ] Verify no shell interpretation of template output

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core template::injection` and confirm all injection tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add security-focused doc comment to `TemplateResolver::resolve_single_pass` explaining why recursive expansion is prohibited
- [ ] Document each attack payload in `TemplateInjectionTestSuite` with the vulnerability it tests
- [ ] Add `// Security: ` comment explaining the single-pass guarantee

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `TemplateResolver` does not call itself recursively (static analysis check)
- [ ] Run `grep -r "RISK-007" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
