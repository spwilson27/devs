# Task: Config Validation Single-Pass Error Collection (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001H]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer), devs-config (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-config/tests/validation_error_collection.rs` with a test that provides a TOML config containing multiple simultaneous errors (e.g., invalid listen address, missing pool name, negative `max_concurrent`, unknown agent tool, invalid project path). Assert that `validate()` returns ALL errors, not just the first one.
- [ ] Write a test that verifies the error output format: each error is a separate entry, prefixed with `ERROR:`. Parse the formatted output and assert each error line starts with `ERROR:`.
- [ ] Write a test that provides a config with exactly one error and verifies exactly one `ERROR:` line is produced.
- [ ] Write a test that provides a valid config and verifies `validate()` returns `Ok(())` with zero errors.
- [ ] Write an integration test that attempts to start the server with an invalid config and asserts: (a) stderr contains multiple `ERROR:` lines, (b) no port is bound (attempt to connect to the configured gRPC port fails with connection refused).

## 2. Task Implementation
- [ ] In `devs-config`, implement `validate(&self) -> Result<(), Vec<ConfigError>>` on the `ServerConfig` struct. The method must iterate over all config sections (server, pools, projects, webhooks) and collect errors into a `Vec<ConfigError>` without short-circuiting.
- [ ] Implement `Display` for `ConfigError` with the `ERROR: <description>` prefix format.
- [ ] In the server startup path, call `validate()` before binding any port. If errors are returned, write each to stderr (one per line, `ERROR:` prefixed) and exit with a non-zero status code.
- [ ] Ensure the server process does NOT call `bind()` on gRPC or MCP ports if config validation fails.

## 3. Code Review
- [ ] Verify `validate()` uses a collect-all pattern (e.g., iterating all fields) rather than `?` early-return.
- [ ] Verify error output format matches spec: one error per line, `ERROR:` prefix on stderr.
- [ ] Verify no port binding occurs before validation completes successfully.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config --test validation_error_collection` and confirm all tests pass.
- [ ] Run the integration test confirming no port binding on invalid config.

## 5. Update Documentation
- [ ] Add doc comments to `ServerConfig::validate()` describing the single-pass error collection contract and referencing `[2_TAS-REQ-001H]`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all new tests pass.
- [ ] Verify `// Covers: 2_TAS-REQ-001H` annotation exists in the test file.
