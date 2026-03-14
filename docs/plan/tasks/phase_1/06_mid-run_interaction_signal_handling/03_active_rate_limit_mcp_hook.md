# Task: Implement Active Rate-Limit Reporting Hook via MCP (Sub-Epic: 06_Mid-Run Interaction & Signal Handling)

## Covered Requirements
- [1_PRD-REQ-018], [1_PRD-REQ-017]

## Dependencies
- depends_on: [02_passive_rate_limit_detection.md]
- shared_components: [devs-adapters (owner: Phase 1 — this task adds the active reporting integration point), devs-pool (consumer: receives active rate-limit reports)]

## 1. Initial Test Written
- [ ] In `crates/devs-adapters/src/rate_limit.rs`, write `test_active_rate_limit_report_creates_info` — construct an `ActiveRateLimitReport` (simulating what an MCP tool call would provide: agent ID, optional cooldown duration) and verify it converts to a `RateLimitInfo` with the correct adapter name and cooldown.
- [ ] Write `test_active_report_custom_cooldown` — verify that when the agent provides a custom cooldown duration (e.g., 120s from a `Retry-After` header), it overrides the default 60s.
- [ ] Write `test_active_report_default_cooldown` — verify that when the agent provides no cooldown hint, the default 60s is used.
- [ ] Write `test_report_rate_limit_channel_send` — create a `tokio::sync::mpsc::channel`, send an `ActiveRateLimitReport` through it, and verify the receiver gets the correct data. This tests the communication path from MCP handler to pool manager.
- [ ] All tests must include `// Covers: 1_PRD-REQ-018` or `// Covers: 1_PRD-REQ-017` annotations.

## 2. Task Implementation
- [ ] Define `ActiveRateLimitReport` struct in `crates/devs-adapters/src/rate_limit.rs`:
  ```rust
  /// Report from an agent (via MCP tool call) that it has hit a rate limit.
  #[derive(Debug, Clone)]
  pub struct ActiveRateLimitReport {
      /// The agent's identifier within the pool.
      pub agent_id: String,
      /// Optional cooldown hint from the agent (e.g., parsed from Retry-After).
      pub cooldown_hint: Option<Duration>,
  }
  ```
- [ ] Implement `ActiveRateLimitReport::to_rate_limit_info(&self, adapter_name: &'static str) -> RateLimitInfo` that converts to `RateLimitInfo` using `cooldown_hint.unwrap_or(DEFAULT_RATE_LIMIT_COOLDOWN)`.
- [ ] Define a `RateLimitReporter` trait (or type alias for a channel sender) that the MCP server layer will call when it receives a `report_rate_limit` tool invocation from an agent:
  ```rust
  pub type RateLimitSender = tokio::sync::mpsc::Sender<ActiveRateLimitReport>;
  pub type RateLimitReceiver = tokio::sync::mpsc::Receiver<ActiveRateLimitReport>;
  ```
- [ ] Create `pub fn rate_limit_channel(buffer: usize) -> (RateLimitSender, RateLimitReceiver)` factory function (thin wrapper around `mpsc::channel`).
- [ ] Document that the `RateLimitReceiver` end is consumed by `devs-pool` to update agent cooldown state, and the `RateLimitSender` is injected into the MCP server's tool handler (Phase 3).

## 3. Code Review
- [ ] Verify that `ActiveRateLimitReport` is `Send + Sync` so it can cross task boundaries.
- [ ] Verify the channel buffer size is a configurable constant (`RATE_LIMIT_CHANNEL_BUFFER`, default 64).
- [ ] Verify `to_rate_limit_info` correctly falls back to `DEFAULT_RATE_LIMIT_COOLDOWN` when no hint is provided.
- [ ] Verify this code does not depend on MCP server types — it defines only the data types and channel, leaving the MCP integration to Phase 3.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters -- rate_limit` to verify all active reporting tests pass alongside existing passive tests.

## 5. Update Documentation
- [ ] Add doc comments to `ActiveRateLimitReport`, `RateLimitSender`, `RateLimitReceiver`, and `rate_limit_channel` explaining the active reporting flow.
- [ ] Document that the MCP tool `report_rate_limit` (Phase 3) will use `RateLimitSender` to forward reports.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all tests pass with traceability annotations for `1_PRD-REQ-018` and `1_PRD-REQ-017`.
- [ ] Run `./do lint` and confirm no warnings or errors.
