# Task: Define WebhookEvent Enum and WebhookPayload with 64 KiB Truncation (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-036], [2_TAS-REQ-046]

## Dependencies
- depends_on: [none]
- shared_components: [devs-webhook (owner), devs-core (consumer — uses domain types like RunId, ProjectRef)]

## 1. Initial Test Written
- [ ] Create the `devs-webhook` crate in the workspace (`crates/devs-webhook/`) with `Cargo.toml` declaring dependencies on `serde`, `serde_json`, `chrono` (with `serde` feature), and `devs-core`.
- [ ] In `crates/devs-webhook/src/event.rs`, write unit tests for the `WebhookEvent` enum:
  - [ ] Test that `WebhookEvent::RunStarted`, `RunCompleted`, `RunFailed`, `StageStarted`, `StageCompleted`, `StageFailed`, `PoolExhausted`, `StateChanged` all exist and are constructible.
  - [ ] Test that each variant serializes to a lowercase snake_case string via `serde` (e.g., `"run_started"`, `"stage_completed"`, `"pool_exhausted"`, `"state_changed"`).
  - [ ] Test that `WebhookEvent` implements `Clone`, `Debug`, `PartialEq`, `Eq`.
  - [ ] Test `WebhookEvent::event_class(&self) -> EventClass` returns the correct class: `RunLifecycle`, `StageLifecycle`, `PoolExhausted`, or `AllStateChanges`. This mapping is critical for per-project event filtering in task 04. `// Covers: 1_PRD-REQ-036`
- [ ] In `crates/devs-webhook/src/payload.rs`, write unit tests for `WebhookPayload`:
  - [ ] Test construction with all fields populated: `event` (string from enum), `timestamp` (RFC 3339), `project_id`, `run_id`, `stage_name` (Option<String>), `data` (serde_json::Value), `truncated` (bool, default false).
  - [ ] Test that `WebhookPayload::to_json_bytes()` returns valid JSON and round-trips through `serde_json::from_slice`.
  - [ ] Test that when `data` is a small JSON object (e.g., `{"status": "ok"}`), `truncated` is `false` and the full payload serializes correctly.
  - [ ] Test that when `data` is a large string (e.g., 100 KiB of 'x'), the output of `to_json_bytes()` is <= 65536 bytes, the `data` field is truncated, and `truncated` is set to `true`. `// Covers: 2_TAS-REQ-046`
  - [ ] Test that when `data` is a large nested JSON object exceeding 64 KiB, truncation replaces `data` with a JSON string `"[truncated]"` and sets `truncated: true`.
  - [ ] Test that a payload where all fields except `data` already approach 64 KiB still produces valid JSON (edge case: `data` becomes `"[truncated]"`).
  - [ ] Test that `stage_name` being `None` serializes as `null` in the JSON output.
  - [ ] Test that `timestamp` is always a valid RFC 3339 string (use `chrono::DateTime::parse_from_rfc3339` to validate).

## 2. Task Implementation
- [ ] Create `crates/devs-webhook/Cargo.toml` with:
  ```toml
  [package]
  name = "devs-webhook"
  version = "0.1.0"
  edition = "2021"

  [dependencies]
  devs-core = { path = "../devs-core" }
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  chrono = { version = "0.4", features = ["serde"] }

  [dev-dependencies]
  ```
- [ ] Add `devs-webhook` to the workspace `Cargo.toml` members list.
- [ ] Implement `WebhookEvent` enum in `crates/devs-webhook/src/event.rs`:
  - Variants: `RunStarted`, `RunCompleted`, `RunFailed`, `StageStarted`, `StageCompleted`, `StageFailed`, `PoolExhausted`, `StateChanged`.
  - Derive `Clone`, `Debug`, `PartialEq`, `Eq`, `serde::Serialize`, `serde::Deserialize`.
  - Use `#[serde(rename_all = "snake_case")]`.
  - Implement `EventClass` enum (`RunLifecycle`, `StageLifecycle`, `PoolExhausted`, `AllStateChanges`) and `WebhookEvent::event_class(&self) -> EventClass`.
- [ ] Implement `WebhookPayload` struct in `crates/devs-webhook/src/payload.rs`:
  - Fields: `event: String`, `timestamp: String`, `project_id: String`, `run_id: String`, `stage_name: Option<String>`, `data: serde_json::Value`, `truncated: bool`.
  - Derive `Clone`, `Debug`, `serde::Serialize`, `serde::Deserialize`.
  - Constructor `WebhookPayload::new(event: &WebhookEvent, project_id: &str, run_id: &str, stage_name: Option<&str>, data: serde_json::Value) -> Self` that sets `timestamp` to `Utc::now().to_rfc3339()` and `truncated` to `false`.
  - Method `to_json_bytes(&self) -> Vec<u8>` that:
    1. Serializes self to JSON bytes.
    2. If length > 65536, clones self with `data` replaced by `Value::String("[truncated]".into())` and `truncated` set to `true`, then re-serializes.
    3. Returns the (possibly truncated) bytes.
- [ ] Create `crates/devs-webhook/src/lib.rs` that publicly exports `event` and `payload` modules.

## 3. Code Review
- [ ] Verify no `unwrap()` or `expect()` in non-test code — all serialization errors must be handled with `Result`.
- [ ] Verify `WebhookPayload` does not expose any `devs-proto` wire types (boundary enforcement per shared components manifest).
- [ ] Verify `EventClass` mapping covers all four classes from [1_PRD-REQ-036]: run lifecycle, stage lifecycle, pool exhaustion, all state changes.
- [ ] Verify truncation logic is deterministic — same input always produces same output.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookEvent`, `EventClass`, `WebhookPayload`, and `to_json_bytes()` explaining the 64 KiB truncation policy and event class taxonomy.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-036' crates/devs-webhook/` and verify at least one match in event.rs.
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-046' crates/devs-webhook/` and verify at least one match in payload.rs.
- [ ] Run `cargo test -p devs-webhook -- --nocapture 2>&1 | tail -1` and verify output contains `test result: ok`.
