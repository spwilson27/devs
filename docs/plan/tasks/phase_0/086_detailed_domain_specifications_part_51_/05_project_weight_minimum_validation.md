# Task: Reject Project Registration with Weight Zero (Sub-Epic: 086_Detailed Domain Specifications (Part 51))

## Covered Requirements
- [2_TAS-REQ-509]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer — uses project validation types), devs-config (consumer — project registry validation)]

## 1. Initial Test Written
- [ ] In project validation tests (e.g., `crates/devs-core/src/project/tests.rs` or `crates/devs-config/src/project/tests.rs`), create `test_project_weight_zero_rejected`:
  - Build a project registration with `weight = 0`.
  - Run validation.
  - Assert the result contains `ValidationError::InvalidWeight`.
- [ ] Create `test_project_weight_one_accepted`:
  - `weight = 1`.
  - Assert validation passes.
- [ ] Create `test_project_weight_large_accepted`:
  - `weight = 1000`.
  - Assert validation passes.

## 2. Task Implementation
- [ ] Add `InvalidWeight` variant to `ValidationError` enum if not present. Include the offending value.
- [ ] In project registration validation, check `weight >= 1`. If `weight == 0`, return/collect `ValidationError::InvalidWeight { got: 0 }`.
- [ ] This applies to both the `devs project add` CLI path and any programmatic registration.

## 3. Code Review
- [ ] Verify the check is applied at registration time, not deferred to scheduling.
- [ ] Verify the error message is user-facing and actionable.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- weight` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `InvalidWeight` variant referencing [2_TAS-REQ-509].

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Grep for `test_project_weight_zero_rejected` in output.
