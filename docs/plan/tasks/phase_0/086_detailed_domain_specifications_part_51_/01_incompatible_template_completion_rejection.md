# Task: Reject Template References to Exit-Code-Only Stages (Sub-Epic: 086_Detailed Domain Specifications (Part 51))

## Covered Requirements
- [2_TAS-REQ-505]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer — uses TemplateResolver and stage completion types)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/template/tests.rs` (or equivalent test module), create a test `test_template_ref_to_exit_code_stage_fails`:
  - Build a `TemplateContext` containing a stage `"build"` whose completion signal is `CompletionSignal::ExitCode`.
  - Construct a template string `"Result: {{stage.build.output.field}}"`.
  - Call `TemplateResolver::resolve(&template, &context)`.
  - Assert the result is `Err(TemplateError::NoStructuredOutput { stage: "build".into() })`.
- [ ] Create a second test `test_template_ref_to_structured_output_stage_succeeds`:
  - Build a `TemplateContext` with stage `"analyze"` using `CompletionSignal::StructuredOutput` and output `{"field": "value"}`.
  - Resolve `"Result: {{stage.analyze.output.field}}"`.
  - Assert the result is `Ok("Result: value")`.
- [ ] Create a third test `test_template_ref_to_mcp_tool_call_stage_succeeds`:
  - Same pattern but with `CompletionSignal::McpToolCall` and structured data present.
  - Assert resolution succeeds.

## 2. Task Implementation
- [ ] In `TemplateResolver::resolve()`, when resolving a `{{stage.<name>.output.<field>}}` reference, check the referenced stage's `CompletionSignal`. If it is `ExitCode`, return `Err(TemplateError::NoStructuredOutput { stage })` immediately — do not attempt to look up the field.
- [ ] Add `NoStructuredOutput { stage: String }` variant to `TemplateError` enum if not already present, with a descriptive `Display` impl: `"stage '{stage}' uses exit_code completion and has no structured output"`.
- [ ] Ensure this check runs **before agent spawn** — i.e., during the template resolution phase of stage preparation, not after execution.

## 3. Code Review
- [ ] Verify the error is returned at resolution time, not deferred to runtime.
- [ ] Verify no panic paths — all branches return `Result`.
- [ ] Verify `TemplateError::NoStructuredOutput` has `#[derive(Debug, Clone, PartialEq)]`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- template` and confirm all three tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `NoStructuredOutput` variant explaining when it is raised and referencing [2_TAS-REQ-505].

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Grep test output for `test_template_ref_to_exit_code_stage_fails` to confirm it executed.
