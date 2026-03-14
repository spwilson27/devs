# Task: Implement Diagnosing-to-Editing Gate Protocol (Sub-Epic: 09_Agent Failure Classification)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-009]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-mcp/src/agent_state/mod.rs` (create file if missing) that simulates an agent attempting to transition from `Diagnosing` state to `Editing` state without first calling `get_stage_output`.
- [ ] The test should:
  - Initialize an agent session with `task_state.json` containing `{"state": "Diagnosing", "active_run_id": "<uuid>", "stage_output_fetched": false}`.
  - Attempt to call the `edit_file` MCP tool.
  - Assert that the MCP tool returns `{"error": "failed_precondition: get_stage_output must be called before editing"}`.
  - Assert that no file write operation was performed.
- [ ] Create a second unit test that:
  - Sets `stage_output_fetched: true` in `task_state.json`.
  - Calls `get_stage_output` mock to return `{"error": null, "output": {...}}`.
  - Attempts to call `edit_file` MCP tool.
  - Asserts the edit is permitted and proceeds normally.
- [ ] Write an E2E test in `tests/e2e/agent_protocol_tests/09_failure_classification/diagnosing_editing_gate.rs` that:
  - Submits a workflow run designed to fail (e.g., compile error).
  - Simulates an agent session that reads `task_state.json` and enters `Diagnosing` state.
  - Attempts to edit a source file before calling `get_stage_output`.
  - Verifies the MCP server rejects the edit with the correct error message.
  - Calls `get_stage_output` to retrieve the failure details.
  - Retries the edit and verifies it succeeds.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/agent_state_machine.rs` (create if missing), define the agent state enum with variants: `Locating`, `Diagnosing`, `Editing`, `Submitting`, `Monitoring`, `Completed`, `Interrupted`.
- [ ] Implement the `AgentStateMachine::transition()` method that enforces valid state transitions. The transition from `Diagnosing` to `Editing` MUST check a precondition flag `stage_output_fetched`.
- [ ] In `crates/devs-mcp/src/tools/get_stage_output.rs`, after successfully retrieving stage output, update the agent's `task_state.json` to set `stage_output_fetched: true`.
- [ ] In `crates/devs-mcp/src/tools/edit_file.rs` (or the filesystem MCP wrapper), add a pre-flight check:
  - Read the agent's `task_state.json`.
  - If `state == "Diagnosing"` and `stage_output_fetched == false`, return `Err(AgentProtocolError::StageOutputNotFetched)`.
  - Otherwise, proceed with the edit.
- [ ] Define the `AgentProtocolError` enum in `crates/devs-mcp/src/error.rs` with variant `StageOutputNotFetched` that produces the error message: `"failed_precondition: get_stage_output must be called before editing"`.
- [ ] Ensure the `task_state.json` schema includes:
  ```json
  {
    "session_id": "<uuid>",
    "state": "Diagnosing",
    "active_run_id": "<uuid-or-null>",
    "stage_output_fetched": false,
    "completed": false,
    "last_updated": "<ISO8601-UTC>"
  }
  ```

## 3. Code Review
- [ ] Verify that the state machine transition logic is centralized in `devs-core` and not duplicated in MCP tool implementations.
- [ ] Ensure the `stage_output_fetched` flag is reset to `false` when entering `Diagnosing` state from a previous run's terminal state.
- [ ] Confirm that the error message uses the `"failed_precondition:"` prefix as required by [3_MCP_DESIGN-REQ-BR-019].
- [ ] Check that the E2E test covers both the rejection path and the successful path after `get_stage_output` is called.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-core --lib agent_state_machine` to verify state transition logic.
- [ ] Run `cargo test --package devs-mcp --lib tools::get_stage_output` to verify the flag is set correctly.
- [ ] Run `cargo test --package devs-mcp --lib tools::edit_file` to verify the gate enforcement.
- [ ] Run `cargo test --test diagnostic_loop_tests::diagnosing_editing_gate` to verify the E2E behavior.
- [ ] Run `./do test` and verify all new tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `AgentStateMachine::transition()` explaining the `Diagnosing` → `Editing` gate and its rationale (prevents editing based on incomplete failure information).
- [ ] Add a section to `docs/plan/specs/3_mcp_design.md` under "Agent Protocol Rules" documenting the `get_stage_output` requirement before editing.
- [ ] Update `crates/devs-mcp/README.md` with the agent state machine diagram showing the `Diagnosing` → (`get_stage_output`) → `Editing` transition.

## 6. Automated Verification
- [ ] Run `./do test` and verify all tests pass.
- [ ] Run `.tools/verify_requirements.py --report target/traceability.json` and assert:
  - `"3_MCP_DESIGN-REQ-BR-009"` appears in the `covered` array.
  - `traceability_pct` is `100.0` (or unchanged if other requirements are still pending).
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-BR-009" tests/` and verify at least one test file contains the `// Covers: 3_MCP_DESIGN-REQ-BR-009` annotation.
- [ ] Run `jq '.covered | contains(["3_MCP_DESIGN-REQ-BR-009"])' target/traceability.json` and assert it prints `true`.
