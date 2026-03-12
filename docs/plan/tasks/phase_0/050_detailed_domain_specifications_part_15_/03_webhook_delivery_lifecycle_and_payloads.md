# Task: Define Webhook Delivery Lifecycle and Event Payloads (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-123], [2_TAS-REQ-124]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-webhook]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-webhook/src/payload.rs` (if not exists) for all webhook event payloads.
- [ ] Write tests verifying the serialization of each event type: `run.started`, `run.completed`, `run.failed`, `run.cancelled`, `stage.started`, `stage.completed`, `stage.failed`, `stage.timed_out`, `pool.exhausted`, `state.changed`.
- [ ] Write a test verifying the 64 KiB payload size limit and the truncation behavior of the `data` field.
- [ ] Write a test verifying the webhook delivery lifecycle (check project, check subscription, serialize, truncate, POST).

## 2. Task Implementation
- [ ] Define the `WebhookEvent` enum and payload structs in `crates/devs-webhook/src/payload.rs` corresponding to all events in [2_TAS-REQ-124].
- [ ] Implement the `WebhookDispatcher` lifecycle as specified in [2_TAS-REQ-123]:
    - Verify that the project has webhook targets.
    - Confirm that the event type is subscribed to.
    - Serialize the payload to JSON.
    - Implement payload size enforcement: if > 64 KiB, truncate the `data` field and set `"truncated": true`.
    - Perform an HTTP POST to the target URL with a 10s timeout using `reqwest`.
    - Log INFO on 2xx response, WARN and schedule retry on non-2xx response.

## 3. Code Review
- [ ] Verify that all 10 event types are correctly implemented with their specific payload fields according to [2_TAS-REQ-124].
- [ ] Ensure that payload truncation logic is correct and respects the 64 KiB limit.
- [ ] Confirm that `reqwest` uses the `rustls-tls` backend as required by [2_TAS-REQ-006].
- [ ] Ensure that delivery failures log at `WARN` level and do not impact the scheduler's operation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` to ensure all payload serialization and delivery lifecycle tests pass.

## 5. Update Documentation
- [ ] Document all `WebhookEvent` variants and their corresponding JSON payload schemas in the `devs-webhook` module documentation.
- [ ] Add doc comments explaining the delivery lifecycle and the 64 KiB truncation policy.

## 6. Automated Verification
- [ ] Run `./do lint` to verify doc comments and formatting.
- [ ] Run `cargo clippy -p devs-webhook` to ensure code quality.
