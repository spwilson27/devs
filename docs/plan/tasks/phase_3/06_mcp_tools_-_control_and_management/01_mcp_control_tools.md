# Task: MCP Run and Stage Control (Pause, Resume, Cancel) (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-016], [3_MCP_DESIGN-REQ-017], [3_MCP_DESIGN-REQ-018], [3_MCP_DESIGN-REQ-067], [3_MCP_DESIGN-REQ-068], [3_MCP_DESIGN-REQ-069], [3_MCP_DESIGN-REQ-070], [3_MCP_DESIGN-REQ-BR-019], [3_MCP_DESIGN-REQ-BR-020], [3_MCP_DESIGN-REQ-BR-021], [3_MCP_DESIGN-REQ-EC-CTL-001], [3_MCP_DESIGN-REQ-EC-CTL-002], [3_MCP_DESIGN-REQ-EC-CTL-003], [3_MCP_DESIGN-REQ-EC-CTL-004], [3_MCP_DESIGN-REQ-EC-MCP-013], [3_MCP_DESIGN-REQ-EC-MCP-018]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/control_tools.rs` that attempt to call `pause_run`, `resume_run`, `cancel_run`, `pause_stage`, `resume_stage`, and `cancel_stage` via the JSON-RPC interface.
- [ ] Ensure tests cover state transition validation:
    - [ ] `pause_run` should fail if run is already paused or terminal (Failed, Completed, Cancelled).
    - [ ] `cancel_run` should be idempotent or return success if already terminal.
    - [ ] `pause_stage` should fail if stage is not in `Running` or `Eligible` status.
- [ ] Write E2E tests in `tests/mcp_control_e2e.rs` that submit a long-running mock workflow and then use the MCP client to pause and then resume it, verifying the `StageStatus` changes in the `WorkflowRun` record.

## 2. Task Implementation
- [ ] Implement `pause_run(run_id)` in `devs-mcp`:
    - [ ] Send `PauseRun` command to the scheduler.
    - [ ] Verify scheduler updates `WorkflowRun` status to `Paused` and signals active stage executors to pause.
- [ ] Implement `resume_run(run_id)` in `devs-mcp`:
    - [ ] Send `ResumeRun` command to the scheduler.
    - [ ] Verify scheduler updates `WorkflowRun` status back to `Running`.
- [ ] Implement `cancel_run(run_id)` in `devs-mcp`:
    - [ ] Send `CancelRun` command to the scheduler.
    - [ ] Verify scheduler kills active sub-processes and updates status to `Cancelled`.
- [ ] Implement corresponding stage-level tools: `pause_stage`, `resume_stage`, `cancel_stage`.
- [ ] Handle error prefixes correctly: `failed_precondition:` for invalid state transitions.

## 3. Code Review
- [ ] Verify that cancellation is atomic and correctly cleans up sub-processes (no orphaned agent processes).
- [ ] Ensure `RwLock` read guards are short-lived during state inspection for these tools.
- [ ] Check that `signal_completion` is ignored/blocked for paused stages.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test control_tools`
- [ ] Run `cargo test --test mcp_control_e2e`

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` to document the control tools and their expected error codes.

## 6. Automated Verification
- [ ] Run `./do test` and verify that all control tool requirements are marked as covered in `target/traceability.json`.
