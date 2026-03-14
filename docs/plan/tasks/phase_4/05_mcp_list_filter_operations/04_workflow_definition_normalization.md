# Task: Implement get_workflow Normalization (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-004] (get_workflow_definition normalization support)

## Dependencies
- depends_on: [03_list_workflows_tool.md]
- shared_components: [devs-mcp, devs-config]

## Note
- This task was previously mapped to [3_MCP_DESIGN-REQ-086], but that requirement is now covered by:
  - [3_MCP_DESIGN-REQ-086] → `09_server_restart_validation.md`

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-mcp/src/tools/get_workflow.rs` that verify:
    - `get_workflow_definition` returns a normalized representation of the workflow.
    - Fields are ordered deterministically (e.g. alphabetical keys in JSON).
    - Stages are sorted topologically by their `depends_on` relationships.
    - All optional fields that are omitted in the source TOML/YAML are explicitly present as `null` or default values in the MCP response.
    - Template variables in prompts are validated (but not resolved) during normalization.
- [ ] Write an E2E test in `tests/mcp_e2e.rs` verifying that fetching the same workflow twice returns identical JSON output.

## 2. Task Implementation
- [ ] Update `get_workflow_definition` tool handler in `devs-mcp`.
- [ ] Add a normalization layer to the `WorkflowDefinition` domain type in `devs-config`.
- [ ] Implement topological sorting for stages to ensure a consistent, predictable order.
- [ ] Ensure the JSON serialization uses sorted keys to assist AI agent consumption and comparison.
- [ ] Canonicalize all file paths (e.g., `prompt_file`) within the workflow relative to the project root.

## 3. Code Review
- [ ] Verify that normalization doesn't change the semantics of the workflow DAG.
- [ ] Check that `null` vs missing field handling is consistent across all MCP tools.
- [ ] Confirm that `get_workflow_definition` provides sufficient detail for an agent to reconstruct the workflow.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` for tool normalization logic.
- [ ] Run `cargo test -p devs-config` for the `WorkflowDefinition` normalization logic.
- [ ] Run `cargo test --test mcp_e2e` for cross-tool consistency.

## 5. Update Documentation
- [ ] Update the MCP tool documentation in `docs/plan/specs/3_mcp_design.md` to define the "normalized" format of workflow definitions.
- [ ] Note any changes to the `WorkflowDefinition` schema in the TAS.

## 6. Automated Verification
- [ ] Run `./do test` to ensure all tests pass and traceability is updated.
