# Task: Discovery File Deletion on SIGTERM E2E Test (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-421]

## Dependencies
- depends_on: ["01_discovery_based_cli_connection.md"]
- shared_components: [Server Discovery Protocol, devs-server]

## 1. Initial Test Written
- [ ] Create an E2E test (e.g., `discovery_file_sigterm.rs` or add to existing discovery E2E module) that:
  1. Sets `DEVS_DISCOVERY_FILE` to a unique temp file path.
  2. Starts a `devs` server process, waits for the discovery file to appear.
  3. Asserts the discovery file exists and contains a valid `host:port` line.
  4. Sends `SIGTERM` to the server process (on Unix: `libc::kill(pid, libc::SIGTERM)`; on Windows: use `TerminateProcess` or skip with `#[cfg(unix)]`).
  5. Waits for the server process to exit.
  6. Asserts the server exited with code 0.
  7. Asserts the discovery file no longer exists on disk.
- [ ] Add `// Covers: 2_TAS-REQ-421` annotation to the test function.

## 2. Task Implementation
- [ ] In the server shutdown handler (signal handler for SIGTERM/SIGINT), add logic to delete the discovery file before exiting.
- [ ] Use `std::fs::remove_file` and log any deletion error at WARN level (do not fail the shutdown).
- [ ] Ensure the shutdown handler is registered during server startup using `tokio::signal::ctrl_c()` and/or a Unix signal listener for SIGTERM.
- [ ] Ensure the server exits with code 0 on graceful SIGTERM shutdown.

## 3. Code Review
- [ ] Verify the discovery file deletion occurs in the shutdown path, not just on normal exit — it must handle SIGTERM.
- [ ] Verify no race condition: the deletion must happen before the process exits.
- [ ] Verify the test is `#[cfg(unix)]` gated if SIGTERM is not portable.

## 4. Run Automated Tests to Verify
- [ ] Run the specific test and confirm it passes on the current platform.
- [ ] Run `./do test` and confirm no regressions.

## 5. Update Documentation
- [ ] Add doc comment to the shutdown handler explaining it deletes the discovery file per [2_TAS-REQ-421].

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm exit 0.
- [ ] Verify `// Covers: 2_TAS-REQ-421` appears via `grep -r "Covers: 2_TAS-REQ-421" tests/`.
