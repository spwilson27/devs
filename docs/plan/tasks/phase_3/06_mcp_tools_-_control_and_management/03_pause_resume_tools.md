# Task: Implement pause_run, pause_stage, resume_run, resume_stage MCP Tools (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-020], [3_MCP_DESIGN-REQ-021], [3_MCP_DESIGN-REQ-022], [3_MCP_DESIGN-REQ-023], [3_MCP_DESIGN-REQ-BR-021], [3_MCP_DESIGN-REQ-EC-CTL-002], [3_MCP_DESIGN-REQ-EC-CTL-004], [3_MCP_DESIGN-REQ-EC-MCP-018]

## Dependencies
- depends_on: ["02_cancel_run_and_stage_tools.md"]
- shared_components: ["devs-scheduler (consumer — pause/resume state transitions)", "devs-core (consumer — StateMachine)", "devs-pool (consumer — semaphore interaction for pause)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/control/pause_resume_tests.rs`
- [ ] **Test: `test_pause_run_success`** — Submit and start a run, call `pause_run(run_id)`. Assert run state is `Paused`, all Running stages are paused, no new stages are dispatched. Covers [3_MCP_DESIGN-REQ-020].
- [ ] **Test: `test_pause_stage_success`** — Pause a single Running stage. Assert stage is `Paused`. Covers [3_MCP_DESIGN-REQ-021].
- [ ] **Test: `test_pause_stage_eligible_no_semaphore`** — Pause a stage in `Eligible` state. Assert stage becomes `Paused`, and the pool semaphore is NOT consumed (no permit acquired). Covers [3_MCP_DESIGN-REQ-BR-021].
- [ ] **Test: `test_pause_stage_on_waiting_returns_error`** — Attempt to pause a `Waiting` stage. Assert `failed_precondition` error via `StateMachine::transition()`. Covers [3_MCP_DESIGN-REQ-EC-CTL-002].
- [ ] **Test: `test_resume_run_success`** — Pause then resume a run. Assert run transitions back to `Running` and eligible stages are re-dispatched. Covers [3_MCP_DESIGN-REQ-022].
- [ ] **Test: `test_resume_stage_success`** — Pause then resume a single stage. Assert stage returns to `Running` or `Eligible`. Covers [3_MCP_DESIGN-REQ-023].
- [ ] **Test: `test_resume_run_already_running`** — Call `resume_run` on a run that is already `Running`. Assert `failed_precondition` error. Covers [3_MCP_DESIGN-REQ-EC-CTL-004].
- [ ] **Test: `test_stream_logs_during_pause`** — Pause a run, then call `stream_logs` with `follow: true`. Assert logs are still delivered for any buffered content and connection stays open. Covers [3_MCP_DESIGN-REQ-EC-MCP-018].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/control/pause_resume.rs` with four handlers: `handle_pause_run`, `handle_pause_stage`, `handle_resume_run`, `handle_resume_stage`
- [ ] `handle_pause_run`: acquire write lock, validate transition, pause run + all Running stages, prevent new stage dispatches
- [ ] `handle_pause_stage`: validate transition, if stage is `Eligible` do NOT acquire pool semaphore permit, just mark as Paused
- [ ] `handle_resume_run`: validate run is `Paused`, transition to `Running`, re-evaluate eligible stages for dispatch
- [ ] `handle_resume_stage`: validate stage is `Paused`, transition to prior dispatchable state
- [ ] All four use `StateMachine::transition()` for validation, return `failed_precondition:` on illegal transitions
- [ ] Register all four tools in MCP router

## 3. Code Review
- [ ] Verify pause of Eligible stage does not acquire pool semaphore (critical for BR-021)
- [ ] Verify resume triggers scheduler re-evaluation to dispatch newly eligible stages
- [ ] Verify all state transitions go through StateMachine validation

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::control::pause_resume_tests`

## 5. Update Documentation
- [ ] Doc comments for all four handlers with state transition diagrams in comments

## 6. Automated Verification
- [ ] Run `./do test` — all pause/resume tests pass
- [ ] Run `./do lint` — zero warnings
