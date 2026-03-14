# Task: Implement Capability-Based Routing and Fallback Order (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-020]

## Dependencies
- depends_on: ["01_pool_models.md"]
- shared_components: [devs-pool (create — routing module), devs-config (consume — PoolConfig)]

## 1. Initial Test Written
- [ ] In `crates/devs-pool/src/routing.rs`, write the following unit tests (all fail initially):
  - `test_select_agent_single_match`: Pool with 3 agents; only agent 2 has `"review"`. Request `["review"]`. Assert selected agent's tool matches agent 2.
  - `test_select_agent_priority_order`: Pool with agents A (capabilities: `["code-gen"]`) and B (capabilities: `["code-gen"]`). Request `["code-gen"]`. Assert A is selected (first in declaration order).
  - `test_select_agent_capability_intersection`: Pool with agent A (`["code-gen"]`) and agent B (`["code-gen", "review"]`). Request `["code-gen", "review"]`. Assert B is selected (only agent satisfying ALL tags).
  - `test_select_agent_empty_tags_returns_first`: Pool with 3 agents. Request `[]` (empty tags). Assert the first agent is selected.
  - `test_select_agent_no_match_returns_error`: Pool with agents having `["code-gen"]`. Request `["quantum-computing"]`. Assert `PoolError::UnsatisfiedCapabilities` is returned with `requested: ["quantum-computing"]` and `available` listing each agent's capabilities.
  - `test_select_agent_fallback_ordering`: Pool with agent A (primary, `["code-gen"]`) and agent B (fallback=true, `["code-gen"]`). On first attempt, assert A is selected. When A is marked rate-limited (cooldown_until in the future), assert B is selected.
  - `test_select_agent_skips_rate_limited`: Pool with agents A and B both having `["code-gen"]`. Mark A with `cooldown_until = Utc::now() + Duration::seconds(60)`. Request `["code-gen"]`. Assert B is selected.
  - `test_select_agent_all_rate_limited_returns_exhausted`: Pool with 1 agent, rate-limited. Request `["code-gen"]`. Assert `PoolError::PoolExhausted` is returned.

## 2. Task Implementation
- [ ] In `crates/devs-pool/src/routing.rs`, implement the agent selection algorithm as a method on `AgentPool`:
  ```rust
  impl AgentPool {
      /// Select the best available agent matching all required capability tags.
      ///
      /// Algorithm:
      /// 1. Filter agents to those whose capabilities are a superset of `required_tags`.
      /// 2. If filtered list is empty, return `PoolError::UnsatisfiedCapabilities`.
      /// 3. Among filtered agents, partition into primary (fallback=false) and fallback (fallback=true).
      /// 4. Within each partition, skip agents whose `cooldown_until` is in the future.
      /// 5. Select the first available primary agent. If none, select the first available fallback agent.
      /// 6. If no agent is available (all rate-limited), return `PoolError::PoolExhausted`.
      pub fn select_agent(&self, required_tags: &[String]) -> Result<&AgentEntry, PoolError> { ... }
  }
  ```
- [ ] Implement `AgentPool::report_rate_limit(&mut self, agent_index: usize, cooldown_until: DateTime<Utc>)` that sets the `cooldown_until` field on the specified agent entry.
- [ ] Implement `AgentPool::clear_expired_cooldowns(&mut self)` that clears `cooldown_until` for agents whose cooldown has expired (called before selection).
- [ ] The `select_agent` method must call `clear_expired_cooldowns` internally before filtering.

## 3. Code Review
- [ ] Verify empty `required_tags` matches ALL agents (no filtering).
- [ ] Verify primary agents are always preferred over fallback agents when available.
- [ ] Verify the error message for `UnsatisfiedCapabilities` lists both the requested tags and each agent's available capabilities (per 3_PRD-BR-025).
- [ ] Verify `select_agent` is `O(N * M)` where N = agents, M = required tags — acceptable for small pool sizes.
- [ ] Verify capability comparison uses normalized (lowercase) tags.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- routing` and verify all 8 tests pass.

## 5. Update Documentation
- [ ] Add doc comments describing the selection algorithm on `select_agent`.
- [ ] Add `// Covers: 1_PRD-REQ-020` annotations to each test function.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./do lint` and ensure no warnings.
- [ ] Verify `// Covers: 1_PRD-REQ-020` appears in test code via `grep -r "Covers: 1_PRD-REQ-020" crates/devs-pool/`.
