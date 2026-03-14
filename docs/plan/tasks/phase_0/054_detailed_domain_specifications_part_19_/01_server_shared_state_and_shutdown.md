# Task: Server Shared State Wiring and Graceful Shutdown Sequence (Sub-Epic: 054_Detailed Domain Specifications (Part 19))

## Covered Requirements
- [2_TAS-REQ-141], [2_TAS-REQ-142]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consume — Shared State & Concurrency Patterns, Server Discovery Protocol), devs-server (create server state types)]

## 1. Initial Test Written
- [ ] Create `devs-server/tests/server_state_wiring.rs` with the following tests:
  - `test_server_state_struct_fields`: Instantiate `ServerState` using mock implementations for each field. Assert all six fields (`config`, `scheduler`, `pool_manager`, `checkpoint`, `webhook`, `mcp_server`) are accessible and correctly typed as `Arc<_>`.
  - `test_dag_scheduler_holds_weak_pool_manager`: Create an `Arc<AgentPoolManager>` (mock), pass a `Weak` reference to a mock `DagScheduler` constructor. Drop the original `Arc<AgentPoolManager>`. Assert that `Weak::upgrade()` inside the scheduler returns `None`, proving no reference cycle.
  - `test_mcp_server_holds_weak_scheduler`: Create an `Arc<DagScheduler>` (mock), pass a `Weak` reference to a mock `McpServer` constructor. Drop the original `Arc<DagScheduler>`. Assert `Weak::upgrade()` returns `None`.
- [ ] Create `devs-server/tests/graceful_shutdown.rs` with the following tests:
  - `test_shutdown_sets_flag`: Trigger shutdown logic, assert the `AtomicBool` shutdown flag transitions from `false` to `true`.
  - `test_shutdown_rejects_new_requests`: After setting the shutdown flag, call the `SubmitRun` handler and assert it returns a `tonic::Code::Unavailable` error.
  - `test_shutdown_cancels_active_stages`: Register two mock running stages. Trigger shutdown. Assert both received cancel signals (`devs:cancel\n` written to their stdin mock).
  - `test_shutdown_waits_then_sigkills`: Register a mock stage that never completes. Trigger shutdown with a shortened timeout (e.g., 100ms for test speed). Assert SIGKILL is sent after timeout.
  - `test_shutdown_writes_final_checkpoints`: Trigger shutdown with mock checkpoint store. Assert `flush_all()` was called exactly once.
  - `test_shutdown_deletes_discovery_file`: Create a temporary discovery file. Trigger shutdown. Assert the file no longer exists.
  - `test_shutdown_exits_zero`: Trigger shutdown with all mocks. Assert the shutdown function returns `Ok(())` (representing exit 0).

## 2. Task Implementation
- [ ] In `devs-server/src/state.rs`, define the `ServerState` struct exactly as specified in [2_TAS-REQ-141]:
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
- [ ] Ensure `DagScheduler` constructor accepts `Weak<AgentPoolManager>` (not `Arc`) to break the reference cycle as required by [2_TAS-REQ-141].
- [ ] Ensure `McpServer` constructor accepts `Weak<DagScheduler>` (not `Arc`) to break the reference cycle as required by [2_TAS-REQ-141].
- [ ] In `devs-server/src/shutdown.rs`, implement the 9-step graceful shutdown sequence from [2_TAS-REQ-142]:
  1. Set a global `shutdown: AtomicBool` flag to `true` with `Ordering::SeqCst`.
  2. Stop accepting new `SubmitRun` requests — gRPC/MCP handlers check the flag and return `UNAVAILABLE`.
  3. Send `devs:cancel\n` to stdin of all Running agent processes via `scheduler.cancel_all_active_stages()`.
  4. Wait up to 30 seconds (`tokio::time::timeout`) for all in-flight stages to reach a terminal or `Paused` state.
  5. If timeout exceeded: send SIGKILL to remaining agent processes.
  6. Write final checkpoints for all runs via `checkpoint.flush_all()`.
  7. Close gRPC and MCP listeners (drop or explicit shutdown).
  8. Delete the discovery file (`~/.config/devs/server.addr` or `DEVS_DISCOVERY_FILE` override).
  9. Return `Ok(())` representing exit 0.
- [ ] Use `tokio::signal::unix::signal(SignalKind::terminate())` for SIGTERM detection. On Windows, use `tokio::signal::ctrl_c()` as fallback.
- [ ] Ensure `~/.config/devs/` directory is created if missing before any discovery file write (EC-C15-05).

## 3. Code Review
- [ ] Verify no `Arc` reference cycles exist — only `Weak` references where specified.
- [ ] Verify shutdown sequence handles panics in any individual step without aborting subsequent steps (use `catch_unwind` or sequential error collection).
- [ ] Verify `tokio::time::timeout` is used correctly for the 30-second drain period.
- [ ] Verify the shutdown flag uses `AtomicBool` with `SeqCst` ordering for cross-thread visibility.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- --test server_state_wiring --test graceful_shutdown`.
- [ ] Verify all 9 shutdown tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `ServerState` struct and `shutdown()` function documenting the lifecycle and ordering guarantees.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm zero failures.
- [ ] Verify traceability annotations exist: `// Covers: 2_TAS-REQ-141` on the `ServerState` struct and `// Covers: 2_TAS-REQ-142` on the shutdown function.
