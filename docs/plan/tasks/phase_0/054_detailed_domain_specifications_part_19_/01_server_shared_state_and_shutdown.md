# Task: Server Shared State and Graceful Shutdown Sequence (Sub-Epic: 054_Detailed Domain Specifications (Part 19))

## Covered Requirements
- [2_TAS-REQ-141], [2_TAS-REQ-142]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-server]

## 1. Initial Test Written
- [ ] In `devs-server`, create an integration test `tests/test_shutdown.rs` that:
    - Instantiates a mock `ServerState`.
    - Spawns a background task representing the server's main loop.
    - Sends a simulated SIGTERM signal.
    - Asserts that the 9-step sequence is initiated:
        1.  `shutdown` flag is set.
        2.  New requests are rejected.
        3.  Cancel signals are sent to active stages.
        4.  Discovery file is deleted.
    - Verifies the process exits with status 0 within the timeout.

## 2. Task Implementation
- [ ] In `devs-server/src/state.rs`, define the `ServerState` struct as specified in **[2_TAS-REQ-141]**:
    ```rust
    pub struct ServerState {
        pub config:         Arc<ServerConfig>,
        pub scheduler:      Arc<DagScheduler>,
        pub pool_manager:   Arc<AgentPoolManager>,
        pub checkpoint:     Arc<dyn CheckpointStore>,
        pub webhook:        Arc<WebhookDispatcher>,
        pub mcp_server:     Arc<McpServer>,
    }
    ```
    - Ensure `DagScheduler` holds a `Weak<AgentPoolManager>`.
    - Ensure `McpServer` holds a `Weak<DagScheduler>`.
- [ ] In `devs-server/src/lib.rs` (or the server's main runner), implement the SIGTERM handler:
    - Use `tokio::signal::unix::signal` for SIGTERM detection.
    - Implement the 9-step shutdown sequence from **[2_TAS-REQ-142]**:
        1.  Set global `shutdown` atomic bool.
        2.  Transition gRPC/MCP listeners to reject new `SubmitRun` requests with `UNAVAILABLE`.
        3.  Invoke `scheduler.cancel_all_active_stages()`.
        4.  Await completion/timeout (30s).
        5.  Send SIGKILL to any remaining agent processes if timeout exceeded.
        6.  Flush final checkpoints via `checkpoint.flush_all()`.
        7.  Close all listeners.
        8.  Delete the discovery file (atomically via temp + rename if needed, but here simple delete is usually fine).
        9.  Exit 0.
- [ ] Implement EC-C15-05: Ensure `~/.config/devs/` is created if missing before writing the discovery file.

## 3. Code Review
- [ ] Verify that `Arc` usage is correct and no reference cycles are introduced (using `Weak` where specified).
- [ ] Verify that the shutdown sequence is robust against panics in any step.
- [ ] Ensure `tokio::select!` or similar is used correctly to handle the 30-second timeout.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server`.
- [ ] Manually verify the discovery file is deleted by starting/stopping the server skeleton.

## 5. Update Documentation
- [ ] Update `devs-server` README to document the graceful shutdown behavior and signal handling.

## 6. Automated Verification
- [ ] Run `./do presubmit` to ensure no linting or formatting errors were introduced.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-141], [2_TAS-REQ-142]` in the implementation.
