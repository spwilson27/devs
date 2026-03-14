# Task: Implement Pool Registry for Multi-Project Shared Access (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-033]

## Dependencies
- depends_on: [01_pool_models.md, 02_routing_logic.md, 03_concurrency_control.md]
- shared_components: [devs-pool (create — registry module), devs-config (consume — ServerConfig with pool definitions)]

## 1. Initial Test Written
- [ ] In `crates/devs-pool/src/registry.rs`, write the following tests:
  - `test_registry_from_config`: Create a `ServerConfig` with 2 pool definitions (`"primary"` and `"secondary"`). Construct `PoolRegistry::from_config(&config)`. Assert `registry.get_pool("primary")` succeeds and `registry.get_pool("secondary")` succeeds.
  - `test_registry_unknown_pool_error`: Construct registry with pool `"primary"`. Call `registry.get_pool("nonexistent")`. Assert `PoolError::UnknownPool { name: "nonexistent" }` is returned.
  - `test_registry_shared_pool_across_projects`: Construct registry with pool `"shared"` (`max_concurrent = 2`). Get the pool twice (simulating two projects). Acquire a slot from each reference. Assert `pool.available_slots() == 0` (both references share the same semaphore).
  - `test_registry_pool_names`: Construct registry with pools `["alpha", "beta"]`. Assert `registry.pool_names()` returns `["alpha", "beta"]` (sorted or in config order).
  - `test_registry_get_pool_state_snapshot`: Construct registry with pool `"primary"` (`max_concurrent = 4`, 3 agents). Call `registry.get_pool_state("primary")`. Assert returned `PoolState` contains `name`, `max_concurrent`, `available_slots`, and agent count.
- [ ] Write an async test:
  - `test_registry_concurrent_access`: Wrap registry in `Arc`. Spawn 4 tasks that each call `get_pool("primary")` and acquire a slot. Assert no panics or data races (this test validates thread-safety).

## 2. Task Implementation
- [ ] In `crates/devs-pool/src/registry.rs`, define:
  ```rust
  /// Central registry of all named agent pools. Thread-safe and shared
  /// across all project contexts within a single server instance.
  pub struct PoolRegistry {
      pools: HashMap<String, AgentPool>,
  }
  ```
- [ ] Implement `PoolRegistry::from_config(config: &ServerConfig) -> Result<Self, PoolError>`:
  - Iterate over `config.pools` and construct an `AgentPool` for each.
  - If duplicate pool names are found, return an error.
  - Store pools in a `HashMap<String, AgentPool>`.
- [ ] Implement `PoolRegistry::get_pool(&self, name: &str) -> Result<&AgentPool, PoolError>`:
  - Look up by name. Return `PoolError::UnknownPool` if not found (satisfies 3_PRD-BR-007).
- [ ] Implement `PoolRegistry::pool_names(&self) -> Vec<&str>` returning all registered pool names.
- [ ] Implement `PoolRegistry::get_pool_state(&self, name: &str) -> Result<PoolState, PoolError>` that returns a snapshot struct:
  ```rust
  /// A point-in-time snapshot of pool utilization.
  pub struct PoolState {
      pub name: String,
      pub max_concurrent: usize,
      pub available_slots: usize,
      pub agent_count: usize,
      pub agents: Vec<AgentStateSnapshot>,
  }

  pub struct AgentStateSnapshot {
      pub tool: String,
      pub capabilities: BTreeSet<String>,
      pub is_fallback: bool,
      pub cooldown_until: Option<DateTime<Utc>>,
  }
  ```
- [ ] Ensure `PoolRegistry` is `Send + Sync` (all fields are `Send + Sync`). It will be wrapped in `Arc` by the server.

## 3. Code Review
- [ ] Verify `PoolRegistry` does not own project-specific state — it only manages pools. Projects reference pools by name.
- [ ] Verify duplicate pool name detection during construction (fail-fast).
- [ ] Verify `get_pool` returns a reference to the same `AgentPool` instance regardless of which project calls it (shared semaphore).
- [ ] Verify `PoolState` is a snapshot (cloned data) — not a reference to live state — safe for serialization to gRPC/MCP consumers.
- [ ] Verify no wire types from `devs-proto` appear in `PoolRegistry` or `PoolState` (boundary rule).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- registry` and verify all 6 tests pass.

## 5. Update Documentation
- [ ] Add doc comments explaining that `PoolRegistry` is the central shared-pool manager satisfying [1_PRD-REQ-033].
- [ ] Add `// Covers: 1_PRD-REQ-033` annotations to each test function.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./do lint` and ensure no warnings.
- [ ] Verify `// Covers: 1_PRD-REQ-033` appears in test code via `grep -r "Covers: 1_PRD-REQ-033" crates/devs-pool/`.
