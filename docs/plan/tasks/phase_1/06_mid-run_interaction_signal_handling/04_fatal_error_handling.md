# Task: Implement Fatal Error Handling for Adapter Spawn Failures (Sub-Epic: 06_Mid-Run Interaction & Signal Handling)

## Covered Requirements
- [2_TAS-REQ-039]

## Dependencies
- depends_on: []
- shared_components: [devs-adapters (owner: Phase 1 — this task adds non-retryable error variants)]

## 1. Initial Test Written
- [ ] In `crates/devs-adapters/src/error.rs` (or the module defining `AdapterError`), write `test_binary_not_found_is_fatal` — attempt to spawn an adapter with binary path `/nonexistent/binary/path`, verify it returns `AdapterError::BinaryNotFound { binary: String, source: io::Error }`, and verify `AdapterError::is_fatal()` returns `true`.
- [ ] Write `test_pty_allocation_failed_is_fatal` — mock or trigger a PTY allocation failure (e.g., pass an invalid PTY config to `portable-pty`), verify it returns `AdapterError::PtyAllocationFailed { source: ... }`, and verify `AdapterError::is_fatal()` returns `true`.
- [ ] Write `test_normal_exit_failure_is_not_fatal` — simulate a normal non-zero exit code, verify `AdapterError::ProcessFailed { exit_code: 1, .. }` has `is_fatal() == false` (retryable).
- [ ] Write `test_rate_limited_is_not_fatal` — verify `AdapterError::RateLimited(..)` has `is_fatal() == false`.
- [ ] Write `test_binary_not_found_error_message_includes_path` — verify the `Display` impl for `BinaryNotFound` includes the binary path attempted (e.g., "Agent binary not found: /usr/bin/claude").
- [ ] Write `test_pty_failure_error_message_includes_os_error` — verify the `Display` impl for `PtyAllocationFailed` includes the underlying OS error.
- [ ] Write `test_binary_not_found_before_spawn` — verify that the binary existence check happens BEFORE any subprocess is spawned (i.e., no child process is created).
- [ ] All tests must include `// Covers: 2_TAS-REQ-039` annotations.

## 2. Task Implementation
- [ ] In `crates/devs-adapters/src/error.rs`, extend `AdapterError` enum with:
  ```rust
  #[derive(Debug, thiserror::Error)]
  pub enum AdapterError {
      /// The agent CLI binary was not found at the expected path.
      #[error("Agent binary not found: {binary}")]
      BinaryNotFound {
          binary: String,
          #[source]
          source: std::io::Error,
      },
      /// PTY allocation failed when PTY mode was explicitly requested.
      #[error("PTY allocation failed for agent")]
      PtyAllocationFailed {
          #[source]
          source: Box<dyn std::error::Error + Send + Sync>,
      },
      /// Agent process exited with a non-zero code (retryable).
      #[error("Agent process failed with exit code {exit_code}")]
      ProcessFailed {
          exit_code: i32,
          stderr: String,
      },
      /// Agent hit a rate limit (retryable via pool fallback).
      #[error("Agent rate-limited: {0}")]
      RateLimited(RateLimitInfo),
      // ... other variants as needed
  }
  ```
- [ ] Implement `AdapterError::is_fatal(&self) -> bool` returning `true` for `BinaryNotFound` and `PtyAllocationFailed`, `false` for all other variants.
- [ ] In the `AgentAdapter::spawn` implementation (shared base logic), before calling `Command::new(binary)`:
  1. Check `which::which(&binary_name)` or `std::fs::metadata(&binary_path)` to verify the binary exists.
  2. If not found, return `Err(AdapterError::BinaryNotFound { binary: binary_name.to_string(), source: io::Error::new(io::ErrorKind::NotFound, "binary not in PATH") })`.
- [ ] In the PTY spawn path (when `pty_mode: true` in `AgentInvocation`):
  1. Attempt `portable_pty::native_pty_system().openpty(pty_size)`.
  2. If it returns an error, return `Err(AdapterError::PtyAllocationFailed { source: Box::new(e) })`.
  3. Do NOT fall back to non-PTY mode — if PTY is requested and fails, it is a fatal error.
- [ ] Ensure the scheduler/executor layer checks `error.is_fatal()` and skips retry logic when `true`, transitioning the stage directly to `Failed`.

## 3. Code Review
- [ ] Verify `BinaryNotFound` check runs before any process spawn — no orphaned child processes on failure.
- [ ] Verify `PtyAllocationFailed` does NOT fall back to non-PTY mode (explicit requirement from [2_TAS-REQ-039]).
- [ ] Verify `is_fatal()` is exhaustive — every `AdapterError` variant is covered.
- [ ] Verify error messages are descriptive enough for operators to diagnose (include binary path, OS error details).
- [ ] Verify `AdapterError` implements `Send + Sync` for cross-task usage.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters -- fatal` and `cargo test -p devs-adapters -- error` to verify all fatal error handling tests pass.
- [ ] Run `cargo test -p devs-adapters` to verify no regressions.

## 5. Update Documentation
- [ ] Add doc comments to all `AdapterError` variants explaining which are fatal (non-retryable) and which are transient (retryable).
- [ ] Document in the `AgentAdapter` trait doc comment that `is_fatal() == true` errors must NOT be retried by the scheduler.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all tests pass with `// Covers: 2_TAS-REQ-039` annotations.
- [ ] Run `./do lint` and confirm no warnings or errors.
