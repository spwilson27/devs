# Task: Implement write_workflow_definition MCP Tool (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-045], [3_MCP_DESIGN-REQ-BR-006], [3_MCP_DESIGN-REQ-EC-CTL-005], [3_MCP_DESIGN-REQ-EC-MCP-009], [3_MCP_DESIGN-REQ-EC-MCP-015], [3_MCP_DESIGN-REQ-EC-SELF-002]

## Dependencies
- depends_on: ["01_submit_run_tool.md"]
- shared_components: ["devs-config (consumer — WorkflowDefinition parsing and validation)", "devs-scheduler (consumer — active run checks)", "devs-core (consumer — DAG validation, cycle detection)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/definition/write_workflow_tests.rs`
- [ ] **Test: `test_write_workflow_definition_success`** — Call `write_workflow_definition` with a valid workflow definition (TOML string). Assert success response and verify definition is persisted. Covers [3_MCP_DESIGN-REQ-045].
- [ ] **Test: `test_write_workflow_definition_field_presence`** — Submit a definition with a missing required field. Assert `invalid_argument` error — absent fields are a violation, not treated as null. Covers [3_MCP_DESIGN-REQ-BR-006].
- [ ] **Test: `test_write_workflow_definition_name_mismatch`** — Call with a definition whose `name` field doesn't match the `workflow_name` param. Assert `invalid_argument: workflow name mismatch` error. Covers [3_MCP_DESIGN-REQ-EC-CTL-005].
- [ ] **Test: `test_write_workflow_definition_with_cycle`** — Submit a definition where stage A depends on B and B depends on A (cycle). Assert `invalid_argument: cycle detected` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-009].
- [ ] **Test: `test_write_workflow_definition_during_active_run`** — Start a run for the workflow, then attempt to write a new definition. Assert `failed_precondition: workflow has active runs` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-015].
- [ ] **Test: `test_write_workflow_definition_during_inflight_run`** — Similar to above but with run in `Running` state. Assert update is rejected to protect snapshotted definitions. Covers [3_MCP_DESIGN-REQ-EC-SELF-002].
- [ ] **Test: `test_write_workflow_definition_atomic`** — Submit valid definition, verify old definition is fully replaced (not merged). Assert reading the definition back returns the new one exactly.

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/definition/write_workflow.rs` with `handle_write_workflow_definition`
- [ ] `WriteWorkflowParams`: `workflow_name: String`, `definition: String` (TOML content)
- [ ] Parse definition using `devs-config` parser, validate all required fields present (BR-006: absent = violation)
- [ ] Run `devs-core` DAG cycle detection on the parsed stage dependency graph
- [ ] Validate `workflow_name` matches parsed definition's `name` field
- [ ] Check scheduler for active runs of this workflow — reject with `failed_precondition` if any non-terminal runs exist
- [ ] Atomically replace the persisted workflow definition file
- [ ] Register in MCP router as `"write_workflow_definition"`

## 3. Code Review
- [ ] Verify cycle detection uses topological sort (Kahn's algorithm or DFS-based)
- [ ] Verify active run check queries all states, not just `Running`
- [ ] Verify file write is atomic (write to temp + rename)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::definition::write_workflow_tests`

## 5. Update Documentation
- [ ] Doc comments explaining atomicity, cycle detection, and active run protection

## 6. Automated Verification
- [ ] Run `./do test` — all write_workflow_definition tests pass
- [ ] Run `./do lint` — zero warnings
