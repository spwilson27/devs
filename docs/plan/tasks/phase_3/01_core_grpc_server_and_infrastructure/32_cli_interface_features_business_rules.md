# Task: CLI Interface Features and Business Rules (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-CLI-BR-001], [4_USER_FEATURES-CLI-BR-002], [4_USER_FEATURES-CLI-BR-003], [4_USER_FEATURES-CLI-BR-004], [4_USER_FEATURES-CLI-BR-005], [4_USER_FEATURES-CLI-BR-006], [4_USER_FEATURES-CLI-BR-007], [4_USER_FEATURES-AC-3-CLI-001], [4_USER_FEATURES-AC-3-CLI-002], [4_USER_FEATURES-AC-3-CLI-003], [4_USER_FEATURES-AC-3-CLI-004], [4_USER_FEATURES-AC-3-CLI-005], [4_USER_FEATURES-AC-3-CLI-006], [4_USER_FEATURES-AC-3-CLI-007], [4_USER_FEATURES-AC-3-CLI-008], [4_USER_FEATURES-AC-3-CLI-009], [AC-CLI-OUT-001], [AC-CLI-OUT-002], [AC-CLI-OUT-003], [AC-CLI-OUT-004], [AC-CLI-OUT-005], [AC-CLI-OUT-006], [AC-CLI-OUT-007], [AC-CLI-OUT-008], [UI-DES-CLI-001], [UI-DES-CLI-002], [UI-DES-CLI-003], [UI-DES-CLI-004], [UI-DES-CLI-005]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md", "04_devs_server_crate_and_startup_sequence.md", "06_discovery_file_protocol.md"]
- shared_components: ["devs-cli (owner)", "devs-grpc (consumer)", "Server Discovery Protocol (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-cli/tests/cli_commands_test.rs` with E2E tests using `assert_cmd`: `devs submit` with valid workflow (AC-3-CLI-001), `devs list` returns run list (AC-3-CLI-002), `devs status <run>` shows run state (AC-3-CLI-003), `devs logs <run>` streams logs (AC-3-CLI-004), `devs cancel <run>` cancels (AC-3-CLI-005), `devs pause/resume` (AC-3-CLI-006/007).
- [ ] Write tests for CLI output format: human-readable default (AC-CLI-OUT-001), JSON format with `--format json` (AC-CLI-OUT-002), consistent field ordering (AC-CLI-OUT-003), error output on stderr (AC-CLI-OUT-004), exit code 0 on success (AC-CLI-OUT-005), exit code 1 on error (AC-CLI-OUT-006), exit code 2 on usage error (AC-CLI-OUT-007), exit code 4 on validation error (AC-CLI-OUT-008).
- [ ] Write tests for CLI business rules: server discovery via `--server` flag (CLI-BR-001), auto-discovery fallback (CLI-BR-002), connection error handling (CLI-BR-003), streaming log follow mode (CLI-BR-004), input parameter passing (CLI-BR-005), help text (CLI-BR-006), version display (CLI-BR-007).
- [ ] Write tests for CLI design requirements: consistent command structure (UI-DES-CLI-001), help formatting (UI-DES-CLI-002), error message formatting (UI-DES-CLI-003), progress indicators (UI-DES-CLI-004), color output (UI-DES-CLI-005).
- [ ] Write tests for CLI E2E acceptance: AC-3-CLI-008 (cross-platform path handling), AC-3-CLI-009 (pipe-friendly output).

## 2. Task Implementation
- [ ] Implement the `devs-cli` crate with `clap` for argument parsing.
- [ ] Implement all 7 MVP commands: submit, list, status, logs, cancel, pause, resume.
- [ ] Implement output formatting: human-readable default and JSON (`--format json`).
- [ ] Implement server discovery: `--server` flag, config file, auto-discovery file.
- [ ] Implement streaming log output with `--follow` flag.
- [ ] Implement proper exit codes (0, 1, 2, 4).
- [ ] Implement cross-platform path normalization for Windows compatibility.

## 3. Code Review
- [ ] Verify all CLI commands use gRPC client connections, not direct module imports.
- [ ] Confirm error messages are user-friendly and actionable.
- [ ] Ensure JSON output is machine-parseable and consistent.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 29 requirements.
- [ ] Add help text and usage examples to CLI commands.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
