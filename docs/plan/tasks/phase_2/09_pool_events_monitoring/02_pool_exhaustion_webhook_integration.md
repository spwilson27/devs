# Task: Integrate Pool Exhaustion Events with Webhook Dispatcher (Sub-Epic: 09_Pool Events & Monitoring)

## Covered Requirements
- [2_TAS-REQ-033], [2_TAS-REQ-047]

## Dependencies
- depends_on: ["01_pool_exhaustion_tracking.md"]
- shared_components: [devs-pool (consumer), devs-webhook (consumer — use existing WebhookDispatcher), devs-core (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-webhook/tests/` or an integration test module, write the following tests annotated with `// Covers: 2_TAS-REQ-033` and `// Covers: 2_TAS-REQ-047`:
- [ ] **`test_pool_exhausted_event_forwarded_to_webhook_dispatcher`**: Create a `WebhookDispatcher` with a mock HTTP target (use `wiremock` or an `mpsc` test receiver). Create an `AgentPool` wired to the dispatcher. Trigger a pool exhaustion episode by marking all agents as rate-limited. Assert that the webhook dispatcher receives exactly one `WebhookEvent::PoolExhausted` with the correct `pool_name`, `timestamp`, and `project_id` fields.
- [ ] **`test_pool_exhausted_webhook_payload_schema`**: Assert the serialized JSON payload matches the schema from [2_TAS-REQ-046]: fields `event` (= `"pool.exhausted"`), `timestamp` (RFC 3339), `project_id`, `run_id` (null for pool events), `stage_name` (null), `data` (contains `pool_name`), `truncated` (false). Assert total payload size < 64 KiB.
- [ ] **`test_pool_exhausted_fires_only_for_subscribed_projects`**: Configure two webhook targets — one subscribed to `pool.exhausted`, one subscribed only to `run.completed`. Trigger exhaustion. Assert only the subscribed target receives the event.
- [ ] **`test_second_episode_fires_second_webhook`**: Trigger exhaustion → recovery → exhaustion. Assert two separate webhook deliveries occur (one per episode).
- [ ] **`test_pool_exhausted_does_not_block_scheduler`**: Send a `PoolExhaustedEvent` into the dispatcher channel while the dispatcher's HTTP target is slow (simulated 5s delay). Assert the send completes within 10ms (non-blocking bounded channel semantics per [2_TAS-REQ-002Q]).

## 2. Task Implementation
- [ ] In the server bootstrap or orchestrator wiring code, spawn a `tokio::spawn` task that reads from the `AgentPool`'s `mpsc::UnboundedReceiver<PoolExhaustedEvent>` and converts each event into a `WebhookEvent::PoolExhausted { pool_name, timestamp }`, then calls `WebhookDispatcher::send(event)`.
- [ ] Implement `From<PoolExhaustedEvent>` for `WebhookEvent` (or a manual conversion) that maps:
  - `event` → `"pool.exhausted"`
  - `timestamp` → `PoolExhaustedEvent.timestamp` formatted as RFC 3339
  - `project_id` → empty string or a server-level sentinel (pool events are not project-scoped)
  - `data` → `{ "pool_name": "<name>" }`
  - `truncated` → `false`
- [ ] In the `WebhookDispatcher`'s delivery logic, filter events against each target's subscribed event types. Only deliver `pool.exhausted` to targets that include it in their subscription list.
- [ ] Ensure the bounded `mpsc` channel between pool and dispatcher does not block the pool's `report_rate_limit` path — use `try_send` with a logged warning on channel full (rather than blocking).

## 3. Code Review
- [ ] Verify the webhook payload serialization matches the schema in [2_TAS-REQ-046] exactly (field names, types, presence of `truncated`).
- [ ] Verify the forwarding task handles channel closure gracefully (dispatcher shutdown).
- [ ] Confirm no sensitive data (API keys, env vars) leaks into webhook payloads.
- [ ] Ensure all public types and functions have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` and any integration tests covering pool-webhook wiring.

## 5. Update Documentation
- [ ] Add doc comments to the conversion impl and the forwarding task explaining the event flow: pool → mpsc → forwarding task → WebhookDispatcher → HTTP targets.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all webhook and pool tests pass.
- [ ] Verify `// Covers: 2_TAS-REQ-033` and `// Covers: 2_TAS-REQ-047` annotations are present in all new test functions.
