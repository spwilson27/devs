# Task: Implement Pool Selection Flow (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-113]

## Dependencies
- depends_on: []
- shared_components: [devs-pool (owner — creates selection module), devs-core (consumer — uses domain types)]

## 1. Initial Test Written
- [ ] Create `devs-pool/src/selection.rs` (or `devs-pool/tests/selection.rs`) with the following TDD tests:
- [ ] **Test `selection_filters_by_capability_superset`** (step 2): Create a pool with 3 agents: A has `["code-gen", "review"]`, B has `["code-gen"]`, C has `["review"]`. Request `required_capabilities = ["code-gen", "review"]`. Assert only agent A is returned. Annotate with `// Covers: 2_TAS-REQ-113`.
- [ ] **Test `selection_fails_with_unsatisfied_capability`** (step 2): Request capabilities that no agent satisfies. Assert `PoolError::UnsatisfiedCapability` is returned and the stage fails immediately. Annotate with `// Covers: 2_TAS-REQ-113`.
- [ ] **Test `selection_excludes_rate_limited_agents`** (step 3): Create a pool with 2 matching agents. Put agent A in cooldown. Assert agent B is selected. Annotate with `// Covers: 2_TAS-REQ-113`.
- [ ] **Test `selection_waits_when_all_matching_agents_rate_limited`** (step 4): Create a pool with 2 matching agents, both in cooldown. Assert the selection blocks (or returns a wait signal) until a cooldown expires. Annotate with `// Covers: 2_TAS-REQ-113`.
- [ ] **Test `selection_prefers_non_fallback_on_first_attempt`** (step 5): Create a pool with agent A (non-fallback, priority 1) and agent B (fallback, priority 2). On attempt 1, assert agent A is selected. Annotate with `// Covers: 2_TAS-REQ-113`.
- [ ] **Test `selection_uses_any_agent_on_retry_attempt`** (step 5): Same pool as above. On attempt > 1, assert either agent can be selected (fallback agents are no longer deprioritized). Annotate with `// Covers: 2_TAS-REQ-113`.
- [ ] **Test `selection_acquires_semaphore_permit`** (step 6): Create a pool with `max_concurrent = 1`. Acquire one agent. Assert a second acquisition blocks until the first is released. Annotate with `// Covers: 2_TAS-REQ-113`.
- [ ] **Test `selection_returns_highest_priority_agent`** (step 7): Create a pool with 3 matching agents ordered by config position. Assert the first (highest priority) available agent is returned.

## 2. Task Implementation
- [ ] Implement `pub async fn acquire_agent(&self, pool_name: &str, required_caps: &[&str], attempt: u32) -> Result<AgentLease, PoolError>` in `devs-pool/src/selection.rs` following the 7-step flow from [2_TAS-REQ-113]:
  1. Accept stage dispatch request with `required_capabilities`.
  2. Filter pool agents: each agent's capability set must be a superset of `required_capabilities`. If no agents match, return `PoolError::UnsatisfiedCapability`.
  3. Exclude agents whose `cooldown_until` is `Some(t)` where `t > Instant::now()`.
  4. If all matching agents are rate-limited, await the earliest cooldown expiry (using `tokio::time::sleep_until`), then retry from step 3. If the pool enters exhaustion, fire `PoolExhausted` event (delegated to exhaustion tracking).
  5. If `attempt == 1`, sort available agents: non-fallback first, then by config priority order. If `attempt > 1`, sort by priority order only (fallback flag ignored).
  6. Acquire a `tokio::sync::Semaphore` permit from the pool's concurrency semaphore (blocks if at `max_concurrent`).
  7. Return `AgentLease` containing the selected `AgentConfig` and the semaphore permit (permit released on drop).
- [ ] Define `AgentLease` struct that holds the `AgentConfig` reference and an `OwnedSemaphorePermit`.
- [ ] Define `PoolError` enum with variants: `UnsatisfiedCapability { required: Vec<String>, pool: String }`, `PoolExhausted { pool: String }`, `Shutdown`.
- [ ] Implement `release_agent(lease: AgentLease)` — drops the lease, which releases the semaphore permit automatically.

## 3. Code Review
- [ ] Verify capability matching uses superset check (agent caps ⊇ required caps), not exact equality.
- [ ] Confirm the fallback preference logic only applies on `attempt == 1`.
- [ ] Ensure the semaphore permit is tied to `AgentLease` lifetime via RAII — no manual release needed.
- [ ] Check that the wait-for-cooldown loop has a bounded timeout to prevent infinite hangs.
- [ ] Verify no `unwrap()` on semaphore acquisition — use `acquire_owned().await` with proper error handling.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- selection` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-pool -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `acquire_agent` describing the 7-step selection algorithm.
- [ ] Add `// Covers: 2_TAS-REQ-113` annotations to each test function.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-113' devs-pool/` and confirm at least 7 test functions are annotated.
- [ ] Run `./do test` and confirm the traceability report includes [2_TAS-REQ-113].
- [ ] Run `./do lint` and confirm no lint failures in the pool crate.
