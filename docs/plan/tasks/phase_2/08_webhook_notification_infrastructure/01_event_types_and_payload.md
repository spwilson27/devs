# Task: devs-webhook: Event Types and Payload Serialization (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-036], [2_TAS-REQ-046]

## Dependencies
- depends_on: [none]
- shared_components: [devs-webhook]

## 1. Initial Test Written
- [ ] Write unit tests in `devs-webhook/src/payload.rs` verifying the serialization of `WebhookPayload`.
- [ ] Verify that when the total serialized payload size (JSON) exceeds 64 KiB, the `data` field is truncated and `"truncated": true` is set.
- [ ] Test with varied data sizes to ensure the truncation occurs precisely at the 64 KiB boundary including all JSON overhead.
- [ ] Verify that unpopulated optional fields are serialized as JSON `null`.

## 2. Task Implementation
- [ ] In `devs-webhook/src/types.rs`, define the `WebhookEvent` enum covering:
  - `RunLifecycle` (Started, Completed, Failed)
  - `StageLifecycle` (Started, Completed, Failed)
  - `PoolExhausted`
  - `StateChange` (Generic internal transition)
- [ ] In `devs-webhook/src/payload.rs`, implement the `WebhookPayload` struct according to the schema in [2_TAS-REQ-046]:
  - `event`: String (from enum)
  - `timestamp`: RFC 3339 string (via `chrono`)
  - `project_id`: String
  - `run_id`: String
  - `stage_name`: Optional String
  - `data`: `serde_json::Value` (The event-specific data)
  - `truncated`: Boolean
- [ ] Implement a custom `Serialize` or a wrapping method for `WebhookPayload` that enforces the 64 KiB maximum size:
  - Serialize the payload with full data.
  - If length > 65536 bytes, calculate the allowable space for the `data` field after accounting for other fields' JSON structure.
  - Truncate the `data` field (if it is a string or large object) and set `truncated: true`.

## 3. Code Review
- [ ] Ensure `WebhookPayload` uses `serde` for serialization.
- [ ] Verify the truncation logic is efficient and handles edge cases where even with empty `data` the payload might be large (though unlikely given the schema).
- [ ] Ensure `chrono` is used correctly with the `serde` feature for RFC 3339.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` to verify payload serialization and truncation.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookPayload` and `WebhookEvent` explaining the schema and truncation policy.

## 6. Automated Verification
- [ ] Verify that `devs-webhook/src/payload.rs` contains `// Covers: 2_TAS-REQ-046`.
- [ ] Verify that `devs-webhook/src/types.rs` contains `// Covers: 1_PRD-REQ-036`.
