# Task: Project Weight Minimum Validation (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-475]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core", "devs-config"]

## 1. Initial Test Written
- [ ] In `devs-core` (or `devs-config` if project registration lives there), create a test module `tests::project_weight_validation`
- [ ] Write test `test_project_weight_zero_rejected`: construct a `Project` (or `ProjectEntry`) with `weight = 0` and call the validation/registration function. Assert it returns `Err(ValidationError::InvalidWeight)`.
- [ ] Write test `test_project_weight_one_accepted`: construct a `Project` with `weight = 1` and assert validation succeeds.
- [ ] Write test `test_project_weight_large_accepted`: construct a `Project` with `weight = 100` and assert validation succeeds.
- [ ] Write test `test_project_weight_negative_rejected` (if the type allows negative values, e.g. `i32`): assert `weight = -1` returns `ValidationError::InvalidWeight`. If the type is `u32` or similar, skip this test and add a comment explaining the type already prevents negatives.

## 2. Task Implementation
- [ ] Add `InvalidWeight` variant to `ValidationError` enum (in `devs-core` or wherever validation errors are defined). Include a `weight: u64` field (or the project weight type) so the error message reports the rejected value.
- [ ] In the project registration / `ProjectEntry` validation path, add a guard: `if project.weight < 1 { return Err(ValidationError::InvalidWeight { weight: project.weight }) }`.
- [ ] Ensure the `Display` impl for `InvalidWeight` produces a clear message, e.g. `"project weight must be >= 1, got 0"`.

## 3. Code Review
- [ ] Verify the check runs at registration time (not lazily at scheduling time).
- [ ] Verify `InvalidWeight` is a distinct error variant, not a generic string error.
- [ ] Confirm no other code paths allow a zero-weight project to be stored.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core project_weight` (adjust crate name as needed) and confirm all new tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-475` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core project_weight -- --nocapture` and verify zero failures. Grep test output for `2_TAS-REQ-475` to confirm traceability annotation is present.
