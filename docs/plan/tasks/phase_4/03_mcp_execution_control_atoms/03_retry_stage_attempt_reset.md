# Task: retry_stage Manual Reset Logic (Sub-Epic: 03_MCP Execution Control & Atoms)

## Covered Requirements
- [3_MCP_DESIGN-REQ-090]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-mcp/src/tools/retry.rs` (or equivalent).
- [ ] The test MUST:
    - [ ] Create a `StageRun` that has already reached its maximum retry attempts (e.g., `attempt = 3` and `max_attempts = 3`) and is in the `Failed` status.
    - [ ] Call `retry_stage` via the MCP interface for this stage.
    - [ ] Assert that the stage's `attempt` counter is reset to `1`.
    - [ ] Verify that resetting the counter allows the stage to transition back to `Eligible` or `Waiting` state, even if it was previously considered "permanently failed."
    - [ ] Check that the reset is logged correctly in the stage's execution metadata.

## 2. Task Implementation
- [ ] Implement the `retry_stage` tool in `crates/devs-mcp/src/tools/control.rs`:
    - [ ] Accept `run_id` and `stage_name` as parameters.
    - [ ] Lookup the current `StageRun` in the `ServerState`.
    - [ ] Validate that the stage is in a terminal non-success status (`Failed`, `TimedOut`, or `Cancelled`).
    - [ ] Transition the stage to `Eligible` (or `Waiting` if dependencies require it) and set `attempt = 1`.
    - [ ] Clear any previously stored `StageOutput` for the target stage (ensuring subsequent stages see a clean slate).
    - [ ] Notify the `Scheduler` to re-process the stage.
- [ ] Return the new stage status and reset attempt number in the response.

## 3. Code Review
- [ ] Confirm that `retry_stage` is ONLY allowed through the control interface (MCP/gRPC), not automatically by the scheduler.
- [ ] Ensure that a successful `retry_stage` on one stage correctly unblocks any downstream stages that were previously `Cancelled` due to the failure.
- [ ] Check that if the stage is currently `Running` or `Paused`, the tool returns a `failed_precondition` error.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test retry_stage_reset`
- [ ] Run `./do test` and verify traceability for REQ-090.

## 5. Update Documentation
- [ ] Add `retry_stage` to the Control Tools section (§2.2.2 and §2.5.11) of `docs/plan/specs/3_mcp_design.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-090]` as covered.
