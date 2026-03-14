# Task: Implement MCP Address Discovery Protocol (Non-Caching Across Restarts) (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: [Server Discovery Protocol, devs-mcp, devs-grpc]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/discovery_protocol_tests.rs` that verifies the following behaviors:
    1. **Test 1.1 - Discovery File Read**: Set up a mock server that writes its address to a discovery file. Verify the agent correctly reads the discovery file and connects to the address.
    2. **Test 1.2 - DEVS_DISCOVERY_FILE Env Var Priority**: Set `DEVS_DISCOVERY_FILE` to a custom path. Verify the agent reads from this path instead of the default `~/.config/devs/server.addr`.
    3. **Test 1.3 - No Caching Across Restarts (Core Test)**: 
        - Start a mock server at address A (e.g., `localhost:7890`), write discovery file
        - Agent session 1: reads discovery file, connects to address A
        - Stop server at address A, start new server at address B (e.g., `localhost:7891`), update discovery file
        - Agent session 2 (simulated restart): MUST re-read discovery file and connect to address B
        - Verify agent does NOT use cached address A from session 1
    4. **Test 1.4 - Explicit --server Flag Override**: Pass `--server localhost:9999` flag. Verify this takes precedence over discovery file.
    5. **Test 1.5 - Stale File Detection**: Write a discovery file with address `localhost:12345`. Verify the agent attempts to connect and handles connection failure gracefully (doesn't assume file is always correct).
    6. **Test 1.6 - Atomic Discovery File Write**: Verify the server writes the discovery file atomically (temp file + rename) per [2_TAS-REQ-001J].
- [ ] Use a mock server that can be started/stopped on different ports.
- [ ] Verify that each new agent session executes the full discovery protocol (not using cached values).

## 2. Task Implementation
- [ ] Implement the discovery protocol client in `crates/devs-mcp/src/discovery_client.rs`:
    - `struct DiscoveryClient` - maintains NO cached address across sessions
    - `discover_address() -> Result<String, DiscoveryError>` - executes full discovery protocol:
        1. Check `--server` flag or `DEVS_SERVER_ADDR` env var (explicit address)
        2. If no explicit address: check `DEVS_DISCOVERY_FILE` env var for custom path
        3. If `DEVS_DISCOVERY_FILE` not set: use default path `~/.config/devs/server.addr`
        4. Read discovery file content (format: `host:port` on single line)
        5. Validate format: must be valid `host:port` syntax
        6. Return address string
    - `DiscoveryError` enum: `FileNotFound`, `InvalidFormat`, `ConnectionFailed`, `PermissionDenied`
- [ ] Implement the connection verifier in `crates/devs-mcp/src/connection_verifier.rs`:
    - `verify_connection(address: &str) -> Result<(), ConnectionError>` - attempts health check connection
    - `health_check(address: &str) -> Result<HealthStatus>` - calls gRPC `GetInfo` RPC to verify server is alive
    - `HealthStatus` struct: `server_version: String`, `grpc_port: u16`, `mcp_port: u16`, `status: String`
- [ ] Implement the session manager in `crates/devs-mcp/src/session_manager.rs`:
    - `struct SessionManager` - explicitly does NOT cache address across restarts
    - `start_new_session() -> Result<Session>` - executes discovery protocol for each new session
    - `Session` struct: `session_id: Uuid`, `server_address: String`, `created_at: DateTime<Utc>`
    - On session start: log `INFO: Executing server discovery protocol for new session`
    - On session start: log `INFO: Connected to server at <address>` (with actual address, not cached)
- [ ] Implement the discovery file reader in `crates/devs-core/src/discovery_file.rs`:
    - `read_discovery_file(path: &Path) -> Result<String, DiscoveryFileError>` - reads and validates file
    - `validate_address_format(address: &str) -> Result<(), ValidationError>` - checks `host:port` syntax
    - `get_default_discovery_path() -> Result<PathBuf>` - returns `~/.config/devs/server.addr` with tilde expansion
- [ ] Update the MCP client initialization in `crates/devs-mcp/src/client.rs`:
    - Remove any static/cached address storage
    - Call `discover_address()` on every client instantiation
    - Log warning if address changes between sessions: `WARN: Server address changed from <old> to <old>`
- [ ] Implement the atomic file writer in `crates/devs-core/src/atomic_file.rs` (consumed by server):
    - `write_atomic(path: &Path, content: &str) -> Result<()>` - writes via temp file + rename
    - Ensures discovery file is never partially written

## 3. Code Review
- [ ] Verify that NO static variables or singletons cache the server address.
- [ ] Check that `discover_address()` is called on every session start, not just once per process.
- [ ] Ensure the `DEVS_DISCOVERY_FILE` env var is checked on every discovery (not cached).
- [ ] Verify that connection failures are handled gracefully (don't crash, emit structured error).
- [ ] Confirm that the discovery file format validation is strict (rejects malformed addresses).
- [ ] Check that the health check actually verifies server liveness (not just TCP connect).
- [ ] Verify that logging clearly indicates when discovery is executed and what address was found.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-mcp --test discovery_protocol_tests` to verify all behaviors.
- [ ] Manually test the discovery protocol:
    1. Start server on port 7890, start agent → verify connects to 7890
    2. Stop server, start on port 7891, restart agent → verify connects to 7891 (not cached 7890)
    3. Set `DEVS_DISCOVERY_FILE=/tmp/test_discovery`, start server → verify reads custom path
    4. Pass `--server localhost:9999` → verify ignores discovery file
- [ ] Verify that the test achieves E2E coverage through the CLI interface.

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "Server Discovery Protocol" - explain how agents locate the server
    - "Address Caching Prohibition" - explicitly state that agents MUST NOT cache addresses across restarts
    - "DEVS_DISCOVERY_FILE Environment Variable" - document test isolation usage
    - "Explicit Server Address" - document `--server` flag and `DEVS_SERVER_ADDR` env var
- [ ] Add examples of discovery protocol execution:
    ```
    INFO: Executing server discovery protocol for new session
    INFO: Reading discovery file from /home/user/.config/devs/server.addr
    INFO: Found server address: localhost:7890
    INFO: Health check passed, server version: 0.1.0
    INFO: Connected to server at localhost:7890
    ```
- [ ] Document the discovery file format:
    ```
    # Content of ~/.config/devs/server.addr
    localhost:7890
    ```
- [ ] Document error messages:
    - `DISCOVERY_ERROR: File not found at <path>`
    - `DISCOVERY_ERROR: Invalid address format - expected host:port`
    - `CONNECTION_ERROR: Health check failed at <address>`

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new discovery protocol tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-BR-004` annotation.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
- [ ] Create an E2E test that simulates agent session restart with server address change (counts toward 50% CLI E2E gate).
- [ ] Verify the E2E test sets `DEVS_DISCOVERY_FILE` to a unique temporary path for isolation (per [3_MCP_DESIGN-REQ-040]).
