# Task: Stage Completion Fallback for MCP Tool Calls (Sub-Epic: 49_MIT-022)

## Covered Requirements
- [AC-RISK-022-02]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-scheduler/src/tests/completion_fallback.rs` that:
    - Sets up a `StageRun` with `completion = "mcp_tool_call"`.
    - Simulates the agent process (e.g., using a mock `AgentAdapter`) exiting with code 0 without any `devs_signal_completion` tool calls.
    - Asserts that the `StageRun` transitions to the `Completed` state (the fallback behavior).
    - Simulates another `StageRun` with `completion = "mcp_tool_call"` exiting with code 1 without any tool calls.
    - Asserts that the `StageRun` transitions to the `Failed` state.
    - **// Covers: AC-RISK-022-02**

## 2. Task Implementation
- [ ] Update the `StageRun` state transition logic in `crates/devs-core/src/state/stage_run.rs`:
    - Modify the transition from `Running` to `Completed`/`Failed` when the agent exits.
    - If the stage is in `mcp_tool_call` completion mode and the `CompletionSignal` hasn't been received yet, use the agent's exit code to determine the outcome.
- [ ] Update the `DagScheduler` in `crates/devs-scheduler/src/lib.rs` (or `engine.rs`) to handle the process termination event for `mcp_tool_call` stages:
    - Ensure that the scheduler doesn't wait indefinitely for an MCP signal that will never come from a terminated process.
    - Trigger the state machine transition based on the exit code as a fallback.

## 3. Code Review
- [ ] Verify that the fallback logic doesn't conflict with a legitimate `devs_signal_completion` call that happens right before exit.
- [ ] Ensure that the `ExitCode` is correctly propagated to the state machine.
- [ ] Confirm that logs are still collected after the fallback transition.

## 4. Run Automated Tests to Verify
- [ ] Run the fallback test: `cargo test --test completion_fallback`.
- [ ] Run overall scheduler tests to ensure no regressions in stage scheduling.

## 5. Update Documentation
- [ ] Update the project's requirement documentation or agent "memory" to reflect the fallback behavior for `mcp_tool_call` stages.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-RISK-022-02] as 100% covered.
- [ ] Check `target/coverage/report.json` to ensure the fallback transition code path is exercised.
