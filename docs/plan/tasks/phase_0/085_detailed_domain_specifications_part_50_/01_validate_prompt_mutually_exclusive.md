# Task: Validate Prompt Mutually Exclusive (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-501]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] In `devs-core/src/validation.rs` (or the module containing `ValidationError`), add the `MutuallyExclusive` variant to `ValidationError` if not already present. The variant should carry the stage name and the two conflicting field names (e.g., `MutuallyExclusive { stage: String, field_a: &'static str, field_b: &'static str }`).
- [ ] In `devs-config/src/workflow_validation.rs` (or equivalent), write `test_prompt_and_prompt_file_both_set_returns_mutually_exclusive_error`:
  - Construct a `StageDefinition` with `prompt = Some("Do stuff".into())` and `prompt_file = Some("plan.md".into())`.
  - Call the stage validation function.
  - Assert the returned error list contains exactly one `ValidationError::MutuallyExclusive` with `field_a = "prompt"` and `field_b = "prompt_file"`.
- [ ] Write `test_prompt_only_set_passes_validation`: construct a `StageDefinition` with only `prompt` set, assert no `MutuallyExclusive` error.
- [ ] Write `test_prompt_file_only_set_passes_validation`: construct a `StageDefinition` with only `prompt_file` set, assert no `MutuallyExclusive` error.
- [ ] Write `test_mutually_exclusive_error_aggregated_with_other_errors`: construct a `StageDefinition` with both `prompt` and `prompt_file` set AND an empty `name` field. Validate the full workflow. Assert the returned error list contains BOTH a `MutuallyExclusive` error AND whatever error corresponds to the empty name — confirming multi-error collection.
- [ ] Add `// Covers: 2_TAS-REQ-501` annotation to all test functions.

## 2. Task Implementation
- [ ] Add `MutuallyExclusive { stage: String, field_a: &'static str, field_b: &'static str }` to the `ValidationError` enum in `devs-core` if not present.
- [ ] Implement `Display` for the new variant: `"stage '{stage}': fields '{field_a}' and '{field_b}' are mutually exclusive"`.
- [ ] In the `StageDefinition` validation function within `devs-config`, add a check: if both `prompt.is_some()` and `prompt_file.is_some()`, push `ValidationError::MutuallyExclusive { stage: stage.name.clone(), field_a: "prompt", field_b: "prompt_file" }` into the error collector.
- [ ] Ensure this check does NOT short-circuit — the validation function must continue checking other fields after detecting this error.

## 3. Code Review
- [ ] Verify the validation function uses a `Vec<ValidationError>` collector pattern (not early-return `Result`).
- [ ] Confirm `MutuallyExclusive` error includes enough context (stage name, field names) for user-facing diagnostics.
- [ ] Ensure `devs-core` remains free of runtime dependencies (no tokio, git2, reqwest, tonic) per [2_TAS-REQ-001E].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- prompt` and `cargo test -p devs-core` to verify all new tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the `MutuallyExclusive` variant explaining when it is emitted.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` includes `2_TAS-REQ-501` as covered.
- [ ] Run `./do lint` to confirm no clippy warnings or formatting issues.
