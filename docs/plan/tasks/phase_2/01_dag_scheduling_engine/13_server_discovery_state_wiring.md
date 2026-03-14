# Task: Server Discovery & State Wiring (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-140], [2_TAS-REQ-141], [2_TAS-REQ-142], [2_TAS-REQ-405], [2_TAS-REQ-409]

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md"]
- shared_components: [Server Discovery Protocol (owner — discovery file protocol), Shared State & Concurrency Patterns (owner — Arc<RwLock<T>> patterns), devs-server (owner — server binary composition), devs-core (consumer — state types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-server/tests/discovery_tests.rs` and `crates/devs-server/tests/state_wiring_tests.rs`.
- [ ] Write integration test `test_discovery_file_written_after_ports_bound`: start server, wait for startup complete. Assert discovery file exists and contains `<host>:<port>`. Annotate `// Covers: 2_TAS-REQ-140`.
- [ ] Write integration test `test_discovery_file_atomic_write`: start server, verify discovery file contains valid address. Kill server mid-write (simulate crash). Assert no partial/corrupt discovery file exists. Annotate `// Covers: 2_TAS-REQ-140`.
- [ ] Write integration test `test_discovery_file_overwrites_stale`: start server1, verify discovery file. Start server2 on different port (with server1 stopped). Assert discovery file now contains server2's address. Annotate `// Covers: 2_TAS-REQ-140`.
- [ ] Write integration test `test_discovery_file_deleted_on_sigterm`: start server, send SIGTERM. Wait for exit. Assert discovery file is deleted. Annotate `// Covers: 2_TAS-REQ-140`.
- [ ] Write integration test `test_discovery_file_path_from_env_var`: set `DEVS_DISCOVERY_FILE=/tmp/test-discovery.addr`, start server. Assert discovery file is written to that path. Annotate `// Covers: 2_TAS-REQ-140, 2_TAS-REQ-401`.
- [ ] Write integration test `test_discovery_file_path_from_toml`: set `server.discovery_file` in `devs.toml`, start server without env var. Assert discovery file is written to configured path. Annotate `// Covers: 2_TAS-REQ-401`.
- [ ] Write integration test `test_discovery_file_default_path`: no env var, no TOML config. Assert discovery file is written to `~/.config/devs/server.addr`. Annotate `// Covers: 2_TAS-REQ-401`.
- [ ] Write integration test `test_discovery_file_format`: read discovery file content. Assert it matches `<host>:<port>` format (IPv4, IPv6 in brackets, or hostname, with decimal port). Assert clients can strip whitespace and parse. Annotate `// Covers: 2_TAS-REQ-140, 2_TAS-REQ-402`.
- [ ] Write integration test `test_discovery_file_encodes_grpc_port_only`: parse discovery file, connect via gRPC. Assert MCP port is NOT in discovery file. Call `ServerService.GetInfo` to retrieve MCP port. Assert successful. Annotate `// Covers: 2_TAS-REQ-405`.
- [ ] Write integration test `test_shared_state_arc_rwlock`: start server, make gRPC `SubmitRun` call, then make MCP `submit_run` call for same run. Assert both see the same state (no duplicate runs created). Annotate `// Covers: 2_TAS-REQ-141, 2_TAS-REQ-409`.
- [ ] Write integration test `test_concurrent_submit_run_no_race`: spawn 10 threads, each calls `SubmitRun` simultaneously. Assert no data races (use Miri or ThreadSanitizer). Assert exactly one succeeds if run names collide, others return `ALREADY_EXISTS`. Annotate `// Covers: 2_TAS-REQ-409`.
- [ ] Write integration test `test_graceful_shutdown_sequence`: start server with running stage, send SIGTERM. Assert: (1) new SubmitRun returns UNAVAILABLE, (2) `devs:cancel\n` sent to agent, (3) checkpoints written, (4) discovery file deleted, (5) exit code 0. Annotate `// Covers: 2_TAS-REQ-142`.
- [ ] Write integration test `test_shutdown_flag_atomic`: during shutdown, verify `shutdown` flag is atomic (use atomic bool, not Mutex<bool>). Annotate `// Covers: 2_TAS-REQ-142`.
- [ ] Write integration test `test_weak_ref_avoids_cycle`: verify `DagScheduler` holds `Weak<AgentPoolManager>` and `McpServer` holds `Weak<DagScheduler>`. Assert dropping server does not leak memory (use leak detector or manual verification). Annotate `// Covers: 2_TAS-REQ-141`.

## 2. Task Implementation
- [ ] Implement discovery file path resolution in `crates/devs-server/src/discovery.rs`:
  - Priority: `DEVS_DISCOVERY_FILE` env var → `server.discovery_file` in `devs.toml` → `~/.config/devs/server.addr`.
  - Create parent directories if missing.
- [ ] Implement atomic discovery file write:
  - Write to `<path>.tmp` first.
  - Atomic rename to final path.
  - Write ONLY after both gRPC and MCP ports are successfully bound.
- [ ] Implement discovery file content format:
  - Serialize as `<host>:<port>` plain UTF-8 (e.g., `127.0.0.1:50051`).
  - No trailing newline required, but clients strip whitespace.
- [ ] Implement discovery file deletion on SIGTERM:
  - Delete file in shutdown sequence before exit.
  - Log ERROR if deletion fails, but still exit 0.
- [ ] Implement `ServerState` struct in `crates/devs-server/src/state.rs`:
  ```rust
  pub struct ServerState {
      pub config: Arc<ServerConfig>,
      pub scheduler: Arc<DagScheduler>,
      pub pool_manager: Arc<AgentPoolManager>,
      pub checkpoint: Arc<dyn CheckpointStore>,
      pub webhook: Arc<WebhookDispatcher>,
      pub mcp_server: Arc<McpServer>,
  }
  ```
- [ ] Wire shared state:
  - Create `Arc<RwLock<SchedulerState>>` for run/stage state.
  - Pass clones to gRPC and MCP servers.
  - `DagScheduler` holds `Weak<AgentPoolManager>` to avoid reference cycle.
  - `McpServer` holds `Weak<DagScheduler>` for same reason.
- [ ] Implement graceful shutdown sequence in `crates/devs-server/src/shutdown.rs`:
  1. Set atomic `shutdown` flag.
  2. Stop accepting new `SubmitRun` requests (return `UNAVAILABLE`).
  3. Send `devs:cancel\n` to all Running stages.
  4. Wait up to 30 seconds for stages to reach terminal/Paused state.
  5. If timeout exceeded: SIGKILL remaining agent processes.
  6. Write checkpoints for all runs.
  7. Close gRPC and MCP listeners.
  8. Delete discovery file.
  9. Exit 0.
- [ ] Ensure concurrent request handling:
  - All shared mutable state protected by `Arc<RwLock<...>>` or `Arc<Mutex<...>>`.
  - No data races possible (verified by Miri/TSan).
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify discovery file is written atomically (temp + rename).
- [ ] Verify discovery file is written ONLY after both ports bound.
- [ ] Verify weak references avoid reference cycles.
- [ ] Verify shutdown flag is atomic (not Mutex-protected).
- [ ] Verify discovery file is deleted on SIGTERM.
- [ ] Verify gRPC and MCP share the same `SchedulerState` (no separate copies).
- [ ] Verify no data races in concurrent `SubmitRun` handling.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- discovery` and verify all tests pass.
- [ ] Run `cargo test -p devs-server -- state_wiring` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-server -- -D warnings` and verify no warnings.
- [ ] Optionally run `cargo miri test -p devs-server` to verify no data races.

## 5. Update Documentation
- [ ] Add doc comments to `ServerState`, `DiscoveryFile`, and shutdown functions.
- [ ] Add module doc comment explaining discovery file protocol.
- [ ] Document the shutdown sequence and grace periods.
- [ ] Ensure `cargo doc -p devs-server --no-deps` builds without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-server -- discovery --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo test -p devs-server -- state_wiring --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-server --out json -- discovery` and verify ≥ 90% line coverage for discovery and shutdown code.
- [ ] Verify `./do presubmit` passes with these tests included.
