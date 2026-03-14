# Task: Webhook HTTP POST Delivery Envelope (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086F]

## Dependencies
- depends_on: ["01_protocol_state_machines.md"]
- shared_components: [devs-core (consumes state types), devs-webhook (owner of delivery types — Phase 0 defines types only; Phase 2 implements dispatcher)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/webhook_types.rs` (or `crates/devs-webhook/src/types.rs` if the crate exists) with a test submodule.
- [ ] **Envelope serialization**: Write a test that constructs a `WebhookPayload` for each event type and serializes to JSON, asserting the output matches the normative schema:
  - Required envelope fields: `event` (string), `timestamp` (ISO8601), `delivery_id` (UUID), `project_id` (UUID), `run_id` (UUID), `stage_name` (string or null), `data` (object), `truncated` (bool).
  - Test `run.started` data schema: `{ "workflow_name": "string", "slug": "string", "input_count": N }`.
  - Test `run.completed` data schema: `{ "elapsed_ms": N, "stage_count": N }`.
  - Test `run.failed` data schema: `{ "failed_stage": "string", "error": "string", "elapsed_ms": N }`.
  - Test `run.cancelled` data schema: `{ "elapsed_ms": N }`.
  - Test `stage.started` data schema: `{ "attempt": N, "agent_tool": "string", "pool_name": "string" }`.
  - Test `stage.completed` data schema: `{ "attempt": N, "elapsed_ms": N, "exit_code": N }`.
  - Test `stage.failed` data schema: `{ "attempt": N, "exit_code": integer|null, "error": "string" }`.
  - Test `stage.timed_out` data schema: `{ "attempt": N, "timeout_secs": N, "elapsed_ms": N }`.
  - Test `pool.exhausted` data schema: `{ "pool_name": "string", "queued_count": N }`.
  - Test `state.changed` data schema: `{ "entity": "run|stage", "stage_name": "string|null", "from": "string", "to": "string" }`.
- [ ] **Null stage_name for run-level events**: Test that `stage_name` is serialized as JSON `null` for `run.*` and `pool.*` events.
- [ ] **Header construction**: Write a test for `WebhookHeaders::new(event_type, delivery_id, server_version)` producing:
  - `Content-Type: application/json; charset=utf-8`
  - `X-Devs-Event: <event_type>`
  - `X-Devs-Delivery: <uuid>`
  - `X-Devs-Version: <major.minor.patch>`
  - `User-Agent: devs/<version>`
- [ ] **Truncation logic**: Write a test that constructs a payload exceeding 64 KiB by setting a large `data.error` string. Assert:
  - The serialized payload is <= 65536 bytes after truncation.
  - `truncated` is set to `true`.
  - Envelope fields (`event`, `timestamp`, `run_id`, etc.) are NOT modified.
  - The `data.error` field is character-truncated (not byte-truncated, to avoid splitting multi-byte UTF-8).
- [ ] **Delivery constraint constants**: Test that `WEBHOOK_TIMEOUT_SECS == 10`, `WEBHOOK_MAX_RETRIES == 10`, `WEBHOOK_RETRY_BACKOFF_SECS == 5`, `WEBHOOK_MAX_PAYLOAD_BYTES == 65536`.
- [ ] Annotate every test with `// Covers: 2_TAS-REQ-086F`.

## 2. Task Implementation
- [ ] Define `WebhookEvent` enum with variants: `RunStarted`, `RunCompleted`, `RunFailed`, `RunCancelled`, `StageStarted`, `StageCompleted`, `StageFailed`, `StageTimedOut`, `PoolExhausted`, `StateChanged`.
- [ ] Implement `WebhookEvent::event_type_str(&self) -> &str` returning the dot-notation string (e.g., `"run.started"`).
- [ ] Define `WebhookPayload` struct with fields: `event`, `timestamp`, `delivery_id`, `project_id`, `run_id`, `stage_name` (Option<String>), `data` (serde_json::Value), `truncated` (bool).
- [ ] Derive `Serialize` and `Deserialize` on `WebhookPayload`. Use `#[serde(serialize_with = ...)]` or custom impl to ensure `stage_name: null` when None (not omitted).
- [ ] Define typed data structs for each event (e.g., `RunStartedData`, `StageFailedData`) deriving `Serialize`.
- [ ] Implement `WebhookPayload::new(event, project_id, run_id, stage_name, data) -> Self` that sets `timestamp` to `Utc::now()`, generates `delivery_id` as UUID v4, and sets `truncated = false`.
- [ ] Implement `WebhookPayload::enforce_size_limit(&mut self)` that serializes to JSON, checks against 65536 bytes, and truncates the largest string field in `data` character-by-character until it fits, setting `truncated = true`.
- [ ] Define `WebhookHeaders` struct and constructor that produces the 5 required headers.
- [ ] Define delivery constraint constants: `WEBHOOK_TIMEOUT_SECS`, `WEBHOOK_MAX_RETRIES`, `WEBHOOK_RETRY_BACKOFF_SECS`, `WEBHOOK_MAX_PAYLOAD_BYTES`.

## 3. Code Review
- [ ] Verify `stage_name` is serialized as JSON `null` (not omitted) when `None`, per [2_TAS-REQ-086J] optional field rules.
- [ ] Verify truncation logic operates on characters, not bytes, to avoid corrupting UTF-8.
- [ ] Verify no HMAC signature header is included (post-MVP per spec).
- [ ] Verify no HTTP client (`reqwest`) dependency in this task — types and serialization only; actual HTTP dispatch is Phase 2.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- webhook` (or `cargo test -p devs-webhook -- types`) and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookPayload`, `WebhookEvent`, `WebhookHeaders`, and all data structs referencing [2_TAS-REQ-086F].

## 6. Automated Verification
- [ ] Run `./do lint` to ensure clippy, formatting, and doc comment standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086F] to the new tests.
