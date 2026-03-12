# Task: Implement Capability-Based Routing and Fallback (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-020]

## Dependencies
- depends_on: [docs/plan/tasks/phase_1/07_agent_pools_routing/01_pool_models.md]
- shared_components: [devs-pool, devs-config]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-pool` for `Router::select_agent`.
- [ ] Test cases should include:
    - **Single match:** Request "code-gen", one agent in pool has it.
    - **Multiple match:** Request "code-gen", two agents have it; verify the one with higher priority (fallback order) is picked.
    - **Fallback logic:** Request "review", only the second agent has it; verify the second is picked.
    - **Capability intersection:** Request ["code-gen", "review"]; verify only agents with BOTH tags are considered.
    - **No match:** Request "unknown-tag"; verify an error is returned (Requirement [3_PRD-BR-025]).
    - **Priority override:** Ensure that "fallback: true" agents are considered *after* "primary" agents (non-fallback) within their priority bracket.

## 2. Task Implementation
- [ ] Create the `devs-pool` crate and define the `Router` struct.
- [ ] Implement `Router::select_agent(pool: &PoolConfig, required_tags: &[String]) -> Result<&AgentMemberConfig, PoolError>`.
- [ ] The routing algorithm should:
    1. Filter the `pool.agents` list to only those that contain ALL `required_tags`.
    2. If the filtered list is empty, return a `PoolError::UnsatisfiedCapabilities` which lists the requested tags and available tags.
    3. Return the FIRST agent from the filtered list (preserving the order from `devs.toml`).
- [ ] Use a standardized `PoolError` enum for error handling.

## 3. Code Review
- [ ] Verify that the router handles an empty `required_tags` list by returning the first agent in the pool (default behavior).
- [ ] Ensure the algorithm complexity is $O(N \cdot M)$ where $N$ is the number of agents and $M$ is the number of required tags (given $M$ is small, this is acceptable).
- [ ] Verify that [3_PRD-BR-025] is explicitly implemented with a clear error message.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and verify `Router` tests pass.

## 5. Update Documentation
- [ ] Document the `Router`'s selection algorithm in `devs-pool/README.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./tools/verify_requirements.py` to ensure [1_PRD-REQ-020] is covered.
