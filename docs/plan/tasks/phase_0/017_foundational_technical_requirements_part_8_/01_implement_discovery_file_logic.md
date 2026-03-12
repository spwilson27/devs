# Task: Implement Discovery File Logic (Sub-Epic: 017_Foundational Technical Requirements (Part 8))

## Covered Requirements
- [2_TAS-REQ-002E], [2_TAS-REQ-002F], [2_TAS-REQ-002G]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/008_proto_core_foundation/03_setup_devs_core_foundation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/discovery.rs` for path resolution:
  - Test that `DEVS_DISCOVERY_FILE` environment variable takes highest priority.
  - Test that the `server.discovery_file` configuration (mocked) takes second priority.
  - Test that the default path `~/.config/devs/server.addr` is used if no overrides exist.
  - Test that `~` resolves correctly on the current platform (using `dirs` or similar library if available, otherwise manual resolution).
- [ ] Create unit tests for content formatting:
  - Test that IPv4 address formatting (`127.0.0.1:7890`) is valid.
  - Test that IPv6 address formatting (`[::1]:7890`) is valid.
  - Test that DNS hostname formatting (`localhost:7890`) is valid.
  - Test that ports outside 1–65535 are rejected.
- [ ] Test that the discovery file only contains the gRPC port, not the MCP port.

## 2. Task Implementation
- [ ] Implement a `DiscoveryFile` struct or utility module in `crates/devs-core/src/discovery.rs`.
- [ ] Implement a function `resolve_path(config: &ServerConfig) -> PathBuf` that follows the priority order defined in [2_TAS-REQ-002E].
- [ ] Implement a function `format_address(host: &str, port: u16) -> Result<String, DiscoveryError>` that formats the address according to [2_TAS-REQ-002F].
  - Use `Result` and `thiserror` for error handling.
  - Validate that the port is non-zero.
- [ ] Implement a function to parse an address string, ensuring it handles surrounding whitespace as per [2_TAS-REQ-002F].
- [ ] Ensure that the MCP port is NOT included in the discovery file content, as per [2_TAS-REQ-002G].

## 3. Code Review
- [ ] Verify that path resolution strictly follows the priority: Env > Config > Default.
- [ ] Confirm that IPv6 addresses are enclosed in brackets `[]`.
- [ ] Ensure that the gRPC listen port is correctly identified as the content of the file.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib discovery` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the discovery module explaining the path resolution priority and formatting rules.

## 6. Automated Verification
- [ ] Run `grep -r "2_TAS-REQ-002E" crates/devs-core/` and similar for other requirements to ensure traceability.
