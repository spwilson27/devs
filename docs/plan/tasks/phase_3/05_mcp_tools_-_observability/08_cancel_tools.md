# Task: Implement cancel_run and cancel_stage MCP tools (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-016]

## Dependencies
- depends_on: [07_submit_run.md]
- shared_components: [devs-core, devs-mcp, devs-scheduler]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/tools_ctl.rs`.
- [ ] Test `cancel_run`:
    - Verify all non-terminal stages are transitioned to `Cancelled`.
    - Verify active agents receive a cancel signal (stdin write).
- [ ] Test `cancel_stage`:
    - Verify individual stage can be cancelled.
    - Test cancelling a `Waiting` stage vs a `Running` stage.

## 2. Task Implementation
- [ ] Implement `cancel_run` and `cancel_stage` handlers in `crates/devs-mcp/src/tools/ctl.rs`.
- [ ] Implement atomic cancellation in a single checkpoint write.
- [ ] Integrate with `devs-scheduler` to signal running agents.

## 3. Code Review
- [ ] Verify that `cancel_run` transitions are atomic.
- [ ] Ensure `signal_completion` is correctly handled for cancelled stages.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp`.

## 5. Update Documentation
- [ ] Ensure the cancellation behavior is documented.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
