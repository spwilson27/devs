# Task: Discovery File Write/Delete Protocol (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [1_PRD-REQ-003], [2_TAS-REQ-077], [2_TAS-REQ-078], [5_SECURITY_DESIGN-REQ-030]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["Server Discovery Protocol (owner - writer side)", "devs-core (consumer - protocol definition)"]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/discovery_test.rs`:
  - `test_discovery_file_contains_host_colon_port`: Write discovery; read file; assert content matches `127.0.0.1:7890\n` (single line, UTF-8).
  - `test_discovery_file_atomic_write`: Verify write uses temp-file-then-rename (check no partial content visible during write by reading concurrently).
  - `test_discovery_file_default_path`: Assert default path is `~/.config/devs/server.addr`.
  - `test_devs_discovery_file_env_overrides_path`: Set `DEVS_DISCOVERY_FILE` env; assert file written to custom path.
  - `test_discovery_file_mode_0600_on_unix`: On unix, assert file permissions are `0o600`.
  - `test_discovery_file_deleted_on_shutdown`: Write discovery, call delete, verify file absent.
  - `test_client_discovery_precedence`: Unit test the resolution function: `--server` flag wins over config wins over discovery file.
- [ ] In `crates/devs-core/tests/discovery_protocol_test.rs`:
  - `test_parse_discovery_file_valid`: Parse `"127.0.0.1:7890"` → `SocketAddr`.
  - `test_parse_discovery_file_invalid_format`: Assert error on malformed content.

## 2. Task Implementation
- [ ] In `devs-core`, define `DiscoveryProtocol` module:
  - `parse_discovery_file(content: &str) -> Result<SocketAddr>`.
  - `resolve_server_addr(cli_flag: Option<&str>, config: Option<&str>, discovery_path: &Path) -> Result<SocketAddr>` implementing [2_TAS-REQ-078] precedence.
  - `default_discovery_path() -> PathBuf` returning `~/.config/devs/server.addr`.
  - `discovery_path() -> PathBuf` checking `DEVS_DISCOVERY_FILE` env first.
- [ ] In `devs-server`, implement `DiscoveryWriter`:
  - `write(addr: SocketAddr) -> Result<()>`: Write to temp file, set mode `0600` (unix), rename to target path.
  - `delete() -> Result<()>`: Remove the file, ignore `ENOENT`.
- [ ] Wire `DiscoveryWriter::write` into startup step 9 and `DiscoveryWriter::delete` into shutdown.

## 3. Code Review
- [ ] Confirm atomic rename (not write-in-place) for the discovery file.
- [ ] Verify file mode is `0600` on Unix per [5_SECURITY_DESIGN-REQ-030].
- [ ] Ensure `DEVS_DISCOVERY_FILE` is checked at runtime, not compile time.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- discovery` and `cargo test -p devs-core -- discovery` with zero failures.

## 5. Update Documentation
- [ ] Add doc comments to discovery module.
- [ ] Add `// Covers: 1_PRD-REQ-003, 2_TAS-REQ-077, 2_TAS-REQ-078, 5_SECURITY_DESIGN-REQ-030` annotations.

## 6. Automated Verification
- [ ] Run `./do test` with zero failures.
