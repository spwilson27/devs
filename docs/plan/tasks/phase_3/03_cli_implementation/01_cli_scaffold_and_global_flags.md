# Task: CLI Crate Scaffold and Global Flags (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [2_TAS-REQ-060]

## Dependencies
- depends_on: []
- shared_components: [devs-proto (consumer), devs-core (consumer — Server Discovery Protocol), ./do Entrypoint Script & CI Pipeline (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-cli/tests/`, create a unit test module `cli_parsing` that uses `clap::Command::try_get_matches_from` to verify:
  - `devs --help` succeeds and the output contains `--server` and `--format`.
  - `devs --server 127.0.0.1:7890 list` parses the server address correctly as a `SocketAddr`.
  - `devs --format json list` parses the format flag as `OutputFormat::Json`.
  - `devs --format text list` parses the format flag as `OutputFormat::Text` (the default).
  - `devs --format xml list` fails with a clap validation error (invalid value).
  - `devs --server not-a-socket list` fails with a clap validation error.
- [ ] Write an integration test `test_cli_discovery` that sets `DEVS_DISCOVERY_FILE` to a temp file containing `127.0.0.1:7890`, invokes the CLI binary with `assert_cmd` (`cargo_bin("devs")`), and verifies it attempts to connect to that address (expected: exit code 3 since no server is running).
- [ ] Write an integration test that invokes `devs` with no subcommand and verifies it prints help text and exits with a non-zero code (clap's default for missing subcommand).

## 2. Task Implementation
- [ ] Create `crates/devs-cli/Cargo.toml` with dependencies: `clap` (4.5, features: `derive`, `env`), `tonic` (matching workspace version), `tokio` (features: `rt-multi-thread`, `macros`), `serde_json`, `devs-proto`, `devs-core`.
- [ ] Add `devs-cli` to the workspace `Cargo.toml` members list.
- [ ] Define the CLI entry point in `crates/devs-cli/src/main.rs` with a `#[derive(Parser)]` struct `Cli` containing:
  - `--server <host:port>` (`Option<SocketAddr>`): overrides discovery. Also reads `DEVS_SERVER_ADDR` env var via clap's `env` attribute.
  - `--format <text|json>` (`OutputFormat` enum, default `text`): output format. Also reads `DEVS_FORMAT` env var.
  - `#[command(subcommand)] command: Commands` enum with placeholder variants for `Submit`, `List`, `Status`, `Logs`, `Cancel`, `Pause`, `Resume`, `Project`.
- [ ] Implement server address resolution in `crates/devs-cli/src/connection.rs`:
  - If `--server` is provided, use it directly.
  - Otherwise, call the Server Discovery Protocol from `devs-core` to read the discovery file (respecting `DEVS_DISCOVERY_FILE` env var, falling back to `~/.config/devs/server.addr`).
  - If neither is available, exit with code 3 and message "Server unreachable: no --server flag and no discovery file found".
- [ ] Implement `connect_to_server(addr: SocketAddr) -> Result<tonic::transport::Channel>` that creates a gRPC channel to the resolved address.
- [ ] Define `OutputFormat` enum (`Text`, `Json`) in `crates/devs-cli/src/output.rs` with a method `is_json(&self) -> bool`.
- [ ] Add `[[bin]] name = "devs"` to `crates/devs-cli/Cargo.toml` so the binary is named `devs`.

## 3. Code Review
- [ ] Verify `clap` derive macros are used consistently — no manual `Arg::new()` calls.
- [ ] Verify global flags (`--server`, `--format`) are on the top-level `Cli` struct so all subcommands inherit them.
- [ ] Verify `SocketAddr` parsing is handled by clap's built-in type validation.
- [ ] Verify discovery file reading reuses the `devs-core` Server Discovery Protocol — no duplicate implementation.
- [ ] Verify no `unwrap()` or `expect()` in production paths; all errors are propagated.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and ensure all unit and integration tests pass.
- [ ] Run `./do lint` and ensure `devs-cli` passes clippy and fmt checks.

## 5. Update Documentation
- [ ] Add doc comments to the `Cli` struct and all public types in `devs-cli`.

## 6. Automated Verification
- [ ] Run `cargo clippy -p devs-cli -- -D warnings` and confirm zero warnings.
- [ ] Run `cargo fmt -p devs-cli --check` and confirm no formatting issues.
- [ ] Run `cargo test -p devs-cli -- --nocapture 2>&1 | grep "test result"` and verify all tests pass with 0 failures.
