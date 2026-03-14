# Task: Implement Stdin Signal Protocol and Graceful Termination Sequence (Sub-Epic: 06_Mid-Run Interaction & Signal Handling)

## Covered Requirements
- [1_PRD-REQ-017], [2_TAS-REQ-038]

## Dependencies
- depends_on: []
- shared_components: [devs-adapters (owner: Phase 1 / Sub-Epic: devs-adapters — this task extends the AgentProcess handle)]

## 1. Initial Test Written
- [ ] In `crates/devs-adapters/src/signal.rs` (new module), write unit tests for the `StdinSignal` enum with variants `Cancel`, `Pause`, `Resume`, each serializing to `devs:cancel\n`, `devs:pause\n`, `devs:resume\n` respectively. Test `StdinSignal::as_bytes()` returns the exact byte sequences.
- [ ] Write a unit test `test_signal_cancel_writes_to_stdin` that creates a mock `AsyncWrite` sink, calls `send_signal(&mut sink, StdinSignal::Cancel).await`, and asserts the sink received exactly `b"devs:cancel\n"`.
- [ ] Write a unit test `test_signal_pause_writes_to_stdin` — same pattern for `devs:pause\n`.
- [ ] Write a unit test `test_signal_resume_writes_to_stdin` — same pattern for `devs:resume\n`.
- [ ] Write an integration test `test_cancel_termination_sequence` that spawns a real subprocess (`sleep 60` or a custom test binary that ignores SIGTERM for testing the full escalation), sends `devs:cancel\n` via stdin, waits up to 5 seconds, then sends SIGTERM, waits another 5 seconds, then sends SIGKILL. Assert the process is dead after the sequence completes. Use `tokio::time::pause()` to control time in tests.
- [ ] Write a test `test_cancel_early_exit` that spawns a subprocess which exits immediately upon receiving `devs:cancel\n` on stdin. Verify the termination sequence completes without sending SIGTERM or SIGKILL, and that the total elapsed time is well under 5 seconds.
- [ ] Write a test `test_cancel_sigterm_exit` that spawns a subprocess which ignores `devs:cancel\n` but exits on SIGTERM. Verify SIGTERM is sent after the 5-second grace period and SIGKILL is never sent.
- [ ] Write a test `test_stdin_closed_handling` verifying that if the child's stdin pipe is already closed (e.g., process crashed), `send_signal` returns an error rather than panicking.
- [ ] All tests must include `// Covers: 1_PRD-REQ-017` or `// Covers: 2_TAS-REQ-038` annotations.

## 2. Task Implementation
- [ ] Create `crates/devs-adapters/src/signal.rs` module with:
  ```rust
  /// Tokens that devs writes to an agent's stdin to control execution.
  #[derive(Debug, Clone, Copy, PartialEq, Eq)]
  pub enum StdinSignal {
      Cancel,
      Pause,
      Resume,
  }
  ```
- [ ] Implement `StdinSignal::as_bytes(&self) -> &'static [u8]` returning the exact wire format (`b"devs:cancel\n"`, etc.).
- [ ] Implement `pub async fn send_signal<W: AsyncWrite + Unpin>(writer: &mut W, signal: StdinSignal) -> Result<(), SignalError>` that calls `writer.write_all(signal.as_bytes()).await` and maps IO errors to `SignalError::StdinWriteFailed`.
- [ ] Implement `pub async fn graceful_terminate(child: &mut Child, stdin: Option<&mut ChildStdin>) -> TerminationOutcome` with this sequence:
  1. If `stdin` is `Some`, send `StdinSignal::Cancel`. Log and continue if the write fails (stdin may be closed).
  2. `tokio::time::timeout(Duration::from_secs(5), child.wait()).await` — if Ok, return `TerminationOutcome::ExitedAfterCancel(exit_status)`.
  3. Send SIGTERM via `child.start_kill()` on Unix or `child.kill()` on Windows.
  4. `tokio::time::timeout(Duration::from_secs(5), child.wait()).await` — if Ok, return `TerminationOutcome::ExitedAfterSigterm(exit_status)`.
  5. On Unix, send SIGKILL via `libc::kill(pid, libc::SIGKILL)`. On Windows, this path is unreachable since `kill()` is already forceful.
  6. `child.wait().await` — return `TerminationOutcome::Killed`.
- [ ] Define `TerminationOutcome` enum with `ExitedAfterCancel(ExitStatus)`, `ExitedAfterSigterm(ExitStatus)`, `Killed` variants.
- [ ] Define `SignalError` enum with `StdinWriteFailed(std::io::Error)` variant.
- [ ] Extend `AgentProcess` (from the devs-adapters trait) to hold `Option<ChildStdin>` and expose `pub async fn cancel(&mut self) -> TerminationOutcome` which delegates to `graceful_terminate`.
- [ ] Ensure that when `AgentProcess` is constructed during `AgentAdapter::spawn`, the child process is spawned with `stdin(Stdio::piped())` so the stdin handle is available.
- [ ] Add the `signal` module to `crates/devs-adapters/src/lib.rs` with `pub mod signal;`.

## 3. Code Review
- [ ] Verify `send_signal` uses `write_all` (not `write`) to guarantee the full token is written atomically.
- [ ] Verify the 5-second grace periods use `Duration::from_secs(5)` as named constants (`CANCEL_GRACE_PERIOD`, `SIGTERM_GRACE_PERIOD`) for clarity.
- [ ] Verify SIGTERM/SIGKILL handling is platform-conditional (`#[cfg(unix)]` / `#[cfg(windows)]`) and that Windows uses `kill()` which is already forceful.
- [ ] Verify that `graceful_terminate` does not panic if called on an already-exited process.
- [ ] Verify `AgentProcess::cancel` drops the stdin handle after sending the cancel signal to allow the child to detect EOF.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters -- signal` to verify all signal protocol tests pass.
- [ ] Run `cargo test -p devs-adapters` to verify no regressions in existing adapter tests.

## 5. Update Documentation
- [ ] Add doc comments to `StdinSignal`, `send_signal`, `graceful_terminate`, and `TerminationOutcome` explaining the protocol and timing guarantees.
- [ ] Document the `devs:cancel\n` / `devs:pause\n` / `devs:resume\n` wire format in the module-level doc comment of `signal.rs`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all tests pass, including traceability annotations for `1_PRD-REQ-017` and `2_TAS-REQ-038`.
- [ ] Run `./do lint` and confirm no warnings or errors.
