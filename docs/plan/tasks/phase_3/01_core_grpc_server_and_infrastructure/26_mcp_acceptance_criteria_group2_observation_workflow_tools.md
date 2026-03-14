# Task: MCP Acceptance Criteria Group 2 — Observation and Workflow Tool Verification (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-2.01], [3_MCP_DESIGN-REQ-AC-2.02], [3_MCP_DESIGN-REQ-AC-2.03], [3_MCP_DESIGN-REQ-AC-2.04], [3_MCP_DESIGN-REQ-AC-2.05], [3_MCP_DESIGN-REQ-AC-2.06], [3_MCP_DESIGN-REQ-AC-2.07], [3_MCP_DESIGN-REQ-AC-2.08], [3_MCP_DESIGN-REQ-AC-2.09], [3_MCP_DESIGN-REQ-AC-2.10], [3_MCP_DESIGN-REQ-AC-2.11], [3_MCP_DESIGN-REQ-AC-2.12], [3_MCP_DESIGN-REQ-AC-2.13], [3_MCP_DESIGN-REQ-AC-2.14], [3_MCP_DESIGN-REQ-AC-2.15], [3_MCP_DESIGN-REQ-AC-2.16], [3_MCP_DESIGN-REQ-AC-2.17], [3_MCP_DESIGN-REQ-AC-2.18], [3_MCP_DESIGN-REQ-AC-2.19], [3_MCP_DESIGN-REQ-AC-2.20], [3_MCP_DESIGN-REQ-AC-2.21], [3_MCP_DESIGN-REQ-AC-2.22], [3_MCP_DESIGN-REQ-AC-2.23], [3_MCP_DESIGN-REQ-AC-2.24]

## Dependencies
- depends_on: ["25_mcp_acceptance_criteria_group1_server_protocol.md"]
- shared_components: ["devs-mcp (consumer)", "devs-scheduler (consumer)", "devs-pool (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/ac_group2_test.rs` with tests for observation tools: `list_runs` returns correct run list (AC-2.01), `get_run` returns full run state (AC-2.02), `get_stage_output` returns stage output data (AC-2.03), `list_stages` returns stages for a run (AC-2.04).
- [ ] Write tests for workflow management tools: `list_workflows` returns available workflows (AC-2.05), `get_workflow` returns full definition (AC-2.06), `write_workflow_definition` persists changes (AC-2.07), `submit_run` creates and starts a new run (AC-2.08).
- [ ] Write tests for run control tools: `cancel_run` transitions run to Cancelled (AC-2.09), `pause_run` transitions to Paused (AC-2.10), `resume_run` resumes from Paused (AC-2.11).
- [ ] Write tests for pool and config observation: `get_pool_state` returns utilization (AC-2.12), `get_config` returns server config with redacted credentials (AC-2.13).
- [ ] Write tests for traceability and coverage tools: `get_traceability` returns requirement mapping (AC-2.14), `get_coverage_report` returns coverage data (AC-2.15).
- [ ] Write tests for stage control tools: `pause_stage` pauses individual stage (AC-2.16), `resume_stage` resumes paused stage (AC-2.17), `retry_stage` retries failed stage (AC-2.18), `signal_completion` marks MCP-signal stage as complete (AC-2.19), `report_progress` updates progress (AC-2.20).
- [ ] Write tests for edge cases: nonexistent run ID returns error (AC-2.21), nonexistent stage returns error (AC-2.22), invalid workflow definition rejected (AC-2.23), concurrent tool calls do not corrupt state (AC-2.24).

## 2. Task Implementation
- [ ] Implement all 20 MCP tool handlers verifying correct request/response mapping to scheduler, pool, and config APIs.
- [ ] Ensure credential redaction in `get_config` responses via `Redacted<T>`.
- [ ] Implement error handling for all edge cases (nonexistent resources, invalid inputs).
- [ ] Verify concurrent tool call safety with appropriate locking.

## 3. Code Review
- [ ] Verify all 20 tools return correct response shapes per the MCP protocol.
- [ ] Confirm credentials are never exposed in any MCP response.
- [ ] Ensure error messages are actionable and include the failing resource ID.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- ac_group2` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-AC-2.XX` annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
