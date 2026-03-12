# Task: Template and Output Field Boolean Enforcement (Sub-Epic: 086_Detailed Domain Specifications (Part 51))

## Covered Requirements
- [2_TAS-REQ-505], [2_TAS-REQ-506]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-core/src/template/resolver_tests.rs` (or similar location for `TemplateResolver`) that attempts to resolve a reference like `{{stage.X.output.field}}` where stage `X` is configured with `StageCompletion::ExitCode`. Verify that the resolver returns `TemplateError::NoStructuredOutput`.
- [ ] Write a unit test in `devs-core/src/domain/structured_output_tests.rs` (or similar location for output parsing) that parses a `.devs_output.json` file where the `"success"` field is a string `"true"` instead of a boolean `true`. Verify that the parser fails and that subsequent stage transitions correctly handle this as a failure state.

## 2. Task Implementation
- [ ] In `devs-core/src/template/resolver.rs`, add the variant `NoStructuredOutput` to the `TemplateError` enum.
- [ ] In `TemplateResolver::resolve`, add logic to check the `StageCompletion` type of the referenced stage. If it is `ExitCode` and the reference is trying to access a field within `output`, return `TemplateError::NoStructuredOutput`.
- [ ] In `devs-core/src/domain/structured_output.rs`, update the deserialization logic for the stage output JSON (usually `.devs_output.json`). Ensure that the `"success"` field is strictly enforced as a boolean. If it's a string, the parsing must fail.
- [ ] Ensure that `devs-core`'s `StateMachine` (or whichever component handles stage transitions based on output) correctly marks a stage as `Failed` if the output parsing fails due to this type mismatch.

## 3. Code Review
- [ ] Verify that `TemplateError::NoStructuredOutput` is properly documented with doc comments.
- [ ] Verify that the boolean enforcement for `"success"` is done at the Serde deserialization level (e.g., using `#[serde(deny_unknown_fields)]` or custom deserializer if needed, though standard boolean parsing in Serde should already fail for strings unless configured otherwise).
- [ ] Ensure that the error messages are clear and help the user identify the source of the configuration error.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the new unit tests pass.
- [ ] Run `./do test` to ensure no regressions in other crates.

## 5. Update Documentation
- [ ] Update `devs-core` README.md or internal documentation to note the strict type requirements for stage outputs and template references.

## 6. Automated Verification
- [ ] Verify that the code contains the required traceability annotations: `/// Verifies [2_TAS-REQ-505]` and `/// Verifies [2_TAS-REQ-506]`.
- [ ] Run `.tools/verify_requirements.py` to ensure the new requirements are correctly mapped to tests.
