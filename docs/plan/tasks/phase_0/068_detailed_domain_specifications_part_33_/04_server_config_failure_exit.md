# Task: Server Exit on Invalid Configuration (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-418]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config (consumer), devs-server (consumer)]

## 1. Initial Test Written
- [ ] Create `tests/e2e/server_config_failure.rs` with test `test_invalid_config_unknown_field()`: write a temporary `devs.toml` containing an unknown field (e.g., `[server]\nnonexistent_field = true`), start the `devs` server binary pointing to this config via `--config <path>`, assert the process exits with a non-zero code, and assert stderr contains a validation error mentioning "unknown field" or "nonexistent_field".
- [ ] Write test `test_invalid_config_wrong_type()`: write a `devs.toml` with a type error (e.g., `[server]\nlisten_port = "not_a_number"`), start the server, assert non-zero exit, assert stderr contains a type error message.
- [ ] Write test `test_invalid_config_multiple_errors()`: write a `devs.toml` with at least 3 distinct errors (unknown field, wrong type, missing required field). Assert that stderr contains error messages for ALL 3 errors (not just the first one), confirming single-pass validation that collects all errors.
- [ ] Write test `test_invalid_config_no_ports_bound()`: after starting the server with invalid config, use `std::net::TcpStream::connect()` to the configured gRPC and MCP ports and assert the connections are refused (proving no ports were bound before validation failed).
- [ ] Each test must use `DEVS_DISCOVERY_FILE` set to a unique temp path for isolation.

## 2. Task Implementation
- [ ] In `devs-config`, implement `validate(&self) -> Result<(), Vec<ConfigError>>` that collects ALL validation errors in a single pass rather than returning on the first error. Validate: required fields present, correct types, no unknown fields (use `serde(deny_unknown_fields)`), value ranges (e.g., port > 0 && port < 65536).
- [ ] In `devs-server` startup sequence, call config validation BEFORE binding any TCP ports. The sequence must be: (1) parse config, (2) validate config, (3) if errors exist: print each to stderr prefixed with `"Error: "` and exit with code 1, (4) only then bind gRPC port, (5) bind MCP port.
- [ ] Format each error on its own line: `Error: <field_path>: <description>` (e.g., `Error: server.listen_port: expected integer, got string`).
- [ ] Use `std::process::exit(1)` after printing all errors — do not panic or return a result that might be caught.

## 3. Code Review
- [ ] Verify config parsing uses `serde(deny_unknown_fields)` on all config structs to catch unknown fields.
- [ ] Verify validation collects errors into a `Vec` rather than short-circuiting on the first error.
- [ ] Verify no `TcpListener::bind` or `tonic` server setup occurs before validation succeeds.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test server_config_failure` and confirm all 4 tests pass.
- [ ] Run `./do test` and confirm full suite passes.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-418` comments to each E2E test function.

## 6. Automated Verification
- [ ] Run the server binary with `echo '[server]\nbad = true' > /tmp/bad.toml && devs --config /tmp/bad.toml 2>&1; echo "EXIT: $?"` and verify stderr contains an error and exit code is non-zero.
