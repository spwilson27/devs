# Task: Template Error Fail-Fast & Unknown Variable Error (Sub-Epic: 062_Detailed Domain Specifications (Part 27))

## Covered Requirements
- [2_TAS-REQ-272], [2_TAS-REQ-274]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write a unit test for `TemplateResolver` that attempts to resolve a template containing an unknown variable (e.g., `{{unknown.var}}`).
- [ ] Assert that the resolver returns `Err(TemplateError::UnknownVariable { expr: String })` and does NOT return an empty string or a partial resolution.
- [ ] Write an integration test in `devs-core` (or the scheduler logic) that submits a stage with an unresolvable template.
- [ ] Assert that the stage transitions to `Failed` IMMEDIATELY, without invoking the `AgentAdapter` or spawning any process.
- [ ] Assert that the exact error message from `TemplateError::UnknownVariable` is present in the `StageRun.output.stderr` field.

## 2. Task Implementation
- [ ] In `devs-core`, update `TemplateResolver` to strictly validate all `{{...}}` expressions.
- [ ] Implement `TemplateError::UnknownVariable` enum variant.
- [ ] Ensure that if any variable is missing or malformed, the entire resolution fails with an error.
- [ ] In the scheduler/executor logic (where templates are resolved before spawn), add a check to capture the result of `TemplateResolver::resolve`.
- [ ] If resolution returns an error, catch it and transition the `StageRun` to `Failed` state.
- [ ] Populate `StageRun.output.stderr` with the stringified version of the template error.
- [ ] Ensure the agent spawning logic is guarded such that it only proceeds if template resolution is successful.

## 3. Code Review
- [ ] Verify that no "default" or "empty" values are substituted for unknown variables.
- [ ] Ensure the error message in `stderr` is descriptive enough for the user to debug the template issue.
- [ ] Verify that the state transition to `Failed` happens before any external system calls (PTY, Docker, etc.).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify `TemplateResolver` behavior.
- [ ] Run the scheduler integration tests to verify the fail-fast behavior.

## 5. Update Documentation
- [ ] Document the `TemplateError::UnknownVariable` behavior in the internal `devs-core` developer guide or doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Verify that `2_TAS-REQ-272` and `2_TAS-REQ-274` are correctly mapped in the test results.
