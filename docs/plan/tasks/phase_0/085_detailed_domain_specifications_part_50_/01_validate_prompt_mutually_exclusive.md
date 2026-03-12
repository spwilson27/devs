# Task: Validate Prompt Mutually Exclusive (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-501]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-config/src/validation.rs` (or equivalent validation module) that attempts to validate a `StageDefinition` where both `prompt` and `prompt_file` are set.
- [ ] The test MUST assert that validation fails with `ValidationError::MutuallyExclusive`.
- [ ] Write another test ensuring that if only one is set (either `prompt` or `prompt_file`), validation succeeds for that rule.
- [ ] Ensure the error is aggregated alongside other potential validation errors (e.g., an empty name) to verify multi-error reporting.

## 2. Task Implementation
- [ ] Add `MutuallyExclusive` variant to the `ValidationError` enum in `devs-core`.
- [ ] Update the `StageDefinition` validation logic in `devs-config` to check if both fields are non-empty/Some.
- [ ] If both are set, push `ValidationError::MutuallyExclusive` into the error collector.
- [ ] Ensure `devs-core` and `devs-config` crates are updated to handle the new error variant in their Display/Error implementations.

## 3. Code Review
- [ ] Verify that the validation logic correctly handles all combinations (both set, only prompt, only prompt_file, neither set). Note: Neither set might be allowed if there's a default, or might be a separate error, but this task focuses on the mutual exclusivity.
- [ ] Ensure no short-circuiting: validation should continue to check other fields in the stage.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and `cargo test -p devs-core` to ensure validation tests pass.

## 5. Update Documentation
- [ ] Update any internal docs in `devs-config` regarding stage validation rules.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows `2_TAS-REQ-501` as covered.
