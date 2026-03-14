# Task: Implement Discovery File Path Resolution and Content Format (Sub-Epic: 017_Foundational Technical Requirements (Part 8))

## Covered Requirements
- [2_TAS-REQ-002E], [2_TAS-REQ-002F], [2_TAS-REQ-002G]

## Dependencies
- depends_on: []
- shared_components: [devs-core (owner of Server Discovery Protocol — this task implements the core discovery types and logic)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/discovery.rs` and add `mod discovery;` to `crates/devs-core/src/lib.rs`.
- [ ] Write the following unit tests (all should fail initially since no implementation exists):

### Path Resolution Tests (2_TAS-REQ-002E)
- [ ] `test_resolve_path_env_var_takes_highest_priority`: Set `DEVS_DISCOVERY_FILE=/tmp/custom.addr` in a temp env scope, provide a config with `discovery_file = Some("/etc/devs/server.addr")`. Assert that `resolve_discovery_path()` returns `/tmp/custom.addr`.
- [ ] `test_resolve_path_config_takes_second_priority`: Unset `DEVS_DISCOVERY_FILE`, provide a config with `discovery_file = Some("/etc/devs/server.addr")`. Assert the result is `/etc/devs/server.addr`.
- [ ] `test_resolve_path_default_fallback`: Unset `DEVS_DISCOVERY_FILE`, provide config with `discovery_file = None`. Assert the result ends with `.config/devs/server.addr` and starts with the user's home directory.
- [ ] `test_resolve_path_env_var_empty_string_is_ignored`: Set `DEVS_DISCOVERY_FILE=""`. Provide config with `discovery_file = Some("/from/config")`. Assert result is `/from/config` (empty env var is treated as unset per the requirement "if set and non-empty").
- [ ] `test_resolve_path_windows_home_uses_userprofile`: (cfg-gated for Windows) Verify that `~` resolves via `USERPROFILE` rather than `HOME`.

### Content Format Tests (2_TAS-REQ-002F)
- [ ] `test_format_ipv4_address`: Call `DiscoveryAddress::new("127.0.0.1", 7890)`. Assert `to_string()` returns `"127.0.0.1:7890"`.
- [ ] `test_format_ipv6_address`: Call `DiscoveryAddress::new("::1", 7890)`. Assert `to_string()` returns `"[::1]:7890"` (IPv6 must be bracketed).
- [ ] `test_format_ipv6_already_bracketed`: Call `DiscoveryAddress::new("[::1]", 7890)`. Assert `to_string()` returns `"[::1]:7890"` (no double brackets).
- [ ] `test_format_dns_hostname`: Call `DiscoveryAddress::new("myserver.local", 443)`. Assert `to_string()` returns `"myserver.local:443"`.
- [ ] `test_port_zero_rejected`: Call `DiscoveryAddress::new("127.0.0.1", 0)`. Assert it returns an error (port must be 1–65535).
- [ ] `test_parse_strips_whitespace`: Call `DiscoveryAddress::parse("  127.0.0.1:7890  \n")`. Assert it successfully parses to host=`127.0.0.1`, port=`7890`.
- [ ] `test_parse_ipv6_with_brackets`: Call `DiscoveryAddress::parse("[::1]:7890")`. Assert host=`::1`, port=`7890`.
- [ ] `test_parse_invalid_port_non_numeric`: Call `DiscoveryAddress::parse("host:abc")`. Assert it returns an error.
- [ ] `test_parse_invalid_port_out_of_range`: Call `DiscoveryAddress::parse("host:70000")`. Assert it returns an error.
- [ ] `test_parse_missing_port`: Call `DiscoveryAddress::parse("host")`. Assert it returns an error.
- [ ] `test_parse_empty_string`: Call `DiscoveryAddress::parse("")`. Assert it returns an error.

### gRPC Port Encoding Tests (2_TAS-REQ-002G)
- [ ] `test_discovery_address_is_grpc_port_only`: Create a `DiscoveryAddress` with port 50051. Assert that the struct has no field or method for MCP port — the type itself enforces that only the gRPC port is encoded.
- [ ] `test_discovery_address_roundtrip`: Create a `DiscoveryAddress`, format it to string, parse it back. Assert the host and port match the original.

## 2. Task Implementation
- [ ] Define a `DiscoveryError` enum in `crates/devs-core/src/discovery.rs` using `thiserror`:
  - `InvalidPort { port: u32 }` — port outside 1–65535
  - `ParseError { input: String, reason: String }` — malformed discovery file content
  - `HomeDirectoryNotFound` — could not resolve `~`
- [ ] Define a `DiscoveryAddress` struct with fields `host: String` and `grpc_port: u16`:
  - `pub fn new(host: &str, grpc_port: u16) -> Result<Self, DiscoveryError>` — validates port range, auto-brackets IPv6 if not already bracketed. Detect IPv6 by checking if the host contains `:` and is not already bracketed.
  - `pub fn parse(s: &str) -> Result<Self, DiscoveryError>` — strips whitespace, splits on the last `:` (to handle IPv6 brackets), parses port as u16.
  - `impl fmt::Display` — outputs `<host>:<port>` with IPv6 in brackets.
  - `pub fn host(&self) -> &str` and `pub fn grpc_port(&self) -> u16` — accessors.
- [ ] Implement `pub fn resolve_discovery_path(config_discovery_file: Option<&str>) -> Result<PathBuf, DiscoveryError>`:
  - Step 1: Check `std::env::var("DEVS_DISCOVERY_FILE")`. If `Ok(val)` and `!val.is_empty()`, return `PathBuf::from(val)`.
  - Step 2: If `config_discovery_file` is `Some(path)`, return `PathBuf::from(path)`.
  - Step 3: Resolve home directory using `dirs::config_dir()` (add `dirs` crate as dependency to `devs-core`) and append `devs/server.addr`. Return error if home cannot be resolved.
- [ ] Add `// Covers: 2_TAS-REQ-002E` comment above `resolve_discovery_path`.
- [ ] Add `// Covers: 2_TAS-REQ-002F` comment above `DiscoveryAddress::parse` and `DiscoveryAddress::new`.
- [ ] Add `// Covers: 2_TAS-REQ-002G` comment above the `DiscoveryAddress` struct definition.

## 3. Code Review
- [ ] Verify that `resolve_discovery_path` strictly follows the three-level priority: env var > config > default. No other sources.
- [ ] Confirm that empty `DEVS_DISCOVERY_FILE` env var is treated as unset (not as an empty path).
- [ ] Confirm that IPv6 addresses are always enclosed in brackets `[...]` in the formatted output.
- [ ] Verify that `DiscoveryAddress` has no MCP port field — the type structurally enforces [2_TAS-REQ-002G].
- [ ] Ensure no `unwrap()` or `expect()` calls in non-test code — all errors propagated via `Result`.
- [ ] Verify that `devs-core` remains free of runtime dependencies (no tokio, no network I/O). The `dirs` crate is acceptable as it's a pure utility.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib discovery` and ensure all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and ensure no warnings.

## 5. Update Documentation
- [ ] Add module-level doc comment to `discovery.rs` explaining the Server Discovery Protocol: purpose, three-level path resolution, content format, and the fact that only the gRPC port is encoded.
- [ ] Add doc comments to each public function and type.

## 6. Automated Verification
- [ ] Run `grep -rn "Covers:.*2_TAS-REQ-002E" crates/devs-core/src/` and verify at least one match.
- [ ] Run `grep -rn "Covers:.*2_TAS-REQ-002F" crates/devs-core/src/` and verify at least one match.
- [ ] Run `grep -rn "Covers:.*2_TAS-REQ-002G" crates/devs-core/src/` and verify at least one match.
- [ ] Run `cargo test -p devs-core --lib discovery 2>&1 | tail -1` and verify it shows `test result: ok`.
