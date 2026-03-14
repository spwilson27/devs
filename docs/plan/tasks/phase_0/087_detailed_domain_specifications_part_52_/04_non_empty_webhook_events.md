# Task: Non-Empty Webhook Events Validation (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-513]

## Dependencies
- depends_on: none
- shared_components: [devs-config, devs-webhook]

## 1. Initial Test Written
- [ ] In the webhook validation module, create test module `tests::non_empty_webhook_events`:
  - `test_webhook_add_empty_events_rejected`: attempt `devs project webhook add` with `events = []`. Assert rejection with exit code 4.
  - `test_webhook_add_with_events_accepted`: attempt `devs project webhook add` with `events = ["run.completed"]`. Assert success.
  - `test_server_startup_rejects_empty_events_in_config`: create a server config TOML with a webhook target that has `events = []`. Call the config validation function. Assert it returns an error diagnostic mentioning the empty events array.
  - `test_server_startup_error_message_to_stderr`: validate that the error from empty events includes a human-readable diagnostic string suitable for stderr output (e.g., contains the webhook URL and `"events must not be empty"`).
  - `test_config_with_valid_events_passes`: create a server config TOML with a webhook target that has `events = ["run.started", "stage.failed"]`. Assert config validation passes.
- [ ] Add `// Covers: 2_TAS-REQ-513` annotation to all test functions.

## 2. Task Implementation
- [ ] In the CLI webhook-add handler, validate that the `events` list is non-empty before persisting. If empty, return exit code 4 with a diagnostic message.
- [ ] In `devs-config` server config validation (`validate()` method), check every webhook target's `events` array. If any is empty, add a `ConfigError` that identifies the offending webhook target (by URL or index) and states events must not be empty.
- [ ] Server startup must call `validate()` and abort (with stderr diagnostic) if any webhook target has empty events.

## 3. Code Review
- [ ] Verify both validation paths exist: CLI-time (exit code 4) and server-startup-time (abort with stderr).
- [ ] Confirm the config validation collects all errors (not just the first) per the single-pass validation pattern.
- [ ] Ensure the error messages are actionable — they identify which webhook target is misconfigured.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- non_empty_webhook_events` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the webhook events validation noting both enforcement points (CLI and startup).

## 6. Automated Verification
- [ ] Run `cargo test -- non_empty_webhook_events --no-fail-fast 2>&1 | tail -20` and verify exit code 0.
