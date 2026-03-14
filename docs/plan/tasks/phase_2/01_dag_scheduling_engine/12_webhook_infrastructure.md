# Task: Webhook Infrastructure (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-125], [2_TAS-REQ-144], [2_TAS-REQ-145], [2_TAS-REQ-146], [2_TAS-REQ-147], [2_TAS-REQ-148], [2_TAS-REQ-149], [2_TAS-REQ-150], [2_TAS-REQ-512], [2_TAS-REQ-513], [2_TAS-REQ-514], [2_TAS-REQ-515], [2_TAS-REQ-516], [2_TAS-REQ-517]

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md"]
- shared_components: [devs-webhook (owner — webhook dispatcher), devs-core (consumer — event types, error types), ./do Entrypoint Script & CI Pipeline (consumer — presubmit integration)]

## 1. Initial Test Written
- [ ] Create `crates/devs-webhook/src/dispatcher.rs` and `crates/devs-webhook/tests/webhook_tests.rs`.
- [ ] Write unit test `test_webhook_target_schema_validation`: construct `WebhookTarget` with valid fields. Assert all fields are correctly stored. Annotate `// Covers: 2_TAS-REQ-145`.
- [ ] Write unit test `test_webhook_target_url_max_length`: create URL with 2049 characters. Assert validation returns `ValidationError::UrlTooLong`. Annotate `// Covers: 2_TAS-REQ-145`.
- [ ] Write unit test `test_webhook_target_invalid_scheme`: create URL with `ftp://` scheme. Assert validation returns `ValidationError::InvalidWebhookUrl`. Annotate `// Covers: 2_TAS-REQ-145, 2_TAS-REQ-517`.
- [ ] Write unit test `test_webhook_target_empty_events`: create target with `events = []`. Assert validation returns `ValidationError::EmptyEvents`. Annotate `// Covers: 2_TAS-REQ-513, 2_TAS-REQ-517`.
- [ ] Write unit test `test_webhook_target_timeout_out_of_range`: create target with `timeout_secs = 0` and `timeout_secs = 31`. Assert validation fails for both. Annotate `// Covers: 2_TAS-REQ-145, 2_TAS-REQ-517`.
- [ ] Write unit test `test_webhook_target_max_retries_out_of_range`: create target with `max_retries = 11`. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-145, 2_TAS-REQ-517`.
- [ ] Write unit test `test_project_max_webhooks_limit`: add 17 webhook targets to a project. Assert the 17th is rejected with error mentioning "16 webhook targets (maximum)". Annotate `// Covers: 2_TAS-REQ-512`.
- [ ] Write unit test `test_supported_event_strings`: verify all event strings parse correctly: `run.started`, `run.completed`, `run.failed`, `run.cancelled`, `stage.started`, `stage.completed`, `stage.failed`, `stage.timed_out`, `pool.exhausted`, `state.changed`. Annotate `// Covers: 2_TAS-REQ-146`.
- [ ] Write unit test `test_unknown_event_string_rejected`: create target with `events = ["unknown.event"]`. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-146, 2_TAS-REQ-517`.
- [ ] Write unit test `test_webhook_payload_schema`: trigger a `run.started` event, capture the HTTP POST body. Assert it contains: `event`, `project_id`, `project_name`, `occurred_at`, `run` object with `run_id`, `slug`, `workflow_name`, `status`, `started_at`. Annotate `// Covers: 2_TAS-REQ-147`.
- [ ] Write unit test `test_webhook_hmac_signature`: create target with `secret = "test-secret"`, trigger event. Assert `X-Devs-Signature-256` header is present and contains correct HMAC-SHA256 hex digest. Annotate `// Covers: 2_TAS-REQ-148`.
- [ ] Write unit test `test_webhook_retry_policy_fixed_backoff`: mock webhook endpoint that fails first 3 requests, succeeds on 4th. Assert retries occur with 5-second fixed backoff, and delivery succeeds on 4th attempt. Annotate `// Covers: 2_TAS-REQ-125`.
- [ ] Write unit test `test_webhook_retry_max_attempts`: mock endpoint that always fails. Assert exactly 10 retry attempts are made, then delivery is dropped and ERROR logged. Annotate `// Covers: 2_TAS-REQ-125`.
- [ ] Write unit test `test_webhook_delivery_non_blocking`: send webhook event, measure time from send to function return. Assert < 10ms (delivery happens asynchronously). Annotate `// Covers: 2_TAS-REQ-515`.
- [ ] Write unit test `test_webhook_queue_overflow_drops_notification`: fill dispatcher channel to 1024 items, send one more. Assert the extra notification is dropped and WARN logged. Annotate `// Covers: 2_TAS-REQ-515`.
- [ ] Write unit test `test_pool_exhausted_fires_once_per_episode`: exhaust pool (all agents unavailable), assert `pool.exhausted` event fires. Report another exhaustion while still exhausted. Assert NO second event fires. Release an agent, exhaust again. Assert second event fires. Annotate `// Covers: 2_TAS-REQ-514`.
- [ ] Write unit test `test_state_changed_deduplication`: subscribe to both `state.changed` and `run.completed` for same run. Assert exactly one POST is sent when run completes (not duplicate). Annotate `// Covers: 2_TAS-REQ-516`.
- [ ] Write unit test `test_webhook_startup_validation`: create `projects.toml` with invalid webhook entry (bad URL scheme). Start server. Assert startup aborts with error to stderr before any port binding. Annotate `// Covers: 2_TAS-REQ-517`.

## 2. Task Implementation
- [ ] Define `WebhookTarget` struct in `crates/devs-webhook/src/types.rs`:
  - `webhook_id: Uuid` (system-assigned)
  - `url: String` (validated: http/https only, max 2048 chars)
  - `events: Vec<WebhookEvent>` (non-empty, validated against known events)
  - `secret: Option<String>` (max 512 chars, for HMAC-SHA256 signing)
  - `timeout_secs: u32` (1-30, default 10)
  - `max_retries: u32` (0-10, default 3)
- [ ] Define `WebhookEvent` enum: `RunStarted`, `RunCompleted`, `RunFailed`, `RunCancelled`, `StageStarted`, `StageCompleted`, `StageFailed`, `StageTimedOut`, `PoolExhausted`, `StateChanged`.
- [ ] Implement `WebhookTarget::validate(&self) -> Result<(), ValidationError>`:
  - Check URL scheme (http/https only).
  - Check URL length ≤ 2048.
  - Check events array is non-empty.
  - Check all event strings are known.
  - Check timeout_secs in 1-30.
  - Check max_retries in 0-10.
  - Check secret length ≤ 512 if present.
- [ ] Define `WebhookPayload` struct for JSON serialization:
  - `event: String`, `project_id: String`, `project_name: String`, `occurred_at: DateTime<Utc>`.
  - `run: Option<RunSummary>`, `stage: Option<StageSummary>`, `pool: Option<PoolSummary>`.
  - `truncated: bool` (if payload > 64 KiB).
- [ ] Implement `WebhookDispatcher` in `crates/devs-webhook/src/dispatcher.rs`:
  - `pub fn new(config: Vec<WebhookTarget>) -> Self` — creates dispatcher with bounded mpsc channel (1024 capacity).
  - `pub async fn send(&self, event: WebhookEvent) -> Result<()>` — non-blocking enqueue.
  - Internal task that reads from channel and delivers HTTP POSTs.
- [ ] Implement delivery logic:
  - HTTP POST with `Content-Type: application/json`.
  - Headers: `X-Devs-Event`, `X-Devs-Delivery` (UUID4), `X-Devs-Signature-256` (if secret configured).
  - Success = HTTP 2xx received within `timeout_secs`.
  - Retry with fixed 5-second backoff, max 10 attempts.
  - Drop and log ERROR after max retries exceeded.
- [ ] Implement `pool.exhausted` episode tracking:
  - Track per-pool exhaustion state in memory.
  - Fire event only when transitioning from available→exhausted.
  - Reset episode when any agent becomes available.
- [ ] Implement `state.changed` deduplication:
  - When multiple event types match same transition, deliver exactly one POST per target.
- [ ] Implement startup validation in server initialization:
  - Validate all webhook targets from `projects.toml` before binding ports.
  - Report all validation errors to stderr.
  - Exit non-zero if any validation fails.
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify webhook delivery is non-blocking (sender returns immediately).
- [ ] Verify `pool.exhausted` fires exactly once per episode.
- [ ] Verify `state.changed` deduplication works when subscribed alongside specific events.
- [ ] Verify HMAC signature is computed correctly (HMAC-SHA256, hex lowercase).
- [ ] Verify retry state is in-memory only (not persisted across restarts).
- [ ] Verify startup validation aborts before any port binding.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook -- webhook` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings` and verify no warnings.
- [ ] Run wiremock integration test for at-least-once delivery semantics.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookTarget`, `WebhookEvent`, `WebhookDispatcher`, and all public methods.
- [ ] Add module doc comment explaining delivery semantics and retry policy.
- [ ] Document the webhook payload schema and headers.
- [ ] Ensure `cargo doc -p devs-webhook --no-deps` builds without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-webhook -- webhook --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-webhook --out json -- webhook` and verify ≥ 90% line coverage for `dispatcher.rs` and `types.rs`.
- [ ] Verify `./do lint` validates webhook config at startup (test with invalid config).
