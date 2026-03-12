# Task: Stage Completion Handler: MCP Tool Call & Sync (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]

## Dependencies
- depends_on: [01_exit_code_completion.md]
- shared_components: [devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-scheduler` for `StageCompletionHandler::handle_mcp_signal`.
- [ ] Test scenario: `signal_completion` tool is called before process exit.
- [ ] Test scenario: process exits with code 0 before tool is called (success fallback).
- [ ] Test scenario: process exits with code 1 before tool is called (failure fallback).
- [ ] Test scenario: tool is called after process has already exited (idempotency/late signal).

## 2. Task Implementation
- [ ] Implement the `McpToolCall` logic in `devs-scheduler/src/completion.rs` as per `[2_TAS-REQ-091]`.
- [ ] Implement a mechanism to store the completion signal result if it arrives via MCP before the process exits.
- [ ] If the process exits and no MCP signal has been received, fall back to `ExitCode` logic (0 = success, non-zero = failure).
- [ ] If the MCP signal arrives after the process has already exited, ensure the first terminal signal (exit or tool) takes precedence and subsequent ones are ignored (as per `[3_PRD-BR-016]`).
- [ ] Transition the stage to `Completed` or `Failed` accordingly and record any provided output.

## 3. Code Review
- [ ] Verify that the scheduler correctly synchronizes the process exit and the async MCP signal.
- [ ] Ensure that a stage only reaches a terminal state once.
- [ ] Confirm that if the process exits with a zero code, the stage is `Completed` even without the tool call (fallback).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler`.
- [ ] Ensure that the race condition between process exit and MCP signal is handled correctly in all scenarios.

## 5. Update Documentation
- [ ] Update `devs-scheduler/README.md` to document the MCP tool call completion logic and its fallback.
- [ ] Add doc comments explaining the synchronization strategy.

## 6. Automated Verification
- [ ] Verify `[1_PRD-REQ-011]` and `[2_TAS-REQ-091]` requirement tags are present in the test source.
- [ ] Run `./do check` (or `./do lint`) to verify the code.
