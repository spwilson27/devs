# Task: Server SIGTERM Handler Flushes LLVM Coverage Data Before Exit (Sub-Epic: 51_MIT-023)

## Covered Requirements
- [MIT-023], [AC-RISK-023-03]

## Dependencies
- depends_on: [01_e2e_subprocess_helper_llvm_profile.md]
- shared_components: [devs-grpc]

## 1. Initial Test Written

- [ ] In `crates/devs-server/tests/e2e/shutdown_coverage_e2e.rs`, write an E2E integration test `test_sigterm_produces_nonempty_profraw` that:
  1. Uses `SpawnHelper` from `devs-test-helpers` to spawn the `devs-server` binary with `LLVM_PROFILE_FILE=/tmp/devs-coverage-%p.profraw`.
  2. Records the child PID immediately after spawn.
  3. Waits for the server to become ready (poll the well-known `~/.config/devs/server.addr` file or a health gRPC endpoint with a 5-second timeout).
  4. Sends `SIGTERM` to the child process using `nix::sys::signal::kill(Pid::from_raw(pid), Signal::SIGTERM)` (on Unix) or the equivalent on Windows.
  5. Waits for the child to exit with `child.wait()` with a 10-second timeout.
  6. Constructs the expected `.profraw` path: `/tmp/devs-coverage-<PID>.profraw`.
  7. Asserts that the file exists AND that its size in bytes is greater than 0.
  8. Annotate the test: `// Covers: AC-RISK-023-03, MIT-023`.
- [ ] Write a unit test `test_sigterm_handler_registered` in `crates/devs-server/src/shutdown.rs` (or a new `shutdown.rs` module):
  1. Verify at compile time that the shutdown module exposes a `register_sigterm_handler()` function that returns `Result<(), ShutdownError>`.
  2. This is a compile-time linkage check, not a runtime signal test.
  3. Annotate: `// Covers: MIT-023`.
- [ ] Write a unit test `test_coverage_flush_called_on_shutdown` using a mock or feature flag approach:
  1. If compiled with `cfg(coverage)` (set by `cargo-llvm-cov`), assert that `flush_coverage_data()` is called during the shutdown sequence.
  2. Use a `std::sync::atomic::AtomicBool` flag set to `true` in a test-only hook called from the flush function.
  3. Annotate: `// Covers: AC-RISK-023-03`.

## 2. Task Implementation

- [ ] Create `crates/devs-server/src/shutdown.rs` (or extend the existing server main/shutdown module):
  ```rust
  // Covers: MIT-023, AC-RISK-023-03

  /// Registers an OS-level SIGTERM handler that performs a clean shutdown,
  /// including flushing LLVM coverage data when compiled under cargo-llvm-cov.
  pub fn register_sigterm_handler(shutdown_tx: tokio::sync::broadcast::Sender<()>)
      -> Result<(), ShutdownError>
  {
      #[cfg(unix)]
      {
          use tokio::signal::unix::{signal, SignalKind};
          let mut sigterm = signal(SignalKind::terminate())?;
          tokio::spawn(async move {
              sigterm.recv().await;
              flush_coverage_data();
              let _ = shutdown_tx.send(());
          });
      }
      #[cfg(windows)]
      {
          use tokio::signal::ctrl_c;
          tokio::spawn(async move {
              let _ = ctrl_c().await;
              flush_coverage_data();
              let _ = shutdown_tx.send(());
          });
      }
      Ok(())
  }

  /// Flushes LLVM coverage counters to disk.
  /// Only has effect when the binary is built with cargo-llvm-cov instrumentation
  /// (i.e., the `__llvm_profile_write_file` symbol is present in the binary).
  fn flush_coverage_data() {
      #[cfg(coverage)]
      unsafe {
          extern "C" {
              fn __llvm_profile_write_file() -> i32;
          }
          __llvm_profile_write_file();
      }
  }
  ```
- [ ] In `crates/devs-server/src/main.rs`, call `register_sigterm_handler(shutdown_tx.clone())?` during server startup, before entering the main service loop.
- [ ] Ensure the `shutdown_tx` broadcast channel is drained and all in-flight gRPC requests complete before the process returns from `main` (existing graceful shutdown logic should already handle this; verify it does).
- [ ] Add a `.cargo/config.toml` entry (or use a `build.rs` script) to pass `--cfg coverage` to `rustc` when `CARGO_LLVM_COV` environment variable is set, so the `#[cfg(coverage)]` gate activates:
  ```toml
  # .cargo/config.toml (under [build] or [env])
  # This is already handled by cargo-llvm-cov 0.6 via RUSTFLAGS="--cfg coverage".
  # Verify: cargo llvm-cov --no-report 2>&1 | grep '\-\-cfg coverage'
  ```
- [ ] Confirm that `cargo build -p devs-server` (without llvm-cov) still compiles cleanly — the `#[cfg(coverage)]` block must be inert in normal builds.
- [ ] Add `///` doc comments to `register_sigterm_handler` and `flush_coverage_data` explaining their relationship to `RISK-023`.

## 3. Code Review

- [ ] Confirm that `flush_coverage_data()` is called **before** `shutdown_tx.send(())` — the flush must happen before any tokio tasks are cancelled.
- [ ] Confirm there is no `SIGKILL` anywhere in the server's own shutdown path (only `SIGTERM` + graceful drain).
- [ ] Confirm that `flush_coverage_data()` is a no-op at the type level when `cfg(coverage)` is absent — no `unsafe` block executes in normal builds.
- [ ] Confirm `register_sigterm_handler` is idempotent (called once at startup, not multiple times).
- [ ] Confirm the E2E test in `shutdown_coverage_e2e.rs` sends `SIGTERM` (not `SIGKILL`) — grep for `SIGKILL` in the test file and assert its absence.

## 4. Run Automated Tests to Verify

- [ ] Run: `cargo llvm-cov test -p devs-server --test shutdown_coverage_e2e -- --test-threads 1 --nocapture`
- [ ] Assert that:
  - `test_sigterm_produces_nonempty_profraw` passes.
  - The `.profraw` file for the server PID has size > 0 bytes.
- [ ] Run: `cargo test -p devs-server test_sigterm_handler_registered -- --nocapture` and assert it compiles and passes.
- [ ] Run: `cargo build -p devs-server` (without `cargo llvm-cov`) and assert exit code 0 with no errors.

## 5. Update Documentation

- [ ] Add a `## Graceful Shutdown & Coverage` section to `crates/devs-server/README.md` (create if absent) explaining SIGTERM behavior and the coverage flush.
- [ ] Add `// Covers: MIT-023, AC-RISK-023-03` annotation at the top of `crates/devs-server/src/shutdown.rs`.
- [ ] Reference `RISK-023-BR-002` in the doc comment for `register_sigterm_handler`: "TUI E2E tests MUST run in-process using `ratatui::backend::TestBackend`; they do not spawn the server binary and therefore do not rely on this handler for coverage collection."

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `MIT-023` and `AC-RISK-023-03` appear in the `covered` set.
- [ ] After the E2E shutdown test runs, execute: `stat /tmp/devs-coverage-$(cat /tmp/last-devs-server-pid).profraw` and confirm `Size > 0`. (The test helper should write the server PID to `/tmp/last-devs-server-pid` for this verification step.)
- [ ] Run `grep -r "SIGKILL" crates/devs-server/tests/` and assert the command returns no matches.
