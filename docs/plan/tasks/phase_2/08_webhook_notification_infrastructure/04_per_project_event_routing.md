# Task: Per-Project Webhook Configuration and Event Class Routing (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-037], [1_PRD-REQ-036]

## Dependencies
- depends_on: [03_retry_strategy.md]
- shared_components: [devs-webhook (owner), devs-config (consumer — reads webhook targets from ServerConfig/ProjectEntry), devs-core (consumer — ProjectRef, RunId)]

## 1. Initial Test Written
- [ ] In `crates/devs-webhook/tests/routing_test.rs`, write integration tests using `wiremock`:
  - [ ] **Test: project isolation** — create two `wiremock::MockServer` instances (project_a_server, project_b_server). Configure dispatcher with project A's webhook pointing to project_a_server and project B's webhook pointing to project_b_server. Send a `RunStarted` event for project A. Verify project_a_server received 1 request and project_b_server received 0 requests. `// Covers: 1_PRD-REQ-037`
  - [ ] **Test: event class filtering** — configure project A with a webhook subscribed only to `RunLifecycle` events. Send a `StageStarted` event for project A. Verify the webhook received 0 requests. Then send a `RunStarted` event. Verify the webhook received 1 request. `// Covers: 1_PRD-REQ-037`
  - [ ] **Test: AllStateChanges subscription** — configure project A with a webhook subscribed to `AllStateChanges`. Send `RunStarted`, `StageCompleted`, `PoolExhausted`, and `StateChanged` events. Verify the webhook received 4 requests. `// Covers: 1_PRD-REQ-036`
  - [ ] **Test: multiple webhooks per project** — configure project A with two webhooks: one subscribed to `RunLifecycle`, another to `StageLifecycle`. Send `RunStarted` and `StageStarted`. Verify webhook 1 received only `RunStarted`, webhook 2 received only `StageStarted`.
  - [ ] **Test: PoolExhausted routing** — configure a project subscribed to `PoolExhausted`. Send a `PoolExhausted` event. Verify the webhook receives the event with correct payload schema. `// Covers: 1_PRD-REQ-036`
- [ ] In `crates/devs-webhook/src/service.rs`, write unit tests:
  - [ ] Test that `WebhookService::new(config: WebhookConfig) -> Self` constructs without error given valid config.
  - [ ] Test that `WebhookService::dispatch(project_id, event, payload_data)` correctly routes based on project ID and event class.
  - [ ] Test that dispatching for an unknown project ID is a no-op (no panic, no error).

## 2. Task Implementation
- [ ] Define `WebhookConfig` in `crates/devs-webhook/src/config.rs`:
  ```rust
  /// Per-project webhook configuration.
  pub struct ProjectWebhookConfig {
      pub project_id: String,
      pub targets: Vec<WebhookTarget>,
  }

  /// Top-level webhook configuration for the server.
  pub struct WebhookConfig {
      pub projects: Vec<ProjectWebhookConfig>,
  }
  ```
- [ ] Implement `WebhookService` in `crates/devs-webhook/src/service.rs`:
  - Field: `dispatchers: HashMap<String, WebhookDispatcher>` — keyed by project ID. Each project gets its own `WebhookDispatcher` with that project's configured targets.
  - `new(config: WebhookConfig) -> Self`: iterate `config.projects`, create a `WebhookDispatcher` for each project with its targets.
  - `dispatch(&self, project_id: &str, event: WebhookEvent, run_id: &str, stage_name: Option<&str>, data: serde_json::Value)`:
    1. Look up dispatcher by `project_id`. If not found, return silently (no-op).
    2. Construct a `WebhookPayload::new(&event, project_id, run_id, stage_name, data)`.
    3. Call `dispatcher.send(&event, payload)`. If channel full, log WARN and drop.
  - `shutdown(self)`: shut down all dispatchers.
  - Implement `Send + Sync` (should be automatic since `HashMap` and `WebhookDispatcher` are `Send + Sync`).
- [ ] Update `crates/devs-webhook/src/lib.rs` to export `service`, `config` modules and re-export `WebhookService` and `WebhookConfig` as the primary public API.
- [ ] Ensure `WebhookService` can be wrapped in `Arc` for sharing with the scheduler and server components.

## 3. Code Review
- [ ] Verify that event class filtering happens inside `WebhookDispatcher::send()` (implemented in task 02) — `WebhookService` passes all events and the dispatcher filters by `subscribed_events`.
- [ ] Verify that unknown project IDs are silently ignored — no error, no panic.
- [ ] Verify that the `WebhookService` does not hold any locks during dispatch — it's a simple HashMap lookup + channel send.
- [ ] Verify that `WebhookConfig` can be constructed from `devs-config`'s `ServerConfig` and `ProjectEntry` types (or document the conversion needed for the devs-server integration in Phase 3).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings`.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookService`, `WebhookConfig`, `ProjectWebhookConfig`, and `dispatch()`.
- [ ] Add a module-level doc comment to `crates/devs-webhook/src/lib.rs` explaining the overall architecture: `WebhookService` -> per-project `WebhookDispatcher` -> per-target Tokio tasks with retry.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-037' crates/devs-webhook/` and verify at least one match in routing_test.rs or service.rs.
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-036' crates/devs-webhook/` and verify at least one match in routing_test.rs or event.rs.
- [ ] Run `cargo test -p devs-webhook -- --nocapture 2>&1 | tail -1` and verify `test result: ok`.
