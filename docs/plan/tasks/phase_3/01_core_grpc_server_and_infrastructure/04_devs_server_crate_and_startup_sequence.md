# Task: devs-server Crate and Startup Sequence (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [2_TAS-REQ-001], [2_TAS-REQ-065], [2_TAS-REQ-069]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md", "03_grpc_service_stubs_and_streaming.md"]
- shared_components: ["devs-config (consumer)", "devs-pool (consumer)", "devs-checkpoint (consumer)", "devs-scheduler (consumer)", "devs-webhook (consumer)", "./do Entrypoint Script & CI Pipeline (consumer)", "Server Discovery Protocol (owner - writer side)"]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/startup_test.rs`:
  - `test_startup_sequence_order`: Use a mock/instrumented config, pool, checkpoint, and discovery writer. Assert the startup steps execute in the exact order defined by [2_TAS-REQ-001]: parse CLI → validate config → bind gRPC → bind MCP → init pools → load projects → scan workflows → restore checkpoints → write discovery → accept connections → resume runs.
  - `test_config_validation_failure_exits_before_port_bind`: Provide invalid config; assert exit code non-zero and no port was bound.
  - `test_grpc_port_in_use_exits_nonzero`: Pre-bind the gRPC port; start server; assert `EADDRINUSE` error and non-zero exit.
  - `test_mcp_port_in_use_releases_grpc_and_exits`: Bind gRPC successfully, pre-bind MCP port; assert gRPC port is released before exit.
  - `test_checkpoint_restore_failure_logs_error_continues`: Mock one project's checkpoint restore to fail; assert server starts successfully and logs `ERROR`.
  - `test_empty_project_registry_is_valid`: Start with no projects; assert startup succeeds.
  - `test_server_owns_tokio_multi_thread_runtime`: Assert the runtime is multi-threaded (not current-thread).

## 2. Task Implementation
- [ ] Add `devs-server` crate to workspace with dependencies: `devs-grpc`, `devs-config`, `devs-pool`, `devs-checkpoint`, `devs-scheduler`, `devs-webhook`, `devs-core`, `tokio`, `tracing`.
- [ ] Implement `ServerBuilder` that wires all components together per [2_TAS-REQ-065]:
  - Multi-threaded Tokio runtime.
  - Shared scheduler (`Arc`), pool manager, checkpoint store.
  - gRPC services, MCP server task, webhook dispatcher task, retention sweep task.
- [ ] Implement the 11-step startup sequence from [2_TAS-REQ-001]:
  1. Parse CLI flags + env overrides.
  2. Locate and parse `devs.toml`; collect all validation errors in single pass; exit non-zero if any.
  3. Bind gRPC port; fail on `EADDRINUSE`.
  4. Bind MCP port; release gRPC on failure.
  5. Initialize pool manager.
  6. Load project registry (create if absent).
  7. Scan workflow definitions.
  8. Restore checkpoints (reset Running→Eligible, re-queue Waiting/Eligible/Pending; log ERROR on failure, continue).
  9. Write discovery file atomically.
  10. Accept connections on both ports.
  11. Resume recovered runs via scheduler.
- [ ] Default listen addresses: gRPC `127.0.0.1:7890`, MCP `7891` per [2_TAS-REQ-069]. Configurable via `devs.toml`, `DEVS_LISTEN`, `DEVS_MCP_PORT`.
- [ ] Implement `main.rs` binary entry point.

## 3. Code Review
- [ ] Verify the startup sequence is strictly ordered (no concurrent steps that violate the specification).
- [ ] Confirm config validation errors are collected in a single pass, not fail-fast.
- [ ] Ensure MCP port failure releases gRPC port before exit.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server` and confirm all tests pass.

## 5. Update Documentation
- [ ] Document startup sequence in module-level doc comment.
- [ ] Add `// Covers: 2_TAS-REQ-001` annotations.

## 6. Automated Verification
- [ ] Run `./do test` with zero failures for devs-server crate.
