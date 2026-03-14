# Task: Server Startup Sequence Validation (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-139]

## Dependencies
- depends_on: [05_discovery_file_write_protocol.md]
- shared_components: [devs-core (consumer), devs-config (consumer — config loading/validation), devs-checkpoint (consumer — checkpoint recovery), devs-pool (consumer — pool initialization), Server Discovery Protocol (consumer)]

## 1. Initial Test Written
- [ ] Create module `crates/devs-server/src/startup.rs` (or `startup_sequence.rs`) and register in `lib.rs`.
- [ ] Define a trait `StartupStep` or use a sequence of closures to make the startup steps testable and observable.
- [ ] Write these unit/integration tests (all fail-first):
  - `test_startup_step_order`: Use a `Vec<String>` recording log to track which steps execute and in what order. Mock all 14 steps to push their name onto the log. Assert the log matches the exact order from REQ-139: `["parse_cli", "load_config", "validate_config", "bind_grpc", "bind_mcp", "init_pools", "init_checkpoints", "load_runs", "write_discovery", "accept_grpc", "accept_mcp", "requeue_runs", "start_retention", "server_ready"]`.
  - `test_config_validation_failure_exits_before_port_bind`: Mock `validate_config` to return errors. Assert that `bind_grpc` is never called. Assert the function returns an error containing all config validation errors.
  - `test_grpc_bind_failure_exits_before_mcp`: Mock `bind_grpc` to return `AddrInUse`. Assert `bind_mcp` is never called. Assert the function returns an error.
  - `test_mcp_bind_failure_releases_grpc_port`: Mock `bind_mcp` to return `AddrInUse`. Assert that the gRPC listener is dropped/closed (track via a `Drop` impl or a flag). Assert the function returns an error.
  - `test_checkpoint_recovery_feeds_into_requeue`: Mock `load_all_runs` to return 3 recovered runs. Assert that `requeue_runs` receives exactly those 3 runs.
  - `test_discovery_file_written_after_both_ports_bound`: Assert that `write_discovery` is called only after both `bind_grpc` and `bind_mcp` succeed. Use the step order log to verify position.
- [ ] Tag each test with `// Covers: 2_TAS-REQ-139`.

## 2. Task Implementation
- [ ] Define a `StartupContext` struct that accumulates state across steps:
  ```rust
  struct StartupContext {
      config: Option<ServerConfig>,
      grpc_listener: Option<TcpListener>,
      mcp_listener: Option<TcpListener>,
      pool_manager: Option<AgentPoolManager>,
      checkpoint_stores: Vec<GitCheckpointStore>,
      recovered_runs: Vec<RecoveredRun>,
  }
  ```
- [ ] Implement `pub async fn run_startup(cli_args: CliArgs) -> Result<RunningServer, StartupError>` following the exact 14-step sequence from REQ-139:
  1. **Parse CLI flags** — already done by caller, passed as `cli_args`.
  2. **Load config** — call `devs_config::load_config(&cli_args.config_path)`, apply env var overrides.
  3. **Validate config** — call `config.validate()`. If errors, format all of them and return `Err(StartupError::ConfigInvalid(errors))`.
  4. **Bind gRPC port** — `TcpListener::bind(config.listen_addr).await?`. Map error to `StartupError::GrpcPortUnavailable`.
  5. **Bind MCP HTTP port** — `TcpListener::bind(config.mcp_addr).await`. On failure, drop `grpc_listener` explicitly, return `Err(StartupError::McpPortUnavailable)`.
  6. **Initialize pools** — `AgentPoolManager::from_config(&config.pools)`.
  7. **Initialize checkpoint stores** — iterate `config.projects`, create `GitCheckpointStore` for each.
  8. **Load all runs** — for each checkpoint store, call `store.load_all_runs()`. Collect into `recovered_runs`.
  9. **Write discovery file** — call `write_discovery_file(&discovery_path, grpc_addr)` (from task 05).
  10. **Start gRPC** — spawn the tonic server task using `grpc_listener`.
  11. **Start MCP** — spawn the MCP HTTP server task using `mcp_listener`.
  12. **Requeue recovered runs** — pass `recovered_runs` to the scheduler.
  13. **Start retention sweep** — spawn a background task that periodically calls `enforce_retention`.
  14. **Log "Server ready"** — `tracing::info!("Server ready")`.
- [ ] Return `RunningServer` handle containing join handles and shutdown signal.
- [ ] Define `StartupError` enum with variants for each failure mode.

## 3. Code Review
- [ ] Verify step order matches REQ-139 exactly — no reordering, no parallelization of sequential steps.
- [ ] Verify step 5 failure explicitly drops/closes the gRPC listener before returning error.
- [ ] Verify discovery file is written at step 9 (after ports bound at steps 4-5, before accepting connections at steps 10-11).
- [ ] Verify all `Arc`-wrapped shared state is created before being cloned into spawned tasks.
- [ ] No `unwrap()` or `panic!()` outside tests.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- startup` and ensure all 6 test cases pass.
- [ ] Run `cargo clippy -p devs-server -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Module-level doc comment in `startup.rs` documenting the 14-step sequence with references to REQ-139.

## 6. Automated Verification
- [ ] Run `./do lint` — must pass.
- [ ] Run `./do test` — must pass; verify `startup` tests appear in output.
- [ ] Grep for `// Covers: 2_TAS-REQ-139` to confirm traceability.
