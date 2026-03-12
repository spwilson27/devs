# Task: MCP Runtime Workflow Definition Updates (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-019], [3_MCP_DESIGN-REQ-071], [3_MCP_DESIGN-REQ-072], [3_MCP_DESIGN-REQ-EC-CTL-005], [3_MCP_DESIGN-REQ-EC-MCP-009], [3_MCP_DESIGN-REQ-EC-MCP-015]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-config, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/workflow_update_tools.rs` for `write_workflow_definition`.
- [ ] Test cases:
    - [ ] Updating a non-existent workflow should return an error.
    - [ ] Updating a workflow with invalid TOML/YAML should return `invalid_argument: ...`.
    - [ ] Fetching the definition immediately after update (via `get_workflow_definition`) should return the new definition.
- [ ] Write E2E test in `tests/mcp_workflow_update_e2e.rs` that:
    - [ ] Submits a run for workflow "v1".
    - [ ] Updates the definition to "v2" via `write_workflow_definition`.
    - [ ] Submits a second run for the same name.
    - [ ] Verifies the first run used "v1" (via `definition_snapshot` in `get_run`) and the second run used "v2".

## 2. Task Implementation
- [ ] Implement `write_workflow_definition(workflow_name, content, format)` in `devs-mcp`:
    - [ ] Validate the provided content using `devs-config` parsers.
    - [ ] Atomically write the updated definition to the project's workflow search path (e.g., `.devs/workflows/<name>.<format>`).
    - [ ] Ensure the server's in-memory cache of definitions is updated or invalidated.
- [ ] Handle error prefixes correctly: `invalid_argument:` for parsing errors.

## 3. Code Review
- [ ] Verify that the write is atomic (write to temp file then rename) to prevent corruption during server restart.
- [ ] Ensure `get_run` returns the `definition_snapshot` from the time the run started, unaffected by subsequent `write_workflow_definition` calls.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test workflow_update_tools`
- [ ] Run `cargo test --test mcp_workflow_update_e2e`

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` to document the workflow update tool.

## 6. Automated Verification
- [ ] Run `./do test` and verify that workflow update tool requirements are covered.
