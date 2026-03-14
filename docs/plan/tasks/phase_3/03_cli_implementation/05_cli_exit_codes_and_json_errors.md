# Task: CLI Exit Codes and JSON Error Reporting (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [2_TAS-REQ-062], [2_TAS-REQ-063]

## Dependencies
- depends_on: ["01_cli_scaffold_and_global_flags.md"]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-cli/src/error.rs` for the `CliError` enum exit code mapping:
  - `CliError::General("msg")` → `exit_code()` returns 1.
  - `CliError::NotFound("run xyz")` → `exit_code()` returns 2.
  - `CliError::ServerUnreachable("addr")` → `exit_code()` returns 3.
  - `CliError::ValidationError("cycle detected")` → `exit_code()` returns 4.
- [ ] Write unit tests for `CliError` JSON serialization via `to_json()`:
  - `CliError::NotFound("run xyz")` → `{"error":"run xyz","code":2}`.
  - `CliError::ServerUnreachable("127.0.0.1:7890")` → `{"error":"Server unreachable: 127.0.0.1:7890","code":3}`.
  - Verify the `code` field in JSON always matches the value from `exit_code()`.
- [ ] Write unit tests for `From<tonic::Status> for CliError` conversion:
  - `Status::not_found("...")` → `CliError::NotFound`.
  - `Status::unavailable("...")` → `CliError::ServerUnreachable`.
  - `Status::invalid_argument("...")` → `CliError::ValidationError`.
  - `Status::internal("...")` → `CliError::General`.
  - `Status::failed_precondition("...")` → `CliError::ValidationError`.
- [ ] Write unit tests for `From<tonic::transport::Error> for CliError` → always `CliError::ServerUnreachable`.
- [ ] Write an E2E test using `assert_cmd` that invokes `devs status nonexistent --server 127.0.0.1:1` (no server) and asserts exit code 3.
- [ ] Write an E2E test that invokes `devs status nonexistent --server 127.0.0.1:1 --format json` and asserts:
  - Exit code 3.
  - Stdout is valid JSON matching `{"error":"...","code":3}`.
  - No other content appears on stdout.
- [ ] Write an E2E test confirming that in text mode, error messages appear on stderr only (stdout is empty on error).

## 2. Task Implementation
- [ ] Define `CliError` enum in `crates/devs-cli/src/error.rs`:
  ```rust
  pub enum CliError {
      General(String),           // exit code 1
      NotFound(String),          // exit code 2
      ServerUnreachable(String), // exit code 3
      ValidationError(String),   // exit code 4
  }
  ```
- [ ] Implement `CliError::exit_code(&self) -> i32` returning the code per [2_TAS-REQ-062].
- [ ] Implement `CliError::to_json(&self) -> String` returning `{"error":"<message>","code":<n>}` per [2_TAS-REQ-063]. Use `serde_json::json!` for safe serialization (handles escaping).
- [ ] Implement `std::fmt::Display for CliError` for human-readable stderr output.
- [ ] Implement `From<tonic::Status> for CliError`:
  - `Code::NotFound` → `CliError::NotFound`
  - `Code::Unavailable` → `CliError::ServerUnreachable`
  - `Code::InvalidArgument` | `Code::FailedPrecondition` → `CliError::ValidationError`
  - All other codes → `CliError::General`
- [ ] Implement `From<tonic::transport::Error> for CliError` → `CliError::ServerUnreachable`.
- [ ] Modify the CLI `main()` to wrap all command execution in a result handler:
  - On `Ok(())`: exit code 0, no error output.
  - On `Err(cli_error)`:
    - If `--format json`: write `cli_error.to_json()` to stdout (one line, no trailing newline beyond the JSON), write human-readable message to stderr.
    - If `--format text`: write human-readable message to stderr only, nothing to stdout.
    - Call `std::process::exit(cli_error.exit_code())`.
- [ ] Verify that UUID-vs-slug precedence on collision is implemented: if a run identifier matches both a UUID and a slug for different runs, UUID takes precedence (per [2_TAS-REQ-063]).

## 3. Code Review
- [ ] Verify exit code mapping exactly matches [2_TAS-REQ-062]: 0=success, 1=general, 2=not found, 3=unreachable, 4=validation.
- [ ] Verify JSON error format exactly matches [2_TAS-REQ-063]: `{"error":"<message>","code":<n>}` with `code` matching the process exit code.
- [ ] Verify that `tonic::Status` mapping covers all gRPC status codes — unmapped codes fall through to `CliError::General`, never panic.
- [ ] Verify stdout is clean in error cases: only JSON error (if `--format json`) or empty (if `--format text`).
- [ ] Verify human-readable errors on stderr include enough context for debugging (the gRPC status message, the server address attempted, etc.).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and ensure all error handling tests pass.
- [ ] Run `./do test` to ensure no regressions.

## 5. Update Documentation
- [ ] Add doc comments to `CliError` enum and all `From` impls documenting the exit code contract and JSON format.

## 6. Automated Verification
- [ ] Run `cargo clippy -p devs-cli -- -D warnings` and confirm zero warnings.
- [ ] Run `cargo test -p devs-cli -- --nocapture 2>&1 | grep "test result"` and verify 0 failures.
- [ ] Run `grep -r "// Covers:" crates/devs-cli/ | grep -E "2_TAS-REQ-062|2_TAS-REQ-063"` to verify traceability annotations exist in test code.
