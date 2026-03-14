# Task: Graceful Shutdown and Signal Handling (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [2_TAS-REQ-002], [2_TAS-REQ-066]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-checkpoint (consumer)", "Server Discovery Protocol (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/shutdown_test.rs`:
  - `test_sigterm_triggers_graceful_shutdown_sequence`: Start server, send SIGTERM, verify shutdown steps execute in order: stop new gRPC → stop new MCP → send `devs:cancel\n` to agents → wait 10s → SIGTERM agents → wait 5s → SIGKILL → flush checkpoints → delete discovery → exit 0.
  - `test_shutdown_stops_accepting_new_grpc_connections`: Start server, trigger shutdown, attempt new gRPC connection; assert connection refused.
  - `test_shutdown_sends_cancel_to_agent_stdin`: Start a mock agent subprocess, trigger shutdown, verify `devs:cancel\n` received on stdin.
  - `test_shutdown_escalation_sigterm_then_sigkill`: Start a mock agent that ignores cancel; verify SIGTERM sent after 10s, then SIGKILL after 15s.
  - `test_shutdown_flushes_checkpoint_writes`: Trigger a checkpoint write, then immediately trigger shutdown; verify the checkpoint completes before exit.
  - `test_shutdown_deletes_discovery_file`: Start server (writes discovery), trigger shutdown, verify discovery file no longer exists.
  - `test_shutdown_exits_zero`: Assert exit code 0 after clean shutdown.
  - `test_ctrl_c_triggers_same_shutdown` (cfg windows): Verify `CTRL_BREAK_EVENT` triggers the same sequence.

## 2. Task Implementation
- [ ] Register signal handlers using `tokio::signal::unix::signal(SignalKind::terminate())` on Linux/macOS and `tokio::signal::ctrl_c()` cross-platform.
- [ ] Implement `GracefulShutdown` struct that orchestrates the 9-step sequence from [2_TAS-REQ-002]:
  1. Set `accepting_connections = false` on gRPC server (use tonic's `GracefulShutdown`).
  2. Stop MCP server listener.
  3. Write `devs:cancel\n` to all active agent process stdin handles.
  4. `tokio::time::timeout(Duration::from_secs(10), wait_all_agents())`.
  5. Send `SIGTERM` to remaining agent PIDs.
  6. `tokio::time::timeout(Duration::from_secs(5), wait_remaining())`.
  7. Send `SIGKILL` to any still-running.
  8. `tokio::task::spawn_blocking` — flush all pending checkpoint git2 operations; await completion.
  9. Delete discovery file; exit 0.
- [ ] Wire the shutdown handler into the server's main select loop alongside the gRPC and MCP server futures.

## 3. Code Review
- [ ] Verify timeouts are exact (10s then 5s, not configurable — spec is explicit).
- [ ] Confirm SIGKILL is only sent after SIGTERM timeout, never preemptively.
- [ ] Ensure discovery file deletion happens even if checkpoint flush panics (use a scope guard or finally block).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- shutdown` and confirm all tests pass.

## 5. Update Documentation
- [ ] Document shutdown sequence in module-level doc comment.
- [ ] Add `// Covers: 2_TAS-REQ-002, 2_TAS-REQ-066` annotations.

## 6. Automated Verification
- [ ] Run `./do test` with zero failures.
