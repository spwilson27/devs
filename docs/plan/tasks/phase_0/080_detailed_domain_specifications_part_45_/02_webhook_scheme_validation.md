# Task: Webhook URL Scheme Validation (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-476]

## Dependencies
- depends_on: []
- shared_components: ["devs-config"]

## 1. Initial Test Written
- [ ] In the config validation module, create test module `tests::webhook_scheme_validation`
- [ ] Write test `test_webhook_https_accepted`: create a `WebhookTarget` with `url = "https://example.com/hook"`, validate it, assert success.
- [ ] Write test `test_webhook_http_accepted`: create a `WebhookTarget` with `url = "http://localhost:9000/hook"`, validate it, assert success.
- [ ] Write test `test_webhook_ftp_rejected`: create a `WebhookTarget` with `url = "ftp://example.com/hook"`, validate it, assert `Err(ValidationError::InvalidWebhookUrl)`.
- [ ] Write test `test_webhook_file_rejected`: create a `WebhookTarget` with `url = "file:///etc/passwd"`, validate it, assert `Err(ValidationError::InvalidWebhookUrl)`.
- [ ] Write test `test_webhook_no_scheme_rejected`: create a `WebhookTarget` with `url = "example.com/hook"` (no scheme), validate it, assert `Err(ValidationError::InvalidWebhookUrl)`.
- [ ] Write test `test_webhook_empty_url_rejected`: empty string URL, assert `Err(ValidationError::InvalidWebhookUrl)`.

## 2. Task Implementation
- [ ] Add `InvalidWebhookUrl` variant to `ValidationError` enum with a `url: String` field for diagnostics.
- [ ] In the `WebhookTarget` validation function, parse the URL (using `url::Url::parse` or equivalent), extract the scheme, and reject any scheme that is not `"http"` or `"https"`.
- [ ] Handle parse failures (malformed URLs, missing scheme) by returning `InvalidWebhookUrl`.
- [ ] If the `url` crate is not already a dependency, add it to the relevant crate's `Cargo.toml`.

## 3. Code Review
- [ ] Verify the scheme check is case-insensitive (URL crate normalizes to lowercase, but confirm).
- [ ] Verify this validation runs during config load / webhook target registration, not at delivery time.
- [ ] Confirm the error variant is specific (`InvalidWebhookUrl`), not a generic validation error.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config webhook_scheme` (adjust crate name) and confirm all new tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-476` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config webhook_scheme -- --nocapture` and verify zero failures. Grep for `2_TAS-REQ-476` traceability.
