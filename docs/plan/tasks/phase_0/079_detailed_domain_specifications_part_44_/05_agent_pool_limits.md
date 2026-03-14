# Task: Agent Pool Limits Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-474]

## Dependencies
- depends_on: []
- shared_components: ["devs-core (Consumer — add validation to domain types)"]

## 1. Initial Test Written
- [ ] In the module containing `AgentPool` (or `PoolDefinition`), write a test module `tests::agent_pool_limits` with these tests:
  - `test_max_concurrent_zero_rejected`: Set `max_concurrent = 0`. Assert validation error with range 1–1024.
  - `test_max_concurrent_1025_rejected`: Set `max_concurrent = 1025`. Assert validation error.
  - `test_max_concurrent_1_accepted`: Set `max_concurrent = 1`, agents list with one entry. Assert validation succeeds.
  - `test_max_concurrent_1024_accepted`: Set `max_concurrent = 1024`, agents list with one entry. Assert validation succeeds.
  - `test_empty_agents_list_rejected`: Set `agents = vec![]` with valid `max_concurrent`. Assert validation error indicating at least one agent required.
  - `test_single_agent_accepted`: Set `agents = vec![valid_agent]`, `max_concurrent = 4`. Assert validation succeeds.
  - `test_multiple_agents_accepted`: Set `agents = vec![agent1, agent2, agent3]`, `max_concurrent = 2`. Assert validation succeeds.
- [ ] Add `// Covers: 2_TAS-REQ-474` annotation to each test.

## 2. Task Implementation
- [ ] In the `AgentPool` struct, ensure fields `max_concurrent: u32` and `agents: Vec<AgentConfig>` exist.
- [ ] Define constants: `const MIN_MAX_CONCURRENT: u32 = 1;` and `const MAX_MAX_CONCURRENT: u32 = 1024;`.
- [ ] Implement `AgentPool::validate()`:
  - If `max_concurrent < 1 || max_concurrent > 1024`, return `OutOfRange { field: "max_concurrent", min: 1, max: 1024, actual: max_concurrent }`.
  - If `agents.is_empty()`, return `EmptyCollection { field: "agents" }`.

## 3. Code Review
- [ ] Verify range bounds are named constants.
- [ ] Verify both constraints (concurrency range and non-empty agents) are checked, and if both fail, both errors are reported (multi-error collection pattern if used elsewhere in devs-core).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- agent_pool_limits` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `AgentPool::max_concurrent` documenting the 1–1024 range and to the `agents` field documenting the non-empty invariant, referencing `2_TAS-REQ-474`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-474" crates/devs-core/` and confirm at least one match.
