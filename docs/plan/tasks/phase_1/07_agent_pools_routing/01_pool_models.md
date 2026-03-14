# Task: Define Agent Pool Domain Models and Crate Scaffold (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-019]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume — BoundedString, domain error types), devs-config (consume — PoolConfig, AgentMemberConfig parsed from devs.toml), devs-pool (create — new crate)]

## 1. Initial Test Written
- [ ] Create the `devs-pool` crate under the Cargo workspace (`crates/devs-pool/`). Add `Cargo.toml` with dependencies on `devs-core` and `devs-config`. Add `#![deny(missing_docs)]` and `#![deny(unsafe_code)]` to `lib.rs`.
- [ ] In `crates/devs-pool/src/lib.rs`, write module declarations: `mod pool;`, `mod error;`, `mod routing;`, `mod registry;`. Create empty files for each.
- [ ] In `crates/devs-pool/src/pool.rs`, write the following unit tests (all should fail initially):
  - `test_agent_pool_new_from_config`: Construct an `AgentPool` from a `PoolConfig` with name `"primary"`, `max_concurrent = 4`, and 3 agents. Assert `pool.name() == "primary"`, `pool.max_concurrent() == 4`, `pool.agents().len() == 3`.
  - `test_agent_pool_preserves_agent_order`: Construct pool with agents `["claude", "opencode", "gemini"]`. Assert `pool.agents()[0].tool() == "claude"`, `pool.agents()[2].tool() == "gemini"`.
  - `test_agent_pool_exposes_agent_capabilities`: Construct pool with agent having capabilities `["code-gen", "review"]`. Assert `pool.agents()[0].capabilities()` contains both tags.
  - `test_agent_pool_agent_fallback_flag`: Construct pool with agent `fallback: true`. Assert `pool.agents()[0].is_fallback() == true`.
- [ ] In `crates/devs-pool/src/error.rs`, write a test `test_pool_error_display` that verifies `PoolError::UnknownPool { name: "x".into() }` displays a human-readable message containing the pool name.

## 2. Task Implementation
- [ ] In `crates/devs-pool/src/pool.rs`, define:
  ```rust
  /// A runtime agent pool instance constructed from configuration.
  /// Pools are shared across all projects managed by the server.
  pub struct AgentPool {
      name: String,
      max_concurrent: usize,
      agents: Vec<AgentEntry>,
      // Semaphore will be added in task 03
  }
  ```
- [ ] Define `AgentEntry` (the runtime representation of a configured agent within a pool):
  ```rust
  /// A single agent configuration within a pool, preserving declaration order.
  pub struct AgentEntry {
      tool: String,
      capabilities: BTreeSet<String>,
      fallback: bool,
      /// Rate-limit cooldown expiry. None = available.
      cooldown_until: Option<DateTime<Utc>>,
  }
  ```
- [ ] Implement `AgentPool::new(config: &PoolConfig) -> Self` that maps `PoolConfig` (from `devs-config`) into an `AgentPool`. Capability tags must be normalized to lowercase during construction.
- [ ] Implement accessor methods: `name()`, `max_concurrent()`, `agents()`, and `agents_mut()`.
- [ ] Implement `AgentEntry` accessor methods: `tool()`, `capabilities()`, `is_fallback()`, `cooldown_until()`.
- [ ] In `crates/devs-pool/src/error.rs`, define:
  ```rust
  /// Errors originating from pool operations.
  #[derive(Debug, thiserror::Error)]
  pub enum PoolError {
      #[error("unknown pool: '{name}'")]
      UnknownPool { name: String },
      #[error("unsatisfied capability tags {requested:?} — available: {available:?}")]
      UnsatisfiedCapabilities { requested: Vec<String>, available: Vec<BTreeSet<String>> },
      #[error("pool '{name}' exhausted — all agents unavailable")]
      PoolExhausted { name: String },
  }
  ```
- [ ] Re-export public types from `crates/devs-pool/src/lib.rs`.

## 3. Code Review
- [ ] Verify `devs-pool` does NOT depend on tokio, tonic, git2, or reqwest (pure domain types at this stage; semaphore added in task 03).
- [ ] Verify capability tag normalization (lowercase) happens in `AgentPool::new`, not at query time.
- [ ] Verify `AgentEntry` ordering matches the declaration order in config (Vec, not HashMap).
- [ ] Verify `devs-pool` does not re-export or depend on wire types from `devs-proto` (boundary rule 2_TAS-REQ-001G).
- [ ] Confirm `#![deny(missing_docs)]` and `#![deny(unsafe_code)]` are set.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and verify all 5 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to all public types and methods in `devs-pool`.
- [ ] Add `// Covers: 1_PRD-REQ-019` annotations to each test function.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./do lint` and ensure no clippy or doc warnings.
- [ ] Verify `// Covers: 1_PRD-REQ-019` appears in test code via `grep -r "Covers: 1_PRD-REQ-019" crates/devs-pool/`.
