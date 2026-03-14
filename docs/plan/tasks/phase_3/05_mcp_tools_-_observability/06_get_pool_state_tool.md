# Task: Implement get_pool_state MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-012], [3_MCP_DESIGN-REQ-EC-OBS-005], [3_MCP_DESIGN-REQ-EC-OBS-DBG-007]

## Dependencies
- depends_on: []
- shared_components: ["devs-pool (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/get_pool_state_test.rs`:
  - `test_get_pool_state_returns_utilization`: create pool with 4 max_concurrent and 2 active agents, call `get_pool_state`, assert response includes `active_count: 2`, `available_slots: 2`, `max_concurrent: 4`
  - `test_get_pool_state_includes_rate_limited_agents`: mark 1 agent as rate-limited, assert `rate_limited_count: 1` in response
  - `test_get_pool_state_includes_queued_stages`: queue 3 stages waiting for pool, assert `queued_count: 3`
  - `test_get_pool_state_includes_semaphore_availability`: assert `available_slots` matches `semaphore.available_permits()`
  - `test_get_pool_state_never_dispatched_pool` (EC-OBS-005): create a pool that has never dispatched any stage, call `get_pool_state`, assert `active_count: 0`, `queued_count: 0`, `rate_limited_count: 0`, `available_slots: max_concurrent` — no error returned
  - `test_get_pool_state_queued_with_capability_mismatch` (EC-OBS-DBG-007): pool has available slots but queued stages have `required_capabilities` not satisfied by any non-rate-limited agent. Assert `queued_count > 0` and `available_slots > 0` simultaneously. Response includes per-agent `capabilities` arrays so the caller can identify the mismatch
  - `test_get_pool_state_includes_per_agent_details`: assert response contains `agents` array, each element with `agent_id`, `tool`, `capabilities`, `is_rate_limited`, `is_active`

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs`, implement `get_pool_state` handler:
  - Accept: `pool_name: String`
  - Call `pool_manager.get_pool_state(&pool_name)` from shared state
  - If pool not found, return `not_found` error
  - Serialize: `pool_name`, `max_concurrent`, `active_count`, `available_slots`, `queued_count`, `rate_limited_count`, `agents` array (each with `agent_id`, `tool`, `capabilities`, `is_rate_limited`, `is_active`)
  - For pools that have never dispatched (EC-OBS-005), all counts are 0 — this is normal, not an error
- [ ] Register `get_pool_state` in MCP tool registry

## 3. Code Review
- [ ] Verify pool state snapshot is read under a single lock acquisition to avoid TOCTOU inconsistency
- [ ] Verify response exposes enough detail for capability mismatch diagnosis (EC-OBS-DBG-007)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- get_pool_state` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments describing the pool state response schema

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
