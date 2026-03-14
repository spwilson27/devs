# Task: Max Webhook Target Limit Per Project (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-512]

## Dependencies
- depends_on: none
- shared_components: [devs-config, devs-webhook]

## 1. Initial Test Written
- [ ] In the crate responsible for project webhook management (likely `devs-config` or a CLI handler module), create test module `tests::max_webhook_limit`:
  - `test_add_webhook_at_limit_rejected`: configure a project with exactly 16 webhook targets. Attempt to add a 17th. Assert the operation fails with an error message containing `"already has 16 webhook targets (maximum)"` and that the error maps to exit code 4.
  - `test_add_webhook_below_limit_accepted`: configure a project with 15 webhook targets. Add a 16th. Assert success.
  - `test_add_webhook_to_empty_project`: configure a project with 0 webhook targets. Add one. Assert success.
  - `test_error_message_includes_project_name`: configure project `"my-project"` with 16 targets. Attempt to add another. Assert the error message contains `"project 'my-project'"`.
- [ ] Add `// Covers: 2_TAS-REQ-512` annotation to all test functions.

## 2. Task Implementation
- [ ] In the webhook-add validation logic (invoked by `devs project webhook add`), add a check before inserting:
  - Count existing webhook targets for the specified project.
  - If count >= 16, return an error with message: `"project '<name>' already has 16 webhook targets (maximum)"`.
  - The CLI handler must map this error to exit code 4.
- [ ] Define the constant `MAX_WEBHOOK_TARGETS_PER_PROJECT: usize = 16` in the appropriate location (e.g., `devs-config` or `devs-webhook`).

## 3. Code Review
- [ ] Verify the error message format exactly matches the requirement: `"project '<name>' already has 16 webhook targets (maximum)"`.
- [ ] Confirm exit code 4 is used (not a generic error code).
- [ ] Ensure the limit is checked atomically — no TOCTOU race if multiple adds happen concurrently.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- max_webhook_limit` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the constant `MAX_WEBHOOK_TARGETS_PER_PROJECT` referencing the requirement.

## 6. Automated Verification
- [ ] Run `cargo test -- max_webhook_limit --no-fail-fast 2>&1 | tail -20` and verify exit code 0.
