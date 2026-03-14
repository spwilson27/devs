# Task: Config Validation Must Complete Before Port Binding (Sub-Epic: 065_Detailed Domain Specifications (Part 30))

## Covered Requirements
- [2_TAS-REQ-400]

## Dependencies
- depends_on: []
- shared_components: ["devs-config", "devs-core"]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/`, create `config_validation_port_guard.rs`
- [ ] Write a test `test_no_port_bound_when_config_has_errors` that:
  1. Constructs a `ServerConfig` with intentionally invalid values (e.g., empty listen address, invalid pool name, missing required fields)
  2. Calls the server startup initialization function (or the config-validation-then-bind sequence)
  3. Asserts that `validate()` returns `Err` containing all collected config errors
  4. Asserts that no TCP listener was bound (e.g., by checking that the port is still available via `TcpListener::bind`)
- [ ] Write a test `test_port_bound_only_after_config_valid` that:
  1. Constructs a valid `ServerConfig`
  2. Calls the startup sequence
  3. Asserts that validation passes before any port binding occurs (ordering verified via event log or mock)
- [ ] Write a unit test in `devs-config` `test_validate_collects_all_errors` confirming `validate()` returns a `Vec<ConfigError>` with all errors, not just the first

## 2. Task Implementation
- [ ] In the server startup path (e.g., `devs-server/src/startup.rs` or equivalent), enforce the invariant: call `config.validate()` and return all errors before calling any `TcpListener::bind` or tonic server builder
- [ ] Ensure `ServerConfig::validate(&self) -> Result<(), Vec<ConfigError>>` performs single-pass validation collecting every error (pool refs, listen addr, MCP port, project entries)
- [ ] If validation fails, the startup function returns the full error list without having opened any socket

## 3. Code Review
- [ ] Verify no `TcpListener::bind`, `tonic::transport::Server::builder`, or socket creation appears before the validation call in the startup sequence
- [ ] Confirm error collection is exhaustive (not short-circuiting on first error)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --test config_validation_port_guard`
- [ ] Run `cargo test -p devs-config` to confirm validation unit tests pass

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-400` annotations to each test function

## 6. Automated Verification
- [ ] Run `./do test` and confirm all tests pass
- [ ] Grep for `// Covers: 2_TAS-REQ-400` and confirm at least one match exists
