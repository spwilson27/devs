# Task: Implement get_pool_state and get_workflow_definition tools (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-012], [3_MCP_DESIGN-REQ-013], [3_MCP_DESIGN-REQ-EC-OBS-005], [3_MCP_DESIGN-REQ-EC-OBS-DBG-007]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-mcp, devs-pool, devs-config]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/tools_obs.rs`.
- [ ] Test `get_pool_state`:
    - Verify active agents, queued stages, and semaphore availability are returned.
    - Test pool that has never dispatched a stage. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-005]
    - Verify `available_slots` calculation.
    - Verify capability reporting. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-007]
- [ ] Test `get_workflow_definition`:
    - Verify it returns the parsed workflow definition for a valid project/workflow.
    - Test with invalid workflow name (expect `not_found`).

## 2. Task Implementation
- [ ] Implement `get_pool_state` handler in `crates/devs-mcp/src/tools/obs.rs`.
- [ ] Integrate with `devs-pool` to retrieve real-time utilization data.
- [ ] Implement `get_workflow_definition` handler in `crates/devs-mcp/src/tools/obs.rs`.
- [ ] Integrate with `devs-config` to fetch project workflows.

## 3. Code Review
- [ ] Verify that `get_pool_state` provides a point-in-time snapshot.
- [ ] Ensure `get_workflow_definition` returns the actual parsed structure, not raw text.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp`.

## 5. Update Documentation
- [ ] Ensure the tool schemas match the Design Spec.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
