# Task: MCP Acceptance Criteria Group 5 — Profiling and Performance Verification (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-5.01], [3_MCP_DESIGN-REQ-AC-5.02], [3_MCP_DESIGN-REQ-AC-5.03], [3_MCP_DESIGN-REQ-AC-5.04], [3_MCP_DESIGN-REQ-AC-5.05], [3_MCP_DESIGN-REQ-AC-5.06], [3_MCP_DESIGN-REQ-AC-5.07], [3_MCP_DESIGN-REQ-AC-5.08], [3_MCP_DESIGN-REQ-AC-5.09], [3_MCP_DESIGN-REQ-AC-5.11], [3_MCP_DESIGN-REQ-AC-5.12], [3_MCP_DESIGN-REQ-AC-5.13], [3_MCP_DESIGN-REQ-AC-5.14]

## Dependencies
- depends_on: ["25_mcp_acceptance_criteria_group1_server_protocol.md"]
- shared_components: ["devs-mcp (consumer)", "devs-scheduler (consumer)", "devs-pool (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/ac_group5_test.rs` with tests for profiling: MCP tool response time under 100ms for observation tools (AC-5.01), scheduler dispatch latency observable via MCP (AC-5.02), checkpoint operation timing observable (AC-5.03).
- [ ] Write tests for performance monitoring: pool utilization percentage calculation (AC-5.04), agent fallback event counting (AC-5.05), rate limit detection event logging (AC-5.06).
- [ ] Write tests for resource usage: MCP server memory footprint within bounds (AC-5.07), concurrent MCP connections handled without degradation (AC-5.08), MCP push notification delivery latency (AC-5.09).
- [ ] Write tests for diagnostic tools: server uptime and resource stats via get_info (AC-5.11), log level adjustment at runtime (AC-5.12), internal metrics endpoint for profiling (AC-5.13), health check response under load (AC-5.14).

## 2. Task Implementation
- [ ] Implement performance metric collection infrastructure in `devs-mcp`.
- [ ] Implement profiling data exposure through MCP tool responses.
- [ ] Implement runtime log level adjustment via MCP tool.
- [ ] Implement internal metrics collection (response times, connection counts, memory usage estimates).
- [ ] Ensure observation tools meet the 100ms response time target.

## 3. Code Review
- [ ] Verify performance metrics do not introduce significant overhead.
- [ ] Confirm log level changes take effect immediately without server restart.
- [ ] Ensure metrics collection is thread-safe and lock-free where possible.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- ac_group5` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-AC-5.XX` annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
