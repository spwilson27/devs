# Task: Webhook Configuration Validation (Sub-Epic: 088_Detailed Domain Specifications (Part 53))

## Covered Requirements
- [2_TAS-REQ-517]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] In `devs-config/src/project.rs` (or equivalent), create unit tests for `WebhookConfig::validate()`.
- [ ] Test cases must include:
    - Invalid URL scheme (e.g., `ftp://...`, `javascript:...`). Only `http` and `https` should be allowed.
    - Unknown event strings (e.g., `run.started` is valid, `foo.bar` is not).
    - Empty `events` list.
    - `timeout_secs` out of range (e.g., 0 or > 3600).
    - `max_retries` out of range (e.g., > 10).
- [ ] Create an integration test in `devs-server` that attempts to start the server with an invalid `projects.toml` and asserts that it exits non-zero, prints errors to stderr, and binds no ports.

## 2. Task Implementation
- [ ] Define the `WebhookConfig` struct in `devs-config` with fields for `url`, `events`, `timeout_secs`, and `max_retries`.
- [ ] Implement a `validate()` method for `WebhookConfig`.
- [ ] Update the `ProjectConfig` (or equivalent) in `devs-config` to include a list of `WebhookConfig`.
- [ ] Implement the top-level validation logic that runs at server startup in `devs-server/src/main.rs`.
- [ ] Ensure all validation errors are collected and printed to stderr before the process exits.

## 3. Code Review
- [ ] Verify that validation happens *before* any network ports are bound.
- [ ] Ensure the error messages are clear and identify which project and which webhook entry caused the failure.
- [ ] Check that the `events` validation uses a canonical set of supported event strings.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` to verify unit tests.
- [ ] Run the server integration test.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record the implementation of webhook configuration validation.

## 6. Automated Verification
- [ ] Verify that `./do test` passes and `target/traceability.json` shows [2_TAS-REQ-517] as covered.
