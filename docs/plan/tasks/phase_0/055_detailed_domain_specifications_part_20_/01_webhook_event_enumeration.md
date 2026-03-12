# Task: Webhook Event Enumeration and Leaf Mapping (Sub-Epic: 055_Detailed Domain Specifications (Part 20))

## Covered Requirements
- [2_TAS-REQ-146]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/webhook.rs`, create a unit test `test_webhook_event_serialization` that:
    - Asserts that each concrete `WebhookEvent` variant serializes to its leaf string (e.g., `WebhookEvent::RunStarted` -> `"run.started"`).
    - Verifies that `WebhookEvent::StateChanged` is not a serializable leaf but a subscriber filter.
    - Asserts that all variants specified in **[2_TAS-REQ-146]** are present: `run.started`, `run.completed`, `run.failed`, `run.cancelled`, `stage.started`, `stage.completed`, `stage.failed`, `stage.timed_out`, `pool.exhausted`, and `state.changed`.

## 2. Task Implementation
- [ ] In `devs-core/src/webhook.rs`, define the `WebhookEvent` enumeration:
    ```rust
    pub enum WebhookEvent {
        RunStarted,
        RunCompleted,
        RunFailed,
        RunCancelled,
        StageStarted,
        StageCompleted,
        StageFailed,
        StageTimedOut,
        PoolExhausted,
        StateChanged,
    }
    ```
- [ ] Implement `serde::Serialize` and `serde::Deserialize` for `WebhookEvent` to match the lowercase dot-notated strings (e.g., `"run.started"`).
- [ ] Implement a helper method `WebhookEvent::as_leaf_str(&self) -> Option<&'static str>` that returns the concrete event string for leaf events and `None` for `StateChanged`.
- [ ] Implement a logic for the dispatcher (to be used later) to determine if a triggered event matches a target's subscription (including the `StateChanged` superset rule).

## 3. Code Review
- [ ] Ensure that `StateChanged` is handled as a superset and never appears as the concrete event string in the `event` field of a payload.
- [ ] Verify that all 10 event variants from the requirement are correctly implemented.
- [ ] Check that serialization is consistent with the TAS requirement for dot-notated lowercase strings.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Verify that all serialization and matching tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookEvent` variants explaining their trigger conditions from the TAS table.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-146]` in `devs-core/src/webhook.rs`.
