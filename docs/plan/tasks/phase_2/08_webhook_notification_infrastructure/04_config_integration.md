# Task: devs-webhook: Project Configuration and Event Routing (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-037], [1_PRD-REQ-036]

## Dependencies
- depends_on: [03_retry_strategy.md]
- shared_components: [devs-webhook, devs-config, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `devs-webhook/tests/config_integration_tests.rs` to verify that the `WebhookDispatcher` can be initialized from a `ServerConfig`.
- [ ] Verify that events from Project A are only sent to Project A's configured webhooks and not Project B's [1_PRD-REQ-037].
- [ ] Verify that only events matching a project's subscribed event classes are dispatched [1_PRD-REQ-037].
- [ ] Verify that a `PoolExhausted` event is correctly routed based on the server-level default or project-specific subscriptions [1_PRD-REQ-036].

## 2. Task Implementation
- [ ] In `devs-webhook/src/lib.rs`, implement a high-level `WebhookService` that acts as the entry point for the rest of the server.
- [ ] Implement a `new(config: &ServerConfig)` method for `WebhookService` that initializes one or more `WebhookDispatcher` instances based on the project registry and server configuration.
- [ ] Implement a `dispatch(&self, project_id: &str, event: WebhookEvent, data: serde_json::Value)` method that:
  - Looks up the configured webhooks for the specified `project_id`.
  - Checks if each webhook is subscribed to the class of the provided `event`.
  - Forwards the event to the appropriate target workers.
- [ ] Ensure the service supports the following event classes as defined in [1_PRD-REQ-036]:
  - `RunLifecycle`: `RunStarted`, `RunCompleted`, `RunFailed`
  - `StageLifecycle`: `StageStarted`, `StageCompleted`, `StageFailed`
  - `PoolExhausted`: All agents in a pool are unavailable.
  - `StateChange`: Every internal state transition.
- [ ] Ensure that `WebhookService` is thread-safe (e.g., using `Arc`) so it can be shared across the scheduler and server tasks.

## 3. Code Review
- [ ] Verify that project IDs are correctly handled and used for routing.
- [ ] Check that invalid configuration (e.g., malformed URL) is handled gracefully during initialization (e.g., logged and ignored, or reported as a startup error).
- [ ] Ensure the mapping from event class (in config) to `WebhookEvent` variants is correct.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` to verify configuration and routing logic.

## 5. Update Documentation
- [ ] Update documentation to provide an example of `devs.toml` webhook configuration.

## 6. Automated Verification
- [ ] Verify that `devs-webhook/src/lib.rs` contains `// Covers: 1_PRD-REQ-037`.
- [ ] Verify that the `WebhookEvent` implementation in `devs-webhook/src/types.rs` contains `// Covers: 1_PRD-REQ-036`.
