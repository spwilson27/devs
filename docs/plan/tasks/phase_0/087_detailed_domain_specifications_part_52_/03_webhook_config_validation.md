# Task: Implement Webhook Configuration Validation (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-512], [2_TAS-REQ-513]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-config/src/validation/webhook.rs` (or equivalent) that:
    - Verifies that a project with 17 webhook targets is rejected with `ValidationError::ValueOutOfRange` or a specific webhook target limit error.
    - Verifies that a `WebhookTarget` with an empty `events` array is rejected with `ValidationError::EmptyCollection`.
    - Verifies that `devs project webhook add` implementation (if reachable in Phase 0) returns exit code 4 and the message: `"project '<name>' already has 16 webhook targets (maximum)"` when adding to a project that already has 16 targets.
    - Verifies that server startup fails with a diagnostic if any registered project has a webhook with `events = []`.

## 2. Task Implementation
- [ ] Update `WebhookTarget` struct in `devs-config` to include validation logic for the `events` field.
- [ ] Update `ProjectConfig` validation in `devs-config` to count the number of webhook targets and reject if `> 16`.
- [ ] Ensure that `ValidationError` in `devs-core` includes variants for `ValueOutOfRange` and `EmptyCollection`.
- [ ] Add the specific error message `"project '<name>' already has 16 webhook targets (maximum)"` to the validation result when the limit is reached.
- [ ] Implement a check in the server startup sequence (e.g., in `devs-server` or `devs-config`) that calls this validation and aborts with a diagnostic to stderr if `events = []` is found.

## 3. Code Review
- [ ] Verify that validation is performed in a single pass and returns all errors via `Vec<ValidationError>`.
- [ ] Ensure that the limit (16) is a named constant, not a magic number.
- [ ] Check that the error messages match the requirements exactly.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test --package devs-config` and ensure all webhook validation tests pass.

## 5. Update Documentation
- [ ] Update `devs-config` internal documentation to reflect the webhook limit and non-empty events constraint.

## 6. Automated Verification
- [ ] Run `cargo test` and verify that the test results confirm rejection of invalid webhook configurations.
- [ ] Verify traceability annotations are present: `/// Verifies [2_TAS-REQ-512], [2_TAS-REQ-513]`.
