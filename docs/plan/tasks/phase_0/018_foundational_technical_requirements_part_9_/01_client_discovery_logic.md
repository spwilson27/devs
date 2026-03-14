# Task: Client Server Address Resolution with Stale Detection and Explicit Override (Sub-Epic: 018_Foundational Technical Requirements (Part 9))

## Covered Requirements
- [2_TAS-REQ-002H], [2_TAS-REQ-002J]

## Dependencies
- depends_on: [none]
- shared_components: [Server Discovery Protocol (consumer — uses discovery file format defined in devs-core)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/discovery.rs` (or a new `crates/devs-core/src/discovery/client.rs` module), write the following unit tests **before any implementation**:
- [ ] **`test_explicit_server_flag_skips_discovery_file`**: Call `resolve_server_addr(Some("127.0.0.1:9090"), ...)`. Assert it returns `Ok("127.0.0.1:9090")` without reading any file. Set `DEVS_DISCOVERY_FILE` to a non-existent path to prove the file is never accessed (if it were, it would error). Annotate with `// Covers: 2_TAS-REQ-002J`.
- [ ] **`test_explicit_server_flag_with_invalid_format_returns_error`**: Call `resolve_server_addr(Some("not-a-valid-addr"), ...)`. Assert it returns an error (not exit code 3 — format errors on explicit flags are a different category).
- [ ] **`test_discovery_file_valid_content_returns_address`**: Write `"127.0.0.1:5050\n"` to a temp file. Set `DEVS_DISCOVERY_FILE` to that path. Call `resolve_server_addr(None, ...)`. Assert it returns `Ok("127.0.0.1:5050")` (whitespace stripped).
- [ ] **`test_discovery_file_missing_returns_exit_code_3`**: Set `DEVS_DISCOVERY_FILE` to a non-existent path. Call `resolve_server_addr(None, ...)`. Assert the error variant maps to exit code `3`. Assert the error's `Display` impl contains `"not reachable"` or the appropriate discovery-missing message.
- [ ] **`test_stale_server_address_returns_exit_code_3`**: Write a valid `host:port` to a temp discovery file. Call `resolve_server_addr(None, ...)` with a health-check callback that always returns `Err(ConnectionRefused)`. Assert the error maps to exit code `3` and the error message is exactly: `"Server at <addr> is not reachable. Is it running?"` where `<addr>` is the address from the file. Annotate with `// Covers: 2_TAS-REQ-002H`.
- [ ] **`test_discovery_file_malformed_returns_exit_code_3`**: Write `"garbage content with no colon"` to a temp file. Set `DEVS_DISCOVERY_FILE`. Call `resolve_server_addr(None, ...)`. Assert exit code `3` and message contains the file path and a description of the parse failure.
- [ ] **`test_default_discovery_path_used_when_env_unset`**: Unset `DEVS_DISCOVERY_FILE`. Assert that the resolved default path equals `$HOME/.config/devs/server.addr` (use `dirs::config_dir()` or equivalent to compute expected path). This can be a unit test of the path resolution function alone.

## 2. Task Implementation
- [ ] Create or extend `crates/devs-core/src/discovery.rs` with a public `resolve_server_addr` function:
  ```rust
  pub fn resolve_server_addr(
      explicit: Option<&str>,
      health_check: impl Fn(&str) -> Result<(), DiscoveryError>,
  ) -> Result<String, DiscoveryError>
  ```
- [ ] Implement the precedence chain:
  1. If `explicit` is `Some`, validate format (`host:port` where port is a valid u16), return it. Do NOT read any file. Do NOT perform a health check (the caller will connect and get a normal connection error). [2_TAS-REQ-002J]
  2. Determine discovery file path: check `DEVS_DISCOVERY_FILE` env var; if unset, use `~/.config/devs/server.addr` (resolve `~` via `dirs::config_dir()` or `home::home_dir()`).
  3. Read the file. If missing or unreadable, return `DiscoveryError::FileNotFound { path }` (exit code 3).
  4. Parse content: strip leading/trailing whitespace, validate `host:port` format. If malformed, return `DiscoveryError::Malformed { path, detail }` (exit code 3).
  5. Call `health_check(&addr)`. If it fails, return `DiscoveryError::Stale { addr }` with message `"Server at {addr} is not reachable. Is it running?"` (exit code 3). [2_TAS-REQ-002H]
- [ ] Define `DiscoveryError` enum with variants: `FileNotFound`, `Malformed`, `Stale`, `InvalidExplicit`. Derive `thiserror::Error`. Implement a `pub fn exit_code(&self) -> i32` method returning `3` for `FileNotFound`, `Malformed`, `Stale`; and `1` for `InvalidExplicit`.
- [ ] Ensure `Display` impls produce the exact messages specified in the requirements.

## 3. Code Review
- [ ] Verify `--server` flag precedence is absolute: when `explicit` is `Some`, no file I/O or env var reads occur [2_TAS-REQ-002J].
- [ ] Verify exit code `3` is returned for all stale/missing/malformed discovery scenarios [2_TAS-REQ-002H].
- [ ] Verify error message for stale server matches: `"Server at <addr> is not reachable. Is it running?"` exactly.
- [ ] Verify the health_check callback pattern allows async callers to pass in a gRPC health check without the discovery module depending on tonic.
- [ ] Verify no `unwrap()` or `expect()` on file reads — all I/O errors are mapped to `DiscoveryError`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- discovery` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core` to confirm no regressions.

## 5. Update Documentation
- [ ] Add doc comments to `resolve_server_addr` explaining the precedence chain and exit code contract.
- [ ] Add doc comments to each `DiscoveryError` variant with the exact error message it produces.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the `// Covers: 2_TAS-REQ-002H` and `// Covers: 2_TAS-REQ-002J` annotations appear in `target/traceability.json`.
- [ ] Run `./do lint` and confirm no warnings or errors.
