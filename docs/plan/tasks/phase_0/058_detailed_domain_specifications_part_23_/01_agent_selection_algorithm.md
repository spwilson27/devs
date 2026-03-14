# Task: Implement Agent Selection Algorithm with Capability Filtering and Fallback (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-161]

## Dependencies
- depends_on: []
- shared_components: ["devs-pool (Consumer — design specification for selection logic)", "devs-core (Consumer — domain types for capabilities, agent IDs)"]

## 1. Initial Test Written
- [ ] In `crates/devs-pool/src/selection.rs` (create `#[cfg(test)] mod tests`), write the following tests. Each test must include a `// Covers: 2_TAS-REQ-161` annotation.
- [ ] `test_filter_agents_by_capability_superset`: Create 3 `AgentConfig` values with capabilities `{A, B}`, `{A}`, `{A, B, C}`. Call `select_agent` with `required_capabilities = ["A", "B"]`. Assert only agents 1 and 3 are eligible (agent 2 is filtered out). Verify the returned `AgentLease` wraps one of the two eligible agents.
- [ ] `test_unsatisfied_capability_returns_error`: Pool has agents with capabilities `{A}` and `{B}`. Request `required_capabilities = ["X"]`. Assert the result is `Err(PoolError::UnsatisfiedCapability { missing: vec!["X"] })`.
- [ ] `test_rate_limited_agents_excluded`: Pool has 2 agents both satisfying capabilities. Set `rate_limit_until` on agent 1 to `Utc::now() + Duration::minutes(5)`. Assert only agent 2 is selected.
- [ ] `test_prefer_non_fallback_on_first_attempt`: Pool has agent A (`fallback = false`) and agent B (`fallback = true`), both qualifying. Call with `attempt = 1`. Assert agent A is selected.
- [ ] `test_fallback_used_when_non_fallback_all_rate_limited`: Pool has agent A (`fallback = false`, rate-limited) and agent B (`fallback = true`, available). Call with `attempt = 1`. Assert agent B is selected.
- [ ] `test_semaphore_blocks_at_max_concurrent`: Create pool with `max_concurrent = 1`. Acquire one agent. Spawn a second `select_agent` call on `tokio::spawn`. Assert it does not resolve within 50ms (`tokio::time::timeout`). Drop the first `AgentLease`. Assert the second resolves within 100ms.
- [ ] `test_all_agents_rate_limited_returns_pool_exhausted`: All agents (fallback and non-fallback) have `rate_limit_until` in the future. Assert `Err(PoolError::PoolExhausted { pool_name })`.

## 2. Task Implementation
- [ ] Define `PoolError` enum in `crates/devs-pool/src/error.rs` with variants: `UnsatisfiedCapability { missing: Vec<String> }`, `PoolExhausted { pool_name: String }`, `SemaphoreAcquireFailed`.
- [ ] Define `AgentLease` struct in `crates/devs-pool/src/lease.rs` holding: `agent_config: AgentConfig`, `pool_name: String`, `_permit: tokio::sync::OwnedSemaphorePermit`. The permit is released automatically on drop.
- [ ] Implement `select_agent` in `crates/devs-pool/src/selection.rs` following the exact 6-step algorithm from [2_TAS-REQ-161]:
  1. Filter `pool.agents` to those where `agent.capabilities.is_superset(&required_caps_set)`.
  2. If filtered list is empty → return `Err(PoolError::UnsatisfiedCapability)`.
  3. Remove agents where `agent.rate_limit_until > Some(Utc::now())`.
  4. If `attempt == 1`: partition into `(non_fallback, fallback)`. Use `non_fallback` if non-empty, else use `fallback`. If both empty → `Err(PoolError::PoolExhausted)`.
  5. Acquire `pool.semaphore.clone().acquire_owned().await` — this blocks if at capacity.
  6. Select first available agent from the candidate list. Return `Ok(AgentLease { agent_config, pool_name, _permit })`.
- [ ] Use `HashSet<String>` for capability comparison. Use `chrono::Utc::now()` for cooldown comparison.

## 3. Code Review
- [ ] Confirm the 6 steps execute in the exact order specified by [2_TAS-REQ-161] — no reordering.
- [ ] Confirm capability check is superset (agent caps ⊇ required caps), not equality.
- [ ] Confirm `PoolError` is a proper enum with `#[derive(Debug, thiserror::Error)]` — NOT `anyhow::Error` (library crate).
- [ ] Confirm the semaphore permit is acquired AFTER agent selection but BEFORE returning.
- [ ] Confirm no `unwrap()`/`expect()` on fallible paths.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- selection` and confirm all 7 tests pass with zero failures.

## 5. Update Documentation
- [ ] Add `/// Implements the agent selection algorithm per [2_TAS-REQ-161].` doc comment on `select_agent`.
- [ ] Add doc comments on `PoolError` variants explaining when each is returned.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm zero warnings.
- [ ] Grep test output for `// Covers: 2_TAS-REQ-161` to confirm traceability annotation is present.
