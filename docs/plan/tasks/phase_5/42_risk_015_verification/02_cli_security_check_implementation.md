# Task: Implement and Verify CLI `security-check` (Sub-Epic: 42_Risk 015 Verification)

## Covered Requirements
- [AC-RISK-015-02], [MIT-015]

## Dependencies
- depends_on: [01_verify_startup_security_logs.md]
- shared_components: [devs-cli, devs-config]

## 1. Initial Test Written
- [ ] Write an E2E test in `devs-cli` that runs `devs security-check --config <path>` with a configuration file where `server.listen` starts with `"0.0.0.0"`.
- [ ] Assert that the CLI exits with exit code 1.
- [ ] Assert that the output contains the `SEC-BIND-ADDR` warning.
- [ ] Write a second test where `server.listen` starts with `"127.0.0.1"`.
- [ ] Assert that the CLI exits with exit code 0 and reports no warnings.

## 2. Task Implementation
- [ ] Implement the `security-check` subcommand in the `devs` CLI.
- [ ] Logic for `security-check` should load the provided or default `devs.toml`.
- [ ] Inspect the `server.listen` field in the `ServerConfig`.
- [ ] If the address does not start with `127.`, print a warning with `SEC-BIND-ADDR` and return an error status (exit code 1).
- [ ] Ensure the CLI correctly identifies loopback addresses (starting with `127.`).

## 3. Code Review
- [ ] Confirm that `devs security-check` follows the same bind-address detection logic as the `devs-server` startup warning for consistency.
- [ ] Verify that the subcommand is clearly documented in the CLI's `--help` output.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and verify the security-check tests pass.

## 5. Update Documentation
- [ ] Ensure the new command is listed in the CLI's help messages.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [AC-RISK-015-02] as covered.
