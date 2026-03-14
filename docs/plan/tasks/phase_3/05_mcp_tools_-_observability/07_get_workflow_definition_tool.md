# Task: Implement get_workflow_definition MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-013]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-config (consumer)", "devs-scheduler (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/get_workflow_definition_test.rs`:
  - `test_get_workflow_definition_returns_parsed_definition`: register a project with a workflow `build` containing 3 stages, call `get_workflow_definition` with `project_id` and `workflow_name: "build"`, assert response contains full stage list with names, pools, prompts, depends_on, completion signals
  - `test_get_workflow_definition_includes_inputs`: workflow declares input params `branch: String` and `verbose: bool`, assert response includes `inputs` array with name and type
  - `test_get_workflow_definition_includes_branch_config`: workflow has branch predicates, assert they appear in the response
  - `test_get_workflow_definition_not_found`: call with nonexistent `workflow_name`, assert `not_found` error
  - `test_get_workflow_definition_project_not_found`: call with nonexistent `project_id`, assert `not_found` error

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs`, implement `get_workflow_definition` handler:
  - Accept: `project_id: String`, `workflow_name: String`
  - Look up project in registry, then find workflow definition by name
  - Serialize the full `WorkflowDefinition` as JSON including stages, inputs, branch config, fan-out config
  - Return `not_found` error if project or workflow doesn't exist
- [ ] Register in MCP tool registry

## 3. Code Review
- [ ] Verify serialized definition matches the parsed in-memory representation (round-trip fidelity)
- [ ] Verify sensitive fields (if any in workflow definitions) are not leaked

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- get_workflow_definition` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments describing the response schema

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
