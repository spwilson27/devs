# Task: Architecture & Integration Tests (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-401], [2_TAS-REQ-402], [2_TAS-REQ-600], [2_TAS-REQ-601]

## Dependencies
- depends_on: ["13_server_discovery_state_wiring.md", "11_do_script_implementation.md"]
- shared_components: [Server Discovery Protocol (consumer — discovery file), ./do Entrypoint Script & CI Pipeline (consumer — presubmit checks), devs-core (consumer — dependency audit), devs-proto (consumer — gRPC service verification)]

## 1. Initial Test Written
- [ ] Create `tests/architecture_integration_tests.rs` (E2E integration tests).
- [ ] Write integration test `test_discovery_file_path_resolution_priority`: set `DEVS_DISCOVERY_FILE`, set `server.discovery_file` in TOML, start server. Assert env var takes precedence over TOML, TOML takes precedence over default. Annotate `// Covers: 2_TAS-REQ-401`.
- [ ] Write integration test `test_discovery_file_format_content`: read discovery file, assert it contains `<host>:<port>` format. Strip whitespace, parse, connect to gRPC port. Assert successful connection. Annotate `// Covers: 2_TAS-REQ-402`.
- [ ] Write integration test `test_invalid_config_no_ports_bound`: create `devs.toml` with unknown field. Start server. Assert stderr contains all validation errors, `ss -tlnp` shows no bound ports on configured addresses. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_eaddrinuse_second_server_exits`: start server1 on port 50051. Start server2 on same port. Assert server2 exits non-zero with `EADDRINUSE` error in stderr. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_cli_connects_via_discovery`: start server, run `devs list` without `--server` flag. Assert CLI connects successfully and exits 0. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_sigterm_deletes_discovery_file`: start server, send SIGTERM. Wait for exit. Assert discovery file is deleted. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_cli_exit_code_3_server_unreachable`: stop server, run `devs list`. Assert CLI exits with code 3 and stderr contains "not reachable" or "not found". Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_simultaneous_submit_run_duplicate_handling`: spawn two `SubmitRun` gRPC calls with identical run names for same project simultaneously. Assert exactly one returns success, other returns `ALREADY_EXISTS`, no duplicate runs in `ListRuns`. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_e2e_test_isolation_discovery_files`: start two server instances with distinct `DEVS_DISCOVERY_FILE` paths. Assert neither discovery file contains the other's address. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_cargo_check_no_missing_docs`: run `cargo check --workspace` with `#![deny(missing_docs)]` active. Assert zero warnings. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_devs_core_no_io_deps`: run `cargo tree -p devs-core --edges normal`. Assert output contains no `tokio`, `git2`, `reqwest`, or `tonic`. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_missing_repo_path_logs_error_continues`: create project with non-existent `repo_path`. Start server. Assert ERROR logged for that project, `devs list` for other projects succeeds. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_restart_after_crash_stage_resets_to_eligible`: start server with stage in `Running` state, simulate crash (SIGKILL). Restart server. Assert stage transitions to `Eligible` and eventually to `Running` again. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_grpc_reflection_lists_all_services`: run `grpcurl list <server>`. Assert output contains all six service names: `devs.v1.WorkflowDefinitionService`, `devs.v1.RunService`, `devs.v1.StageService`, `devs.v1.LogService`, `devs.v1.PoolService`, `devs.v1.ProjectService`. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_mcp_state_change_visible_in_grpc`: make state change via MCP API (e.g., `cancel_run`), immediately call gRPC `GetRun`. Assert same state visible (no polling/sleep required). Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_mcp_bridge_connection_refused`: stop server, run `devs-mcp-bridge`. Assert stdout contains `{"error": "connection refused", "code": 3}` and exit code 3. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_server_config_file_not_found`: start server with `--config /nonexistent/devs.toml`. Assert stderr contains "config file not found", no ports bound. Annotate `// Covers: 2_TAS-REQ-600`.
- [ ] Write integration test `test_rust_toolchain_file_present`: assert `rust-toolchain.toml` exists at repo root, contains `channel = "stable"` with components `rustfmt`, `clippy`, `llvm-tools-preview`. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_cargo_build_workspace_all_features`: run `cargo build --workspace --all-features`. Assert exit 0. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_cargo_fmt_check_all`: run `cargo fmt --check --all`. Assert exit 0. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_cargo_clippy_workspace_all_targets`: run `cargo clippy --workspace --all-targets --all-features -- -D warnings`. Assert exit 0. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_cargo_doc_no_deps_no_warnings`: run `cargo doc --no-deps --workspace`. Assert zero warning or error lines. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_anyhow_not_in_lib_crates`: run `cargo tree` for each library crate. Assert `anyhow` does not appear in `[dependencies]`. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_unsafe_code_prohibited`: grep for `unsafe` in all `src/` directories. Assert zero matches. Run `cargo clippy` with `unsafe_code = "deny"`. Assert no warnings. Annotate `// Covers: 2_TAS-REQ-601`.
- [ ] Write integration test `test_do_setup_minimal_container`: run `./do setup` in minimal Docker container with only `git` pre-installed. Assert exit 0, all required tools (`rustc`, `cargo`, `cargo-llvm-cov`, `protoc`) on `$PATH`. Annotate `// Covers: 2_TAS-REQ-601`.

## 2. Task Implementation
- [ ] Implement E2E test infrastructure in `tests/architecture_integration_tests.rs`:
  - Use `assert_cmd` for CLI testing.
  - Use `tonic` client for gRPC testing.
  - Use `reqwest` for MCP HTTP testing.
  - Use `tempfile` for isolated test directories.
- [ ] Implement discovery file path resolution test:
  - Test env var → TOML → default priority.
  - Verify correct file is written in each case.
- [ ] Implement invalid config test:
  - Create `devs.toml` with unknown fields.
  - Start server, capture stderr.
  - Use `ss -tlnp` or equivalent to verify no ports bound.
- [ ] Implement port conflict test:
  - Start server1, then server2 on same port.
  - Verify server2 exits with `EADDRINUSE` error.
- [ ] Implement discovery-based CLI connection test:
  - Start server, run CLI without `--server`.
  - Verify successful connection.
- [ ] Implement SIGTERM discovery file deletion test:
  - Start server, send SIGTERM.
  - Verify file deleted after exit.
- [ ] Implement CLI exit code 3 test:
  - Stop server, run CLI.
  - Verify exit code 3 and appropriate error message.
- [ ] Implement simultaneous `SubmitRun` test:
  - Spawn two threads, call `SubmitRun` simultaneously.
  - Verify exactly one succeeds, other returns `ALREADY_EXISTS`.
- [ ] Implement E2E test isolation test:
  - Start two servers with distinct `DEVS_DISCOVERY_FILE`.
  - Verify isolation.
- [ ] Implement documentation completeness test:
  - Run `cargo check --workspace` with `#![deny(missing_docs)]`.
  - Verify zero warnings.
- [ ] Implement core crate dependency isolation test:
  - Run `cargo tree -p devs-core --edges normal`.
  - Verify no forbidden dependencies.
- [ ] Implement all 25 acceptance criteria tests from [2_TAS-REQ-600] and [2_TAS-REQ-601].
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify all tests use proper isolation (temp directories, unique ports).
- [ ] Verify tests clean up after themselves (no leftover processes/files).
- [ ] Verify E2E tests run with `--test-threads 1` to avoid port conflicts.
- [ ] Verify all acceptance criteria from [2_TAS-REQ-600] and [2_TAS-REQ-601] are covered.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test architecture_integration_tests` and verify all tests pass.
- [ ] Run `./do presubmit` and verify all architecture tests pass in CI context.

## 5. Update Documentation
- [ ] Add module doc comment explaining the test infrastructure.
- [ ] Document how to run individual tests.
- [ ] Document the acceptance criteria being verified.

## 6. Automated Verification
- [ ] Run `cargo test --test architecture_integration_tests --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Verify `./do presubmit` passes with these tests included.
- [ ] Verify all [2_TAS-REQ-600] and [2_TAS-REQ-601] acceptance criteria are covered.
