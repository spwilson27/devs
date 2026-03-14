# Task: Atomic Session State Persistence (Sub-Epic: 02_MCP Escalation & Connection Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-052]
- [3_MCP_DESIGN-REQ-NEW-030]
- [3_MCP_DESIGN-REQ-NEW-031]
- [3_MCP_DESIGN-REQ-NEW-032]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (TaskState schema), devs-checkpoint (agent-state directory), devs-mcp (filesystem MCP tools)]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/agent/state.rs` (module `tests`) for atomic session state persistence.
- [ ] The tests MUST verify the following scenarios:
    - [ ] **Scenario 1: Successful atomic write**
        - [ ] Mock the filesystem MCP `write_file` tool to capture writes.
        - [ ] Create a `TaskState` struct with:
            - `schema_version: 1`
            - `session_id: "7f3a9b2c-1d4e-4f5a-8b6c-9d0e1f2a3b4c"` (valid UUID v4)
            - `written_at: "2026-03-10T14:23:05.123Z"` (RFC 3339)
            - `agent_tool: "claude"`
            - `completed_requirements: vec!["2_TAS-REQ-001".to_string(), "2_TAS-REQ-002".to_string()]`
            - `in_progress: vec![InProgress { requirement: "2_TAS-REQ-003", last_run_id: Some("..."), last_stage: Some("tdd-green"), attempt: 2 }]`
            - `blocked: vec![]`
            - `notes: None`
        - [ ] Call `persist_task_state(task_state, session_id, mcp_client)`.
        - [ ] Assert that `write_file` is called **twice**:
            1. First with path `.devs/agent-state/7f3a9b2c-1d4e-4f5a-8b6c-9d0e1f2a3b4c/task_state.json.tmp` containing the JSON.
            2. Second with a `move_file` (or `rename`) call from `.tmp` to `task_state.json`.
        - [ ] Assert that the JSON content matches the expected schema exactly.
    - [ ] **Scenario 2: Write failure leaves no corrupted file**
        - [ ] Mock `write_file` to fail on the `.tmp` write.
        - [ ] Assert that `task_state.json` is **never** created (no partial/corrupted file).
        - [ ] Assert that the error is logged at `ERROR` level.
    - [ ] **Scenario 3: Move/rename failure handling**
        - [ ] Mock `write_file` to succeed but `move_file` to fail.
        - [ ] Assert that the `.tmp` file is cleaned up (deleted) on failure.
        - [ ] Assert that `task_state.json` does not exist.
    - [ ] **Scenario 4: Schema validation on write**
        - [ ] Attempt to write a `TaskState` with `schema_version: 2`.
        - [ ] Assert that the write is rejected with `TaskStateError::InvalidSchemaVersion`.
    - [ ] **Scenario 5: Invalid session_id format**
        - [ ] Attempt to write with `session_id: "invalid-uuid"`.
        - [ ] Assert that the write is rejected with `TaskStateError::InvalidSessionId`.
    - [ ] **Scenario 6: Invalid timestamp format**
        - [ ] Attempt to write with `written_at: "not-a-timestamp"`.
        - [ ] Assert that serialization fails or the timestamp is corrected to valid RFC 3339.

## 2. Task Implementation
- [ ] Define the `TaskState` struct in `crates/devs-core/src/agent/state.rs` matching §5.4.1:
    ```rust
    pub struct TaskState {
        pub schema_version: u32,
        pub session_id: String,  // UUID v4
        pub written_at: DateTime<Utc>,  // RFC 3339
        pub agent_tool: AgentTool,  // enum: Claude, Gemini, OpenCode, Qwen, Copilot
        pub completed_requirements: Vec<String>,
        pub in_progress: Vec<InProgressTask>,
        pub blocked: Vec<BlockedTask>,
        pub notes: Option<String>,
    }

    pub struct InProgressTask {
        pub requirement: String,
        pub last_run_id: Option<String>,
        pub last_stage: Option<String>,
        pub attempt: u32,
    }

    pub struct BlockedTask {
        pub requirement: String,
        pub reason: String,
        pub depends_on: Vec<String>,
    }
    ```
- [ ] Implement the `persist_task_state` function:
    ```rust
    pub async fn persist_task_state(
        state: &TaskState,
        session_id: &str,
        mcp_client: &dyn McpClient,
    ) -> Result<(), TaskStateError>
    ```
- [ ] The function MUST:
    - [ ] Validate `schema_version == 1` before writing.
    - [ ] Validate `session_id` is a valid UUID v4 format.
    - [ ] Construct the directory path: `.devs/agent-state/<session-id>/`.
    - [ ] Call filesystem MCP `create_dir` if the directory does not exist.
    - [ ] Serialize `TaskState` to pretty-printed JSON.
    - [ ] **Atomic write sequence:**
        1. Write JSON content to `task_state.json.tmp` in the same directory.
        2. On success, call `move_file` (or `rename`) to rename `.tmp` to `task_state.json`.
        3. On move failure, delete the `.tmp` file and return error.
    - [ ] Set `written_at` to `Utc::now()` if not already set (auto-update on every write).
    - [ ] Log at `INFO` level on success: `Persisted task state to .devs/agent-state/<session-id>/task_state.json`.
    - [ ] Log at `ERROR` level on failure but do NOT panic.
- [ ] Implement a session hook:
    - [ ] Register `persist_task_state` to be called at the end of every agent session.
    - [ ] Register `persist_task_state` to be called after any requirement is marked as completed.
    - [ ] Ensure the agent's main loop triggers persistence on significant state changes.
- [ ] Implement `TaskStateError` enum with variants:
    - `InvalidSchemaVersion(u32)`
    - `InvalidSessionId(String)`
    - `IoError(String)`
    - `McpError(String)`
    - `SerializationError(String)`

## 3. Code Review
- [ ] Verify the atomicity of the write operation (tmp + rename pattern) to prevent corrupted state files on crash.
- [ ] Ensure that `session_id` is validated as UUID v4 format before use.
- [ ] Check that no sensitive information (API keys, credentials) is included in `TaskState`.
- [ ] Verify that `written_at` is always in UTC with RFC 3339 format and `Z` suffix.
- [ ] Confirm that `agent_tool` is restricted to the five allowed values: `"claude"`, `"gemini"`, `"opencode"`, `"qwen"`, `"copilot"`.
- [ ] Ensure error handling is graceful (no panics) and errors are logged appropriately.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib agent::state` and ensure all persistence tests pass.
- [ ] Run `cargo test -p devs-core --lib agent::state::tests` for module-specific tests.
- [ ] Verify that no tests are marked `#[ignore]` or `#[skip]`.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` section 5.4.1 to confirm implementation matches spec.
- [ ] Add doc comments to `TaskState`, `InProgressTask`, `BlockedTask`, and `persist_task_state` explaining their purpose.
- [ ] Document the atomic write pattern in a code comment for future maintainers.

## 6. Automated Verification
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-052" crates/devs-core/` to verify traceability annotations in implementation and tests.
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-NEW-030" crates/devs-core/` to verify agent-state directory convention is covered.
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-NEW-031" crates/devs-core/` to verify schema implementation is covered.
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-NEW-032" crates/devs-core/` to verify schema_version validation is covered.
- [ ] Run `./do test` and verify `target/traceability.json` shows these requirements as `"covered": true`.
