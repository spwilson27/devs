# Task: Server Startup: Config-First Validation & Port Binding Logic (Sub-Epic: 065_Detailed Domain Specifications (Part 30))

## Covered Requirements
- [2_TAS-REQ-400]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-server]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-server/src/startup.rs` (or a corresponding test module) that mocks the `ServerConfig` parsing and the `PortBinder` trait.
- [ ] The test MUST verify that if `ServerConfig::validate()` returns any errors, the `PortBinder::bind()` method for either the gRPC or MCP port is NEVER called.
- [ ] The test MUST also verify that config errors are collected into a single `ValidationError` collection and reported to `stderr` before the process exits.

## 2. Task Implementation
- [ ] In the `devs-server` main entry point or a dedicated `startup` module, implement the foundational orchestration for the startup sequence.
- [ ] Ensure that `ServerConfig::parse()` and its subsequent validation logic are executed before any call to bind the gRPC or MCP ports.
- [ ] If validation fails, use the `collected_errors()` mechanism from `devs-core` to report all issues to `stderr` and exit with a non-zero status.
- [ ] Guard the calls to `tonic::transport::Server::bind()` and the MCP HTTP listener behind a success check of the configuration validation.

## 3. Code Review
- [ ] Verify that no network side effects (port binding) occur before the configuration is fully validated and accepted.
- [ ] Ensure that the error reporting uses a consistent format for all collected configuration errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --lib startup` and ensure the validation precedence tests pass.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_0/065_detailed_domain_specifications_part_30_/REPORTS.md` (create if not exists) summarizing the validation precedence implementation.

## 6. Automated Verification
- [ ] Run a shell command that attempts to start the server with an invalid `devs.toml` and verifies that no ports are bound (e.g., using `netstat` or `ss` within a timeout) and that errors are printed to `stderr`.
