# Task: Server - Config File Path Validation (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-432]

## Dependencies
- depends_on: [01_toolchain_and_edition_enforcement.md]
- shared_components: [devs-config, devs-server]

## 1. Initial Test Written
- [ ] Create a new E2E test in `tests/e2e/server_config_validation.rs` that starts the `devs-server` binary using `assert_cmd` with `--config /tmp/non_existent_file.toml`.
- [ ] Assert that the process exits with a non-zero exit code.
- [ ] Assert that stderr contains exactly `"config file not found"`.
- [ ] Verify using `netstat` or a similar tool that no ports (e.g., 7890, 7891) are bound during or after the failed start attempt.

## 2. Task Implementation
- [ ] In `devs-server/src/main.rs`, update the CLI parsing logic (using `clap`) to check for the existence of the file path provided in `--config`.
- [ ] If the path is provided but does not exist, use `eprintln!("config file not found")` and exit with code 1 immediately.
- [ ] Ensure this check occurs BEFORE binding the gRPC or MCP ports.

## 3. Code Review
- [ ] Verify that the check respects the precedence rules (CLI flag takes precedence).
- [ ] Ensure that the error message format follows `[2_TAS-REQ-001M]`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test server_config_validation` and ensure it passes.
- [ ] Run `./do test` to ensure no regressions in existing server startup behavior.

## 5. Update Documentation
- [ ] Document the config path validation behavior in `docs/plan/specs/2_tas.md` or a related feature file.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure all requirements are mapped and covered.
