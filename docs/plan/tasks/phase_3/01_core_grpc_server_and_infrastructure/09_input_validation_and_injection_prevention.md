# Task: Input Validation and Injection Prevention (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-003], [5_SECURITY_DESIGN-REQ-006], [5_SECURITY_DESIGN-REQ-007], [5_SECURITY_DESIGN-REQ-008], [5_SECURITY_DESIGN-REQ-011], [5_SECURITY_DESIGN-REQ-040], [5_SECURITY_DESIGN-REQ-041], [5_SECURITY_DESIGN-REQ-042], [5_SECURITY_DESIGN-REQ-043], [5_SECURITY_DESIGN-REQ-044], [5_SECURITY_DESIGN-REQ-045], [5_SECURITY_DESIGN-REQ-046], [5_SECURITY_DESIGN-REQ-048], [5_SECURITY_DESIGN-REQ-049], [5_SECURITY_DESIGN-REQ-050], [5_SECURITY_DESIGN-REQ-056], [5_SECURITY_DESIGN-REQ-072], [5_SECURITY_DESIGN-REQ-073]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-core (consumer - BoundedString, EnvKey, TemplateResolver)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/template_security_test.rs`:
  - `test_template_expansion_is_single_pass`: Expand `{{stage.a.output.x}}` where `x` contains `{{stage.b.output.y}}`; assert the `{{...}}` in the result is literal text, not re-expanded (REQ-006).
  - `test_template_unreachable_stage_fails`: Reference a stage not in `depends_on` closure; assert `TemplateError::UnreachableStage` (REQ-041).
- [ ] In `crates/devs-core/tests/prompt_file_validation_test.rs`:
  - `test_absolute_path_rejected`: Validate `/etc/passwd` as prompt_file; assert rejection (REQ-048).
  - `test_dot_dot_path_rejected`: Validate `../../secrets` as prompt_file; assert rejection.
  - `test_windows_drive_letter_rejected`: Validate `C:\secret` as prompt_file; assert rejection.
  - `test_relative_path_accepted`: Validate `prompts/plan.md` as prompt_file; assert accepted.
- [ ] In `crates/devs-core/tests/env_key_test.rs`:
  - `test_env_key_valid_pattern`: `"CLAUDE_API_KEY"` matches `[A-Z_][A-Z0-9_]{0,127}` (REQ-046).
  - `test_env_key_rejects_lowercase`: `"api_key"` rejected.
  - `test_env_key_rejects_shell_special`: `"KEY;rm"` rejected.
  - `test_env_key_max_128_chars`: 129-char key rejected.
- [ ] In `crates/devs-core/tests/subprocess_test.rs`:
  - `test_agent_spawn_uses_arg_array_not_shell`: Verify `Command::new("agent").arg(prompt)` is used, not `Command::new("sh").arg("-c").arg(...)` (REQ-044).
- [ ] In `crates/devs-core/tests/structured_output_test.rs`:
  - `test_json_depth_limit_128`: Parse JSON nested 129 levels; assert error (REQ-049).
  - `test_success_field_must_be_boolean`: Parse `{"success": "true"}`; assert failure with message containing `"must be a boolean"` (REQ-050).
  - `test_success_field_numeric_rejected`: Parse `{"success": 1}`; assert failure.
  - `test_valid_structured_output_parses`: Parse `{"success": true, "data": {}}`; assert success.
- [ ] In `crates/devs-core/tests/context_file_test.rs`:
  - `test_context_file_max_10mib`: Generate >10 MiB of stage outputs; assert context file is truncated to <=10 MiB (REQ-073).
  - `test_context_file_proportional_truncation`: With 3 stages of varying sizes exceeding 10 MiB, verify each is truncated proportionally.

## 2. Task Implementation
- [ ] In `devs-core` `TemplateResolver`: ensure `resolve()` performs exactly one pass — after substitution, do NOT re-scan for `{{...}}` patterns (REQ-006).
- [ ] In `devs-core` `TemplateResolver`: before resolving, validate all referenced stage names are in the transitive `depends_on` closure. Return `TemplateError::UnreachableStage` if not (REQ-041).
- [ ] In `devs-core`, add `validate_prompt_file_path(path: &str) -> Result<()>`: reject absolute paths, `..` components, Windows drive letters (REQ-007, REQ-048).
- [ ] In `devs-core`, enforce `EnvKey` validation via regex `[A-Z_][A-Z0-9_]{0,127}` (REQ-046).
- [ ] In `devs-adapters`, ensure all agent subprocess spawning uses `tokio::process::Command` with `.arg()` calls — never shell string interpolation (REQ-044). Prompt file paths use UUID filenames (REQ-045).
- [ ] In `devs-core` or `devs-scheduler`, implement structured output parser:
  - Use `serde_json` with depth limit of 128 (REQ-049). Use `serde_json::from_str` with a custom deserializer or pre-check depth.
  - Validate `success` field is a JSON boolean literal (REQ-050).
- [ ] In `devs-core`, implement context file builder with 10 MiB max and proportional truncation (REQ-073).
- [ ] Document prompt injection risk (REQ-003, REQ-043) as inherent to AI chaining; note human review is recommended.
- [ ] Document checkpoint tampering risk (REQ-008) and log injection risk (REQ-011) in security docs.

## 3. Code Review
- [ ] Verify no `Command::new("sh")` or `Command::new("cmd")` patterns in subprocess code.
- [ ] Confirm template resolver has no recursive expansion logic.
- [ ] Check that `EnvKey` validation is applied at the config parsing boundary.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and `cargo test -p devs-adapters` with zero failures.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 18 REQs.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
