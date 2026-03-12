# Task: CLI Scaffold and Global Flags (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [2_TAS-REQ-060]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-grpc]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/test_cli_scaffold.py` (using `assert_cmd`) that invokes the `devs` CLI with `--help` and verifies that global flags `--server` and `--format` are listed.
- [ ] Write a test that provides an invalid `--server` address and asserts the command fails with a non-zero exit code.
- [ ] Write a test that provides an invalid `--format` value (e.g., `--format xml`) and asserts it fails with `clap`'s default error.

## 2. Task Implementation
- [ ] Initialize the `devs-cli` crate in the workspace.
- [ ] Use `clap` 4.5 with the `derive` and `env` features to define the CLI entry point.
- [ ] Implement global flags:
  - `--server <host:port>`: Overrides discovery. Map to `DEVS_SERVER_ADDR` environment variable.
  - `--format <text|json>`: Default to `text`. Map to `DEVS_FORMAT` environment variable.
- [ ] Implement server discovery logic by calling `devs_grpc::ClientChannel::discover()` (shared component) if `--server` is not provided.
- [ ] Ensure the CLI binary is available as `devs`.

## 3. Code Review
- [ ] Verify that `clap` derive macros are used for clean subcommand and flag definitions.
- [ ] Ensure that global flags are defined once and inherited by all subcommands.
- [ ] Verify that server address parsing uses `std::net::SocketAddr` for validation.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure the new E2E scaffold tests pass.
- [ ] Verify that the `devs --help` output is clean and well-formatted.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the initialization of the `devs-cli` crate.

## 6. Automated Verification
- [ ] Run `cargo clippy -p devs-cli` to ensure no lint warnings.
- [ ] Run `cargo fmt -p devs-cli --check` to ensure formatting matches project standards.
