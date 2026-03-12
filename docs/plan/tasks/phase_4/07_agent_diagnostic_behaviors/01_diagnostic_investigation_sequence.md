# Task: Implement Mandatory Diagnostic Investigation Sequence (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-027], [3_MCP_DESIGN-REQ-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-grpc]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/diagnostic_tests.rs` that mocks a stage failure and verifies the agent executes the mandatory 4-step investigation sequence:
    1. `get_stage_output` for the failed stage.
    2. `get_run` for the current run.
    3. `get_pool_state` for infrastructure status.
    4. `list_checkpoints` for the last valid state.
- [ ] Use a mock MCP server to record the call order and parameters.

## 2. Task Implementation
- [ ] Implement a diagnostic utility (e.g., in `crates/devs-cli/src/diagnose.rs`) that can be invoked by development agents upon stage failure.
- [ ] Ensure the utility performs the calls in the exact specified order: `get_stage_output` -> `get_run` -> `get_pool_state` -> `list_checkpoints`.
- [ ] Implement response aggregation logic that combines the outputs into a single diagnostic context object for the agent.
- [ ] Handle error cases where one or more MCP calls fail (e.g., server disconnected during investigation).

## 3. Code Review
- [ ] Verify that the tool does not perform any code edits or speculative changes before completing the full sequence.
- [ ] Ensure the tool uses workspace-relative paths in all MCP calls as per [3_MCP_DESIGN-REQ-BR-018].
- [ ] Verify that the tool does not cache the resolved MCP address across process restarts as per [3_MCP_DESIGN-REQ-BR-004].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test diagnostic_tests` to verify the sequence enforcement.

## 5. Update Documentation
- [ ] Document the diagnostic sequence in `docs/agent_development.md` for AI development agents.

## 6. Automated Verification
- [ ] Run `./do test --package devs-cli` and ensure all tests pass.
