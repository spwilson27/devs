# Task: Implement Rate Limit Risk Acceptance Criteria (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-010-05], [RISK-010-BR-005], [MIT-010]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md", "15_webhook_ssrf_security.md"]
- shared_components: [devs-core (Owner), devs-pool (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_rate_limit_cooldown_absolute_timestamp` that sets a rate-limit cooldown and verifies the agent is unavailable until the absolute timestamp passes
- [ ] Write test `test_rate_limit_cooldown_survives_server_restart` that persists rate-limit cooldown state and verifies it survives checkpoint restore
- [ ] Write test `test_rate_limit_fallback_agent_selection` that marks primary agent rate-limited and verifies fallback agent is selected
- [ ] Write test `test_rate_limit_pool_exhausted_once_per_episode` that triggers pool exhaustion multiple times and verifies webhook fires only once per episode
- [ ] Write test `test_mit_010_fallback_documented` that asserts the fallback activation record exists in `docs/adr/` documenting rate-limit fallback procedures

## 2. Task Implementation
- [ ] Define `RateLimitCooldown` struct in `crates/devs-core/src/pool/rate_limit.rs` with:
  - `agent_id: AgentId`
  - `cooldown_until: DateTime<Utc>` (absolute timestamp)
  - `reason: RateLimitReason`
- [ ] Define `RateLimitReason` enum with variants:
  - `ApiQuotaExceeded { retry_after_secs: Option<u64> }`
  - `ServiceUnavailable { retry_after_secs: Option<u64> }`
  - `AuthenticationError`
  - `Unknown { error_message: String }`
- [ ] Define `RateLimitRegistry` struct with:
  - `active_cooldowns: HashMap<AgentId, RateLimitCooldown>`
  - `report_rate_limit(agent_id: AgentId, cooldown: RateLimitCooldown) -> Result<(), RateLimitError>`
  - `is_available(agent_id: &AgentId) -> bool` — checks if cooldown has expired
  - `cleanup_expired(&mut self) -> usize` — removes expired cooldowns, returns count
- [ ] Implement `MIT-010` mitigation: Rate-limit cooldown with absolute timestamps and fallback
  - Persist cooldown state to checkpoint store
  - Restore on server restart
  - Automatic fallback to next available agent in pool
- [ ] Define `PoolExhaustedEpisode` struct tracking:
  - `first_occurrence: DateTime<Utc>`
  - `webhook_fired: bool`
  - `resolved: bool`
  - Ensures webhook fires only once per episode
- [ ] Implement `RISK-010-BR-005` business rule: Fallback activation record must be written before implementing fallback
  - Define `FallbackActivationRecord` struct with fields for risk ID, trigger condition, ADR path
  - Validate ADR file exists before fallback is activated
- [ ] Add `pub mod rate_limit;` to `crates/devs-core/src/pool/mod.rs`

## 3. Code Review
- [ ] Verify cooldown uses absolute timestamps (not relative durations) for crash recovery
- [ ] Verify checkpoint persistence includes rate-limit state
- [ ] Verify `MIT-010` mitigation is correctly implemented per the risk matrix
- [ ] Verify `RISK-010-BR-005` business rule is enforced (ADR must exist before fallback)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core pool::rate_limit` and confirm all rate-limit tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings
- [ ] Verify `docs/adr/NNNN-fallback-rate-limit.md` exists with correct content

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/pool/rate_limit.rs` explaining the cooldown model and MIT-010 mitigation
- [ ] Add doc comments to `RateLimitRegistry` methods describing persistence semantics
- [ ] Document the fallback activation record format and `RISK-010-BR-005` business rule

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `RateLimitCooldown` serializes to checkpoint JSON with correct format
- [ ] Run `grep -r "RISK-010" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
