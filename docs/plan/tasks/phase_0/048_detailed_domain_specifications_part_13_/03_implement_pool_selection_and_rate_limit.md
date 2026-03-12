# Task: Implement Pool Selection and Rate-Limit Tracking (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-113], [2_TAS-REQ-114], [2_TAS-REQ-115]

## Dependencies
- depends_on: [none]
- shared_components: [devs-pool, devs-adapters]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-pool/src/selection.rs` that verifies agent selection from a pool.
- [ ] Verify that agents are filtered by capability tags.
- [ ] Verify that an agent in a 60-second cooldown is skipped.
- [ ] Verify that the `PoolExhausted` event is emitted correctly (only once per episode).
- [ ] Mock a rate-limit report from an agent and verify it triggers a 60-second cooldown.

## 2. Task Implementation
- [ ] Implement `PoolSelectionFlow` in `devs-pool`:
    1. Filter the pool for agents that match all required capability tags.
    2. Exclude agents currently in the 60-second cooldown state.
    3. Select the highest priority agent (by order in the config).
    4. Attempt to acquire the pool semaphore.
- [ ] Implement `RateLimitCooldown` state:
    - Add a `cooldown_until: Option<Instant>` field to the agent state.
    - Implement a `report_rate_limit()` method that sets `cooldown_until` to `now + 60s`.
- [ ] Implement `PoolExhaustionEpisode` tracking:
    - Maintain an `is_exhausted` atomic boolean in `AgentPool`.
    - If no agents match the selection criteria (or all matching agents are rate-limited), set `is_exhausted = true` and fire the `PoolExhausted` webhook event.
    - When any agent becomes available again, set `is_exhausted = false`.
- [ ] Integrate with `devs-adapters`:
    - Ensure that passive rate-limit detection (exit codes/stderr) calls `report_rate_limit()`.
    - Support the `report_rate_limit` MCP call for active reporting.

## 3. Code Review
- [ ] Verify that capability matching is exact (all required tags must be present on the agent).
- [ ] Ensure that the 60-second cooldown is enforced by the pool selection logic.
- [ ] Check that the `PoolExhausted` event is truly fired only once per episode.
- [ ] Confirm that rate-limit reporting immediately frees the current pool slot and triggers a re-dispatch attempt in the scheduler.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool`.
- [ ] Ensure all pool selection and rate-limiting tests pass.

## 5. Update Documentation
- [ ] Update `devs-pool` documentation with the selection algorithm and rate-limit handling rules.

## 6. Automated Verification
- [ ] Verify traceability:
    - `// Covers: 2_TAS-REQ-113` in `devs-pool/src/selection.rs`.
    - `// Covers: 2_TAS-REQ-114` in `devs-pool/src/cooldown.rs`.
    - `// Covers: 2_TAS-REQ-115` in `devs-pool/src/exhaustion.rs`.
- [ ] Run `./do test` to confirm 100% traceability for all three requirements.
