# Task: Shared Pool Management and Project Routing (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-033]

## Dependencies
- depends_on: [docs/plan/tasks/phase_1/07_agent_pools_routing/01_pool_models.md, docs/plan/tasks/phase_1/07_agent_pools_routing/02_routing_logic.md, docs/plan/tasks/phase_1/07_agent_pools_routing/03_concurrency_control.md]
- shared_components: [devs-pool]

## 1. Initial Test Written
- [ ] Write a test in `devs-pool` for `PoolRegistry`.
- [ ] Test cases should include:
    - Registering multiple named `AgentPool` instances.
    - Retrieving a pool by name.
    - Verifying that requesting an unknown pool name returns a `PoolError::UnknownPool` (Requirement [3_PRD-BR-007]).
    - Mock two project contexts and ensure they can both reference the same `AgentPool` instance by name from the registry.
    - Verify that `max_concurrent` is shared between these project references.

## 2. Task Implementation
- [ ] Define the `PoolRegistry` struct in `devs-pool`.
- [ ] `PoolRegistry` should manage a collection of named `AgentPool` instances.
- [ ] Implement `PoolRegistry::from_config(server_config: &ServerConfig) -> Self`.
- [ ] Implement `PoolRegistry::get_pool(&self, name: &str) -> Result<&AgentPool, PoolError>`.
- [ ] Ensure `PoolRegistry` is thread-safe (e.g., using `Arc` internally) for sharing across project threads.

## 3. Code Review
- [ ] Ensure that `PoolRegistry` initialization fails if any pool name is duplicated in the config.
- [ ] Verify that [3_PRD-BR-007] is implemented in the registry's retrieval logic.
- [ ] Check that the registry correctly maps `devs.toml` pool definitions to `AgentPool` instances.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and verify `PoolRegistry` tests pass.

## 5. Update Documentation
- [ ] Document the `PoolRegistry`'s role as the central manager for shared pools in `devs-pool/README.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./tools/verify_requirements.py` to ensure [1_PRD-REQ-033] is covered.
