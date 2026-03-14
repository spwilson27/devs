# Task: MCP Acceptance Criteria Group 3 — Control, Debug, and Stage Management (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-3.01], [3_MCP_DESIGN-REQ-AC-3.02], [3_MCP_DESIGN-REQ-AC-3.03], [3_MCP_DESIGN-REQ-AC-3.04], [3_MCP_DESIGN-REQ-AC-3.05], [3_MCP_DESIGN-REQ-AC-3.06], [3_MCP_DESIGN-REQ-AC-3.07], [3_MCP_DESIGN-REQ-AC-3.08], [3_MCP_DESIGN-REQ-AC-3.09], [3_MCP_DESIGN-REQ-AC-3.10], [3_MCP_DESIGN-REQ-AC-3.11], [3_MCP_DESIGN-REQ-AC-3.12], [3_MCP_DESIGN-REQ-AC-3.13], [3_MCP_DESIGN-REQ-AC-3.14], [3_MCP_DESIGN-REQ-AC-3.15], [3_MCP_DESIGN-REQ-AC-3.16], [3_MCP_DESIGN-REQ-AC-3.17], [3_MCP_DESIGN-REQ-AC-3.18], [3_MCP_DESIGN-REQ-AC-3.19]

## Dependencies
- depends_on: ["25_mcp_acceptance_criteria_group1_server_protocol.md"]
- shared_components: ["devs-mcp (consumer)", "devs-scheduler (consumer)", "devs-executor (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/ac_group3_test.rs` with tests for debug capabilities: agent state observation returns current agent process info (AC-3.01), working directory diff inspection returns file changes (AC-3.02), cancel signal delivery to running agent (AC-3.03).
- [ ] Write tests for stage-level control: pause individual stage (AC-3.04), resume individual stage (AC-3.05), retry failed stage with reset state (AC-3.06), stage retry respects max retry count (AC-3.07).
- [ ] Write tests for completion signal processing: MCP completion signal with success data (AC-3.08), MCP completion signal with failure data (AC-3.09), completion signal for non-MCP stage rejected (AC-3.10).
- [ ] Write tests for progress reporting: progress update with percentage (AC-3.11), progress update with status message (AC-3.12), progress visible in get_run response (AC-3.13).
- [ ] Write tests for Glass-Box observability: full internal state accessible (AC-3.14), log streaming via MCP (AC-3.15), pool state observable (AC-3.16), workflow definition readable at runtime (AC-3.17), workflow definition writable at runtime (AC-3.18), checkpoint state observable (AC-3.19).

## 2. Task Implementation
- [ ] Implement debug tool handlers for agent state observation and working directory diff.
- [ ] Implement stage-level control with proper state machine transition validation.
- [ ] Implement MCP completion signal processing integrated with the scheduler.
- [ ] Implement progress reporting with persistent state updates.
- [ ] Ensure Glass-Box observability exposes all internal state categories.

## 3. Code Review
- [ ] Verify state transitions triggered by MCP tools follow the same rules as internal transitions.
- [ ] Confirm working directory diff does not expose sensitive file contents.
- [ ] Ensure progress updates are non-blocking and do not impact scheduler performance.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- ac_group3` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-AC-3.XX` annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
