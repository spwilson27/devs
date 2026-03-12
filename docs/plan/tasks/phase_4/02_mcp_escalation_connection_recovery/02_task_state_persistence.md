# Task: Atomic Session State Persistence (Sub-Epic: 02_MCP Escalation & Connection Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-052]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint, devs-mcp]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/agent/state.rs` that verifies atomic writing of the `task_state.json`.
- [ ] The test should:
    - [ ] Mock the filesystem MCP `write_file` tool.
    - [ ] Simulate a "mid-write failure" by interrupting the process (if possible in the test harness) or verifying that a `.tmp` file is created first.
    - [ ] Verify that the final file only exists after a successful rename/move operation.
    - [ ] Assert that the written JSON matches the `task_state.json` schema defined in §5.4.1 of the design spec.
    - [ ] Verify that all required fields (schema_version, session_id, written_at, etc.) are present.

## 2. Task Implementation
- [ ] Implement the `persist_task_state` function in the agent's state management module.
- [ ] The function MUST:
    - [ ] Use the current `session_id` to determine the directory: `.devs/agent-state/<session-id>/`.
    - [ ] Create the directory if it doesn't exist using the filesystem MCP.
    - [ ] Implement atomic writing:
        1. Write the JSON content to `task_state.json.tmp` within the same directory.
        2. Use the filesystem MCP `move_file` (or rename) tool to rename `task_state.json.tmp` to `task_state.json`.
    - [ ] Ensure that `written_at` is set to the current UTC timestamp in RFC 3339 format.
- [ ] Register a hook or ensure the agent's main loop calls `persist_task_state` at the end of every session and after any requirement is marked as completed.
- [ ] Handle errors from the filesystem MCP by logging at `ERROR` level but allowing the agent to continue if the failure is non-fatal to the current in-memory operation.

## 3. Code Review
- [ ] Verify the atomicity of the write operation to prevent corrupted state files on crash.
- [ ] Ensure that the `session_id` is a valid UUID v4.
- [ ] Check that no sensitive information (API keys, etc.) is accidentally included in the `task_state.json` (only progress and metadata).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib agent::state` and ensure the persistence tests pass.

## 5. Update Documentation
- [ ] Document the `task_state.json` persistence behavior in `docs/plan/summaries/3_mcp_design.md`.

## 6. Automated Verification
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-052" crates/devs-core/` to verify traceability.
