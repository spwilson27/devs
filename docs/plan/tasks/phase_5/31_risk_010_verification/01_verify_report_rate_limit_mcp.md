# Task: Verify report_rate_limit MCP Tool and Attempt Preservation (Sub-Epic: 31_Risk 010 Verification)

## Covered Requirements
- [AC-RISK-010-01], [MIT-010]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-pool, devs-core]

## 1. Initial Test Written
- [ ] Write an E2E test in `devs-mcp/tests/rate_limit_e2e.rs` that:
    - Starts a mock `devs` server with a pool containing at least two agents (e.g., `claude` and `gemini`).
    - Submits a simple workflow run.
    - Captures the `StageRun` ID for the active stage.
    - Invokes the `report_rate_limit` MCP tool for that `StageRun`.
    - Asserts that the call returns successfully within 1 second.
    - Polls `get_run` via MCP and asserts that `StageRun.attempt` has NOT been incremented (should still be at its value before the rate-limit event).
    - Asserts that the stage has been re-dispatched to the fallback agent (or is `Eligible` to be so).

## 2. Task Implementation
- [ ] Ensure the `report_rate_limit` MCP tool is correctly implemented in `devs-mcp/src/tools/workflow.rs`.
- [ ] Verify the tool correctly sends a `RateLimitEvent` to the `devs-pool` manager.
- [ ] In `devs-pool`, ensure that `RateLimitEvent` is handled by transitioning the current agent to `CoolingDown` and re-queuing the stage.
- [ ] Crucially, ensure the state transition logic in `devs-core` or `devs-pool` explicitly skips incrementing the `attempt` counter for rate-limit induced re-queues (as per `[RISK-010-BR-001]`).

## 3. Code Review
- [ ] Verify that `report_rate_limit` does not require complex parameters and follows the MCP tool schema.
- [ ] Ensure the 1-second timing requirement for the fallback trigger is met by using non-blocking channels between MCP and Pool manager.
- [ ] Confirm that `StageRun.attempt` preservation is enforced in the authoritative state machine.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test rate_limit_e2e`.
- [ ] Run `cargo test --workspace` to ensure no regressions in pool management.

## 5. Update Documentation
- [ ] Update `devs-mcp` documentation to reflect the `report_rate_limit` tool's behavior regarding attempt counts.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `AC-RISK-010-01` is marked as covered in `target/traceability.json`.
