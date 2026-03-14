# Task: Implement cancel_run and cancel_stage MCP tools (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-016], [3_PRD-BR-016]

## Dependencies
- depends_on: ["10_submit_run_tool.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/cancel_test.rs`:
  - `test_cancel_run_cancels_all_non_terminal_stages`: create a run with 5 stages (2 Completed, 1 Running, 2 Waiting), call `cancel_run`, assert all non-terminal stages transition to `Cancelled` status atomically
  - `test_cancel_run_returns_cancelled_run`: after cancellation, assert response contains run with status `Cancelled`
  - `test_cancel_run_already_cancelled_returns_error`: call `cancel_run` on an already cancelled run, assert `failed_precondition` error
  - `test_cancel_run_completed_returns_error`: call `cancel_run` on a completed run, assert `failed_precondition` error
  - `test_cancel_stage_cancels_single_stage`: create a run with 3 stages, call `cancel_stage` on one Running stage, assert only that stage is cancelled
  - `test_cancel_stage_waiting_stage`: call `cancel_stage` on a Waiting stage, assert it transitions to `Cancelled`
  - `test_cancel_stage_completed_returns_error`: call `cancel_stage` on a Completed stage, assert `failed_precondition` error
  - `test_cancel_stage_atomic_checkpoint` (covers 3_PRD-BR-016 related): after cancel_stage, verify checkpoint.json reflects the cancelled status before the HTTP response is returned
  - `test_signal_completion_idempotent_first_call_succeeds` (covers 3_PRD-BR-016): stage in Running state, call `signal_completion` with output, assert stage transitions to Completed and response is success
  - `test_signal_completion_idempotent_second_call_fails` (covers 3_PRD-BR-016): after first `signal_completion` succeeds, call again with same or different output, assert `failed_precondition` error and stage state unchanged
  - `test_signal_completion_on_terminal_state_fails` (covers 3_PRD-BR-016): stage already Completed or Failed, call `signal_completion`, assert `failed_precondition` error without state mutation

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/control.rs`, implement `cancel_run` MCP tool handler:
  - Accept: `run_id: String`
  - Look up run in scheduler state
  - If run is already terminal (Completed, Failed, Cancelled), return `failed_precondition` error
  - Atomically transition all non-terminal stages to `Cancelled` in a single checkpoint write
  - Transition run to `Cancelled` status
  - Return only after checkpoint is committed
- [ ] Implement `cancel_stage` MCP tool handler:
  - Accept: `run_id: String`, `stage_name: String`
  - Look up run and stage
  - If stage is terminal, return `failed_precondition` error
  - Transition stage to `Cancelled`, checkpoint immediately
  - If stage was the last non-terminal stage, transition run to `Cancelled`
- [ ] Implement `signal_completion` MCP tool handler (3_PRD-BR-016):
  - Accept: `run_id: String`, `stage_name: String`, `output: Option<Value>`
  - Look up run and stage
  - If stage is already terminal, return `failed_precondition` error without mutating state
  - If stage is Running, transition to Completed with provided output, checkpoint atomically
  - Ensure idempotency: first call succeeds, subsequent calls fail with error and no state change
- [ ] Register all three tools in the MCP tool registry

## 3. Code Review
- [ ] Verify `cancel_run` holds a single lock across all stage transitions (atomic checkpoint)
- [ ] Verify `signal_completion` checks state before mutation (no TOCTOU race)
- [ ] Verify checkpoint write completes before HTTP response is sent
- [ ] Verify error messages include the current state for debugging

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- cancel` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments describing the atomic cancellation behavior and idempotency guarantees

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
