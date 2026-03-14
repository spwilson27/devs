# Task: Implement list_workflows Tool (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-003] (list_workflows tool support)

## Dependencies
- depends_on: []
- shared_components: [devs-mcp, devs-config]

## Note
- This task was previously mapped to [3_MCP_DESIGN-REQ-085], but that requirement is now covered by:
  - [3_MCP_DESIGN-REQ-085] → `08_pool_state_pre_submission.md`

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-mcp/src/tools/list_workflows.rs` that verify:
    - `list_workflows` returns all workflows configured in the system.
    - `list_workflows` accepts an optional `project_id` filter.
    - When `project_id` is provided, only workflows belonging to that project are returned.
    - Each workflow entry in the response includes name, project_id, and input declarations.
- [ ] Write an E2E test in `tests/mcp_e2e.rs` that verifies `list_workflows` returns correctly across multiple registered projects.

## 2. Task Implementation
- [ ] Add the `list_workflows` tool schema to the MCP tool registry in `devs-mcp`.
- [ ] Implement the tool handler in `devs-mcp` that queries the `ProjectRegistry` (from `devs-config`).
- [ ] Implement the `project_id` filter logic.
- [ ] Ensure the response includes the full `WorkflowDefinition` (or a summary including inputs) as required by the spec.
- [ ] Integrate with the server's gRPC `WorkflowService` if the registry is managed there.

## 3. Code Review
- [ ] Verify that `list_workflows` correctly handles cases where a project has no workflows defined.
- [ ] Ensure that workflow input schemas are included in the response to assist agents in submitting runs.
- [ ] Confirm that `project_id` values are correctly validated.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` to verify unit tests for `list_workflows`.
- [ ] Run `cargo test --test mcp_e2e` to verify the list tool through the MCP bridge.

## 5. Update Documentation
- [ ] Add `list_workflows` to the MCP tool documentation in `docs/plan/specs/3_mcp_design.md`.
- [ ] Update the PRD or TAS if necessary to reflect the new tool.

## 6. Automated Verification
- [ ] Run `./do test` to ensure all tests pass and traceability is updated.
