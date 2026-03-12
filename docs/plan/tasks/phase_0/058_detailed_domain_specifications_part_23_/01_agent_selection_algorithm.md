# Task: Agent Selection Algorithm (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-161]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-pool"]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-pool/src/router.rs` (or similar) that verify the agent selection logic.
- [ ] Test case: Should filter agents whose capabilities are a superset of required capabilities.
- [ ] Test case: Should return `Err(PoolError::UnsatisfiedCapability)` if no agent matches the capabilities.
- [ ] Test case: Should exclude agents currently in rate-limit cooldown.
- [ ] Test case: On first attempt, should prefer non-fallback agents over fallback agents.
- [ ] Test case: Should use fallback agents on first attempt ONLY if all non-fallback agents are rate-limited.
- [ ] Mock the semaphore to verify that a permit is acquired before returning the selected agent config.

## 2. Task Implementation
- [ ] Implement the `AgentPool::select_agent` method (or equivalent) in the `devs-pool` crate.
- [ ] Define the `PoolError::UnsatisfiedCapability` variant in the error module.
- [ ] Implement the capability filtering logic using a bitmask or set comparison.
- [ ] Implement the cooldown check using the `Instant` from the `AgentPool` state.
- [ ] Implement the fallback priority logic: within matching agents, sort by `(is_fallback, priority)`.
- [ ] Ensure that `Arc<tokio::sync::Semaphore>::acquire_owned()` is called and the permit is returned as part of the result.

## 3. Code Review
- [ ] Verify that the algorithm strictly follows the order specified in `2_TAS-REQ-161`.
- [ ] Ensure that the capability set comparison is a superset check (agent MUST have all required capabilities, but MAY have more).
- [ ] Check that the cooldown period is correctly handled using wall-clock time.
- [ ] Verify that the semaphore permit is acquired *after* an agent is selected but *before* the result is returned.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and ensure all router tests pass.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the implementation of the agent selection algorithm and its conformance to `2_TAS-REQ-161`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the tests covering `2_TAS-REQ-161` are present and passing in the traceability report.
