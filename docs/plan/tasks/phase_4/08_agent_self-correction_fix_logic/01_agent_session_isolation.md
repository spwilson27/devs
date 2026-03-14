# Task: Implement Agent Session Isolation and Discovery Protocol (Sub-Epic: 08_Agent Self-Correction & Fix Logic)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-003], [3_MCP_DESIGN-REQ-BR-008]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create test file `crates/devs-cli/tests/e2e/agent_session_isolation_tests.rs` with the following test functions:
    1. `test_session_id_is_uuidv4()`: Start the CLI agent, capture the generated session ID, and assert it matches the UUIDv4 regex pattern `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` (case-insensitive).
    2. `test_devs_discovery_file_takes_precedence()`: 
        - Start two separate `devs-server` instances on different ports (e.g., 7890 and 7892).
        - Write server A's address to a temp file `/tmp/test_discovery_a.txt` and server B's address to `/tmp/test_discovery_b.txt`.
        - Set `DEVS_DISCOVERY_FILE=/tmp/test_discovery_a.txt` in the environment and start `devs-cli`.
        - Assert that `devs-cli` connects to server A (port 7890), not server B or the default `~/.config/devs/server.addr`.
        - Repeat with `DEVS_DISCOVERY_FILE=/tmp/test_discovery_b.txt` and assert connection to server B.
    3. `test_parallel_agents_with_isolated_discovery()`:
        - Start two servers on different ports.
        - Spawn two agent processes concurrently, each with a different `DEVS_DISCOVERY_FILE`.
        - Assert that both agents connect successfully to their respective servers without address collision.
        - Verify each agent creates its own `.devs/agent-state/<session-id>/` directory.
    4. `test_session_id_stable_across_interruption()`:
        - Start an agent, capture its session ID from logs or state file.
        - Simulate an interruption (send SIGINT or kill process).
        - Restart the agent in the same working directory.
        - Assert that the restarted agent reads the existing `task_state.json` and resumes with the same session ID.

## 2. Task Implementation
- [ ] **Step 2.1: Create session module**
    - Create `crates/devs-cli/src/session.rs` with:
        - `pub struct SessionState { pub session_id: String, pub task_state_path: PathBuf }`
        - `pub fn generate_session_id() -> String` using `uuid::Uuid::new_v4().to_string()`
        - `pub fn load_or_create_session(working_dir: &Path) -> Result<SessionState>` that:
            - Checks for existing `.devs/agent-state/<session-id>/task_state.json`
            - If found, extracts session_id from path and returns it
            - If not found, generates new UUIDv4, creates directory, writes initial `task_state.json`
    
- [ ] **Step 2.2: Update discovery protocol**
    - Modify `crates/devs-grpc/src/discovery.rs`:
        - Add `pub fn resolve_server_address() -> Result<String>` that:
            - First checks `std::env::var("DEVS_DISCOVERY_FILE")`
            - If set, reads address from that file path
            - If not set, falls back to `~/.config/devs/server.addr`
            - Returns error if neither file exists
        - Add validation: if `DEVS_DISCOVERY_FILE` is set but file is missing, return error `"DEVS_DISCOVERY_FILE is set but file does not exist: {path}"`
    
- [ ] **Step 2.3: Integrate session into CLI startup**
    - In `crates/devs-cli/src/main.rs` or agent startup routine:
        - Call `load_or_create_session(&working_dir)` at startup
        - Store session_id in application state
        - Pass session_id to all downstream orchestration logic
        - Log session_id at INFO level for debugging
    
- [ ] **Step 2.4: Create agent-state directory structure**
    - Ensure directory `.devs/agent-state/<session-id>/` is created with proper permissions
    - Write initial `task_state.json` with schema:
        ```json
        {
          "schema_version": 1,
          "session_id": "<uuid>",
          "created_at": "<ISO8601>",
          "state": "Locating",
          "current_task": null
        }
        ```

## 3. Code Review
- [ ] Verify that `DEVS_DISCOVERY_FILE` takes absolute precedence — no fallback to default path when env var is set (even if file is missing).
- [ ] Confirm UUID generation uses `uuid` crate with `v4` feature (cryptographically secure RNG).
- [ ] Ensure session_id is passed to all orchestrated sub-tasks and appears in all log lines for traceability.
- [ ] Verify that session directory creation handles concurrent access (two agents starting simultaneously don't collide).
- [ ] Check that error messages are actionable and include the exact file paths involved.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --test agent_session_isolation_tests -- --nocapture`
- [ ] Run `./do test --package devs-cli` to ensure no regressions in other CLI tests.
- [ ] Verify test output shows both agents connecting to their respective servers in parallel test.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` §4.2 (Server Discovery) to clarify:
    - `DEVS_DISCOVERY_FILE` is mandatory for E2E test isolation
    - Session ID generation and directory structure under `.devs/agent-state/`
- [ ] Add a note to `docs/plan/requirements/3_mcp_design.md` under REQ-BR-003 and REQ-BR-008 linking to this task document.

## 6. Automated Verification
- [ ] Run `./do presubmit` and ensure it passes (includes format, lint, test, coverage).
- [ ] Verify `target/traceability.json` includes both `3_MCP_DESIGN-REQ-BR-003` and `3_MCP_DESIGN-REQ-BR-008` as covered.
- [ ] Run `./do coverage --package devs-cli` and verify new test file has >90% line coverage.
