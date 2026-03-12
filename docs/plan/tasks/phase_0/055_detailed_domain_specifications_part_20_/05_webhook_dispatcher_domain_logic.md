# Task: Webhook Dispatcher Domain Logic and Limits (Sub-Epic: 055_Detailed Domain Specifications (Part 20))

## Covered Requirements
- [2_TAS-REQ-150]

## Dependencies
- depends_on: [01_webhook_event_enumeration.md, 04_webhook_delivery_retry_logic.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/webhook/dispatcher.rs`, create a unit test `test_webhook_queue_limits` that:
    - Asserts that when the dispatcher's queue exceeds 1024 pending notifications, any new event is dropped.
    - Verifies that a `WARN` is logged for each dropped event as per **[2_TAS-REQ-150]**.
    - Asserts that multiple notifications are fanned out to all matching targets for the project.
    - Verifies that deliveries to different targets are isolated and do not block each other (use a mock to simulate slow deliveries).

## 2. Task Implementation
- [ ] In `devs-core/src/webhook/dispatcher.rs`, define the `WebhookNotification` type:
    ```rust
    pub struct WebhookNotification {
        pub project_id: Uuid,
        pub event: WebhookEvent,
        pub payload: WebhookPayload,
    }
    ```
- [ ] Define a `WebhookDispatcher` trait or interface that the scheduler will use to post notifications.
- [ ] Implement the queue management logic:
    - Track the current number of pending notifications.
    - Enforce the 1024-limit on the internal queue.
    - Use a `tokio::sync::mpsc::UnboundedSender` for the communication channel between the scheduler and the dispatcher task.
- [ ] Implement the fan-out logic that iterates over project webhook targets and spawns a new Tokio task for each delivery as specified in **[2_TAS-REQ-150]**.
- [ ] Ensure the dispatcher is in-memory only and does not persist pending deliveries across restarts.

## 3. Code Review
- [ ] Verify that the 1024-notification limit is correctly enforced at runtime to prevent unbounded memory growth.
- [ ] Check that each delivery is performed in a separate spawned task to ensure non-blocking behavior.
- [ ] Confirm that `StateChanged` subscription matching correctly fans out to subscribers.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Specifically test the dispatcher behavior under high load (filling the 1024-queue).

## 5. Update Documentation
- [ ] Add doc comments explaining the dispatcher's queue limit and threading model as per the TAS.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-150]` in `devs-core/src/webhook/dispatcher.rs`.
