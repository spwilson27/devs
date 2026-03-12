# Task: Integration - Unified State Consistency Verification (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-430]

## Dependencies
- depends_on: [02_server_config_path_validation.md, 03_mcp_bridge_error_handling.md]
- shared_components: [devs-server, devs-grpc, devs-mcp, devs-scheduler]

## 1. Initial Test Written
- [ ] Create a new E2E test in `tests/e2e/state_consistency.rs` that starts a `devs-server` instance.
- [ ] Submit a workflow run via the gRPC `RunService.SubmitRun` RPC.
- [ ] Call the MCP `cancel_run` tool to cancel the submitted run.
- [ ] Immediately (within the same test flow, no sleep) call gRPC `RunService.GetRun` and assert that the status is `Cancelled`.
- [ ] Verify that no intermediate polling or delays are required for this check to pass.

## 2. Task Implementation
- [ ] In `devs-server/src/main.rs`, ensure that a single `Arc<RwLock<SchedulerState>>` is instantiated.
- [ ] Pass clones of this `Arc` to both the gRPC server initialization (in `devs-grpc`) and the MCP server initialization (in `devs-mcp`).
- [ ] Verify that both `RunService` (gRPC) and the MCP Observation/Control tools use the exact same state instance.
- [ ] Ensure that state transitions are synchronous and visible across all clones of the `Arc`.

## 3. Code Review
- [ ] Confirm that no component maintains a separate "shadow" copy of the run state.
- [ ] Verify that gRPC and MCP methods both correctly use `read()` and `write()` guards on the shared `SchedulerState`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test state_consistency` and ensure it passes consistently without race conditions.
- [ ] Run with `tokio-test` if needed to verify scheduler tick behavior.

## 5. Update Documentation
- [ ] Document the "Glass-Box" state sharing mechanism in `MEMORY.md` to reinforce the architectural pattern for future agent work.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure all requirements are mapped and covered.
