# Task: Graceful Shutdown Discovery Deletion and gRPC Stream Cancellation (Sub-Epic: 016_Foundational Technical Requirements (Part 7))

## Covered Requirements
- [2_TAS-REQ-002A], [2_TAS-REQ-002B]

## Dependencies
- depends_on: [02_discovery_file_directory_creation.md]
- shared_components: [Server Discovery Protocol (consumer — implements deletion portion), devs-proto (consumer — uses gRPC service definitions)]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/shutdown.rs` (or equivalent), write a test `test_discovery_file_deleted_on_shutdown` that:
  - Starts a server instance with `DEVS_DISCOVERY_FILE` pointing to a temp path.
  - Asserts the discovery file exists after startup.
  - Sends SIGTERM (or calls the shutdown handler directly).
  - Waits for the server to exit.
  - Asserts the discovery file no longer exists on disk.
  - Asserts the process exits with code 0.
- [ ] Write a test `test_discovery_file_deletion_failure_logs_error_but_exits_zero` that:
  - Starts a server instance with `DEVS_DISCOVERY_FILE` pointing to a temp path.
  - After startup, removes write permissions on the discovery file's parent directory (or deletes the file and makes the parent read-only).
  - Triggers shutdown.
  - Captures log output and asserts an `ERROR`-level log about the deletion failure.
  - Asserts the process still exits with code 0 (not a fatal error).
- [ ] Write a test `test_inflight_grpc_streams_receive_cancelled_on_shutdown` that:
  - Starts a server instance.
  - Opens a gRPC streaming call (e.g., a stub `StreamLogs` or `StreamRunEvents` RPC, or a test-specific streaming endpoint).
  - Triggers server shutdown while the stream is active.
  - Asserts the client receives a `tonic::Code::Cancelled` status on the stream.
  - Asserts the stream is cleanly closed (no transport-level errors or hangs).
- [ ] Write a test `test_no_active_streams_shutdown_still_clean` that:
  - Starts a server, does NOT open any streaming calls.
  - Triggers shutdown.
  - Asserts clean exit with code 0 (regression guard — shutdown must not hang waiting for nonexistent streams).

## 2. Task Implementation
- [ ] In the server shutdown handler (triggered by SIGTERM / graceful shutdown signal):
  1. **gRPC stream cancellation** [2_TAS-REQ-002B]: Before stopping the tonic server, use tonic's graceful shutdown mechanism (`Server::shutdown()` or equivalent) which sends `CANCELLED` status to all in-flight streaming RPCs. If tonic does not natively cancel streams, implement a `CancellationToken` (from `tokio-util`) that is shared with all streaming RPC handlers; on shutdown, cancel the token, causing all stream handlers to send `tonic::Status::cancelled("server shutting down")` and terminate.
  2. **Discovery file deletion** [2_TAS-REQ-002A]: After the gRPC server has stopped accepting connections, call `std::fs::remove_file(discovery_path)`. If this returns `Err`, log at `ERROR` level: `"Failed to delete discovery file {path}: {err}"`. Do NOT propagate this error — the process must still exit with code 0.
  3. Proceed with remaining shutdown steps (checkpoint persistence, etc.).
- [ ] In each gRPC streaming RPC handler, accept a `CancellationToken` and select on it alongside the stream's data source. When cancelled, send `Status::cancelled("server shutting down")` and return.

## 3. Code Review
- [ ] Verify that discovery file deletion happens AFTER gRPC server stops (clients should not discover a dead server).
- [ ] Verify that deletion failure is logged at `ERROR` but does not change the exit code.
- [ ] Verify that the `CANCELLED` status code is sent to streaming clients, not `UNAVAILABLE` or `INTERNAL`.
- [ ] Verify shutdown does not hang if there are zero active streams.
- [ ] Verify the `CancellationToken` pattern (or tonic graceful shutdown) is wired into all streaming RPC handlers.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- shutdown` and confirm all four tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the shutdown handler describing the ordered shutdown sequence and referencing [2_TAS-REQ-002A] and [2_TAS-REQ-002B].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-server -- shutdown --nocapture 2>&1 | grep -c "test result: ok"` and confirm output is `1`.
- [ ] Run `cargo clippy -p devs-server -- -D warnings` and confirm zero warnings.
