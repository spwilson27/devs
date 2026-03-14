# Task: Implement cancel_run and cancel_stage MCP Tools (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-018], [3_MCP_DESIGN-REQ-019], [3_MCP_DESIGN-REQ-BR-019], [3_MCP_DESIGN-REQ-BR-020], [3_MCP_DESIGN-REQ-EC-CTL-001], [3_MCP_DESIGN-REQ-EC-CTL-003], [3_MCP_DESIGN-REQ-EC-MCP-001]

## Dependencies
- depends_on: ["01_submit_run_tool.md"]
- shared_components: ["devs-scheduler (consumer — cancel_run, state transitions)", "devs-core (consumer — StateMachine, WorkflowRunState, StageRunState)", "devs-checkpoint (consumer — atomic checkpoint write)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/control/cancel_tests.rs`
- [ ] **Test: `test_cancel_run_success`** — Submit a run, then call `cancel_run(run_id)`. Assert run transitions to `Cancelled` and all non-terminal stages also transition to `Cancelled`. Covers [3_MCP_DESIGN-REQ-018].
- [ ] **Test: `test_cancel_run_atomic_checkpoint`** — Cancel a run with 3 stages (1 Running, 1 Eligible, 1 Completed). Assert all non-terminal stages are cancelled in a single checkpoint write (verify only one checkpoint commit is created). Covers [3_MCP_DESIGN-REQ-BR-020].
- [ ] **Test: `test_cancel_run_validates_state_machine`** — Attempt to cancel a run via `StateMachine::transition()`. Assert the transition is validated — calling cancel on a `Completed` run returns `failed_precondition` with descriptive message. Covers [3_MCP_DESIGN-REQ-BR-019], [3_MCP_DESIGN-REQ-EC-CTL-001].
- [ ] **Test: `test_cancel_stage_success`** — Cancel a single Running stage. Assert stage becomes `Cancelled` while run remains `Running` (if other stages still active). Covers [3_MCP_DESIGN-REQ-019].
- [ ] **Test: `test_cancel_stage_only_non_terminal`** — Attempt to cancel a stage that is already `Completed`. Assert `failed_precondition` error. Covers [3_MCP_DESIGN-REQ-EC-CTL-003].
- [ ] **Test: `test_cancel_run_mid_transition`** — Call `get_run` while cancel is in progress (simulate concurrent access). Assert response returns a consistent state — either pre-cancel or post-cancel, never partial. Covers [3_MCP_DESIGN-REQ-EC-MCP-001].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/control/cancel.rs` with `handle_cancel_run` and `handle_cancel_stage` functions
- [ ] `handle_cancel_run`: acquire write lock on workflow runs, validate transition via `StateMachine::transition()`, transition run + all non-terminal stages atomically, save single checkpoint
- [ ] `handle_cancel_stage`: acquire write lock, validate individual stage transition, update stage state, check if all stages are now terminal and if so transition run to terminal
- [ ] Both handlers return `failed_precondition: cannot cancel <entity> in <current_state> state` on illegal transitions
- [ ] Register both tools in MCP router: `"cancel_run"` (params: `run_id`) and `"cancel_stage"` (params: `run_id`, `stage_name`)

## 3. Code Review
- [ ] Verify atomicity: all stage cancellations + run cancellation happen under a single write lock acquisition and single checkpoint write
- [ ] Verify `StateMachine::transition()` is always called — no direct state field mutation
- [ ] Verify error messages follow `failed_precondition:` prefix convention

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::control::cancel_tests`

## 5. Update Documentation
- [ ] Add doc comments describing cancel semantics, atomicity guarantees, and state machine validation

## 6. Automated Verification
- [ ] Run `./do test` and confirm all cancel tests pass
- [ ] Run `./do lint` with zero warnings
