# Task: Project Webhook Configuration Schema and Per-Project Limits (Sub-Epic: 054_Detailed Domain Specifications (Part 19))

## Covered Requirements
- [2_TAS-REQ-144], [2_TAS-REQ-145]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config (consume — ProjectEntry struct), devs-core (consume — domain types)]

## 1. Initial Test Written
- [ ] In `devs-config/tests/webhook_target_tests.rs`, write the following tests:
  - `test_webhook_target_valid_minimal`: Parse a TOML snippet with one `[[project.webhook]]` containing only required fields (`url`, `events`). Assert deserialization succeeds, `webhook_id` is system-assigned (UUID), `timeout_secs` defaults to 10, `max_retries` defaults to 3, `secret` is `None`.
  - `test_webhook_target_valid_full`: Parse a TOML snippet with all fields specified. Assert all values are correctly mapped.
  - `test_webhook_target_url_http_accepted`: URL `http://example.com/hook` passes validation.
  - `test_webhook_target_url_https_accepted`: URL `https://example.com/hook` passes validation.
  - `test_webhook_target_url_ftp_rejected`: URL `ftp://example.com/hook` fails validation with a clear error.
  - `test_webhook_target_url_too_long`: URL with 2049 characters fails validation.
  - `test_webhook_target_url_max_length`: URL with exactly 2048 characters passes validation.
  - `test_webhook_target_events_empty_rejected`: An empty `events = []` fails validation.
  - `test_webhook_target_secret_max_length`: Secret with 512 chars passes; 513 chars fails.
  - `test_webhook_target_timeout_range`: `timeout_secs = 0` fails, `1` passes, `30` passes, `31` fails.
  - `test_webhook_target_max_retries_range`: `max_retries = 11` fails, `0` passes, `10` passes.
  - `test_project_webhook_limit_16`: Parse a project with exactly 16 webhook targets — passes. Parse with 17 — fails validation with error mentioning the 16-target limit.
  - `test_project_zero_webhooks_valid`: Parse a project with no `[[project.webhook]]` entries — passes.
  - `test_webhook_id_not_user_settable`: If a user provides `webhook_id` in TOML, it is either ignored (overwritten by system UUID) or causes a validation error.

## 2. Task Implementation
- [ ] Create `devs-config/src/webhook.rs` with the `WebhookTarget` struct as specified in [2_TAS-REQ-145]:
  ```rust
  #[derive(Debug, Clone, serde::Deserialize)]
  pub struct WebhookTarget {
      #[serde(skip_deserializing, default = "Uuid::new_v4")]
      pub webhook_id:   Uuid,
      pub url:          String,
      pub events:       Vec<WebhookEvent>,
      #[serde(default)]
      pub secret:       Option<String>,
      #[serde(default = "default_timeout")]
      pub timeout_secs: u32,
      #[serde(default = "default_retries")]
      pub max_retries:  u32,
  }
  fn default_timeout() -> u32 { 10 }
  fn default_retries() -> u32 { 3 }
  ```
- [ ] Implement `WebhookTarget::validate(&self) -> Result<(), Vec<String>>` enforcing all constraints from [2_TAS-REQ-145]:
  - `url`: Must start with `http://` or `https://`, max 2048 characters.
  - `events`: Must be non-empty.
  - `secret`: If `Some`, max 512 characters.
  - `timeout_secs`: Range 1–30 inclusive.
  - `max_retries`: Range 0–10 inclusive.
- [ ] Define `WebhookEvent` enum with variants matching the project's supported events (at minimum: `RunStarted`, `RunCompleted`, `RunFailed`, `StageStarted`, `StageCompleted`, `StageFailed`, `PoolExhausted`, `StateChanged`). Implement `serde::Deserialize` using kebab-case or dot-notation strings (e.g., `"run.started"`).
- [ ] Update `ProjectEntry` in `devs-config/src/project_registry.rs` to include `webhooks: Vec<WebhookTarget>` with a `#[serde(default)]` attribute.
- [ ] In the project registry validation logic, enforce the 16-target per-project limit from [2_TAS-REQ-144]. Return a descriptive error: `"project '{}' has {} webhook targets, maximum is 16"`.
- [ ] Ensure `webhook_id` is always system-assigned via `Uuid::new_v4()` during deserialization — never from user input.

## 3. Code Review
- [ ] Verify all field constraints from [2_TAS-REQ-145] are enforced in validation (url scheme, url length, events non-empty, secret length, timeout range, retries range).
- [ ] Verify default values: `timeout_secs = 10`, `max_retries = 3`.
- [ ] Verify the 16-target limit from [2_TAS-REQ-144] is enforced during project registry loading/validation, not just at parse time.
- [ ] Verify `webhook_id` cannot be set by user TOML input.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- webhook` and confirm all 14 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookTarget` struct and its `validate()` method documenting all constraints and defaults.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm zero failures.
- [ ] Verify traceability annotations: `// Covers: 2_TAS-REQ-144` on the 16-target limit check and `// Covers: 2_TAS-REQ-145` on the `WebhookTarget` struct and validation logic.
