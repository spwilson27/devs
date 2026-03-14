# Task: Webhook Event Types and Payload Definitions (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-124]

## Dependencies
- depends_on: []
- shared_components: ["devs-webhook (Consumer)", "devs-core (Consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-webhook/tests/event_types.rs` with the following tests:
- [ ] `test_run_started_event_payload`: Construct a `WebhookEvent::RunStarted` with `workflow_name: "deploy"` and `slug: "deploy-abc123"`. Serialize to JSON. Assert output matches `{ "workflow_name": "deploy", "slug": "deploy-abc123" }`.
- [ ] `test_run_completed_event_payload`: Construct `RunCompleted` with `elapsed_ms: 5000`. Serialize. Assert `{ "elapsed_ms": 5000 }`.
- [ ] `test_run_failed_event_payload`: Construct `RunFailed` with `failed_stage: "build"`, `error: "exit code 1"`. Serialize. Assert `{ "failed_stage": "build", "error": "exit code 1" }`.
- [ ] `test_run_cancelled_event_payload`: Construct `RunCancelled`. Serialize. Assert `{}`.
- [ ] `test_stage_started_event_payload`: Construct `StageStarted` with `attempt: 1`, `agent_tool: "claude"`, `pool_name: "primary"`. Serialize. Assert exact fields.
- [ ] `test_stage_completed_event_payload`: Construct `StageCompleted` with `attempt: 2`, `elapsed_ms: 3000`, `exit_code: 0`. Serialize. Assert exact fields.
- [ ] `test_stage_failed_event_payload`: Construct `StageFailed` with `attempt: 1`, `exit_code: 1`, `error: "timeout"`. Serialize. Assert exact fields.
- [ ] `test_stage_timed_out_event_payload`: Construct `StageTimedOut` with `attempt: 1`, `timeout_secs: 300`. Serialize. Assert exact fields.
- [ ] `test_pool_exhausted_event_payload`: Construct `PoolExhausted` with `pool_name: "primary"`. Serialize. Assert `{ "pool_name": "primary" }`.
- [ ] `test_state_changed_event_payload`: Construct `StateChanged` with `entity: "run"`, `from: "running"`, `to: "completed"`. Serialize. Assert exact fields.
- [ ] `test_all_event_types_are_exhaustive`: Use a match on `WebhookEvent` to ensure all 10 variants are covered (compile-time exhaustiveness check).
- [ ] `test_event_type_string_representation`: Assert each variant serializes its event type field as the dotted string (e.g., `"run.started"`, `"stage.completed"`, `"pool.exhausted"`, `"state.changed"`).

## 2. Task Implementation
- [ ] In `crates/devs-webhook/src/event.rs`, define the `WebhookEvent` enum with exactly 10 variants:
  ```rust
  pub enum WebhookEvent {
      RunStarted { workflow_name: String, slug: String },
      RunCompleted { elapsed_ms: u64 },
      RunFailed { failed_stage: String, error: String },
      RunCancelled,
      StageStarted { attempt: u32, agent_tool: String, pool_name: String },
      StageCompleted { attempt: u32, elapsed_ms: u64, exit_code: i32 },
      StageFailed { attempt: u32, exit_code: i32, error: String },
      StageTimedOut { attempt: u32, timeout_secs: u64 },
      PoolExhausted { pool_name: String },
      StateChanged { entity: String, from: String, to: String },
  }
  ```
- [ ] Implement `serde::Serialize` for `WebhookEvent` so that the data payload matches the exact JSON shapes from the requirement.
- [ ] Implement an `event_type(&self) -> &'static str` method returning the dotted string representation (e.g., `"run.started"`).
- [ ] Define a `WebhookEnvelope` struct wrapping each event for delivery:
  ```rust
  pub struct WebhookEnvelope {
      pub event_type: String,
      pub timestamp: String, // RFC 3339
      pub run_id: String,
      pub project: String,
      pub data: serde_json::Value,
      pub truncated: bool,
  }
  ```

## 3. Code Review
- [ ] Verify all 10 event types from the requirement are present — no extras, no missing.
- [ ] Verify JSON payload field names exactly match the requirement (snake_case, correct spelling).
- [ ] Verify `RunCancelled` serializes to empty object `{}`.
- [ ] Verify `entity` field in `StateChanged` is constrained to `"run"` or `"stage"`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook --test event_types` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookEvent` enum and each variant referencing `[2_TAS-REQ-124]`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-webhook --test event_types 2>&1 | tail -1` and verify output shows `test result: ok`.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings` and verify zero warnings.
