# Task: Project and Webhook Validation (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-475], [2_TAS-REQ-476]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/validation/tests.rs` (or equivalent), create unit tests for `Project` weight validation.
- [ ] Test that a `Project` with `weight = 1` is valid.
- [ ] Test that a `Project` with `weight = 0` is rejected with `ValidationError::InvalidWeight`.
- [ ] In `crates/devs-core/src/validation/tests.rs`, create unit tests for `WebhookTarget` URL validation.
- [ ] Test that `https://example.com/hook` and `http://example.com/hook` are valid.
- [ ] Test that `ftp://example.com/hook` and `file:///tmp/hook` are rejected with `ValidationError::InvalidWebhookUrl`.
- [ ] In `crates/devs-config/src/parsing/tests.rs`, verify that `projects.toml` parsing rejects `weight = 0` or invalid URL schemes.

## 2. Task Implementation
- [ ] Define `ValidationError::InvalidWeight` and `ValidationError::InvalidWebhookUrl` in `crates/devs-core/src/error.rs`.
- [ ] Implement validation logic for `Project::validate()` in `crates/devs-core/src/models/project.rs`.
- [ ] Implement validation logic for `WebhookTarget::validate()` in `crates/devs-core/src/models/webhook.rs`.
- [ ] Update `crates/devs-config/src/project_registry.rs` to call `validate()` on each project entry after parsing and before adding to the registry.
- [ ] Ensure that `ValidationError::InvalidWeight` and `ValidationError::InvalidWebhookUrl` are correctly propagated.

## 3. Code Review
- [ ] Verify that `Project.weight` is a `u32` (or the type specified in the domain spec) and the validation is strictly `>= 1`.
- [ ] Verify that the `WebhookTarget.url` scheme check is case-insensitive (prefer `http` or `https`).
- [ ] Ensure that `ValidationError` follows the established pattern in `devs-core` for collecting multiple errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and `cargo test -p devs-config` to verify the new validation logic.

## 5. Update Documentation
- [ ] Update internal developer documentation regarding the `Project` and `WebhookTarget` validation rules.

## 6. Automated Verification
- [ ] Execute `./do lint` to ensure that doc comments and code quality standards are met.
- [ ] Execute `./do test` to ensure that the new tests are integrated and traceability is maintained.
