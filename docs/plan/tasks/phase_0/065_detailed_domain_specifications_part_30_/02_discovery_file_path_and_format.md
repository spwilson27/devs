# Task: Discovery File Path Resolution and Format (Sub-Epic: 065_Detailed Domain Specifications (Part 30))

## Covered Requirements
- [2_TAS-REQ-401], [2_TAS-REQ-402]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (Server Discovery Protocol)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/` (or `src/discovery.rs` unit tests), create tests for discovery file path resolution:
  - `test_discovery_path_env_var_takes_precedence`: Set `DEVS_DISCOVERY_FILE` env var, set `server.discovery_file` in config, assert resolved path equals the env var value
  - `test_discovery_path_config_fallback`: Unset env var, set `server.discovery_file` in config to `/tmp/custom.addr`, assert resolved path equals `/tmp/custom.addr`
  - `test_discovery_path_default_fallback`: Unset env var, no config override, assert resolved path equals `~/.config/devs/server.addr` (with home dir expansion)
- [ ] Create tests for discovery file format:
  - `test_discovery_file_write_format`: Write a discovery file via the `write_discovery_file` function, read it back as raw bytes, assert content is exactly `<host>:<port>` (e.g., `127.0.0.1:50051`)
  - `test_discovery_file_read_strips_whitespace`: Write a file containing `  127.0.0.1:50051\n  `, read via `read_discovery_file`, assert parsed address equals `127.0.0.1:50051`
  - `test_discovery_file_read_no_trailing_newline`: Write `127.0.0.1:50051` with no trailing newline, read and parse, assert success
  - `test_discovery_file_invalid_format`: Write `not-a-valid-addr`, attempt to parse, assert error

## 2. Task Implementation
- [ ] In `devs-core/src/discovery.rs`, implement `resolve_discovery_path(config: Option<&str>) -> PathBuf`:
  1. Check `std::env::var("DEVS_DISCOVERY_FILE")` — if set and non-empty, return that path
  2. Check `config` parameter (from `server.discovery_file` TOML key) — if `Some`, return that path
  3. Default: return `dirs::config_dir().join("devs/server.addr")`
- [ ] Implement `write_discovery_file(path: &Path, host: &str, port: u16) -> Result<()>`:
  - Write `format!("{host}:{port}")` as plain UTF-8 to the file (atomic write via temp + rename)
- [ ] Implement `read_discovery_file(path: &Path) -> Result<SocketAddr>` (or `Result<String>`):
  - Read file contents, trim whitespace, parse as `<host>:<port>`
  - Return error if format is invalid

## 3. Code Review
- [ ] Verify the three-tier resolution order: env var → config → default
- [ ] Verify write produces plain UTF-8 `<host>:<port>` with no extraneous content
- [ ] Verify read trims whitespace before parsing

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- discovery`

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-401` to path resolution tests
- [ ] Add `// Covers: 2_TAS-REQ-402` to format tests

## 6. Automated Verification
- [ ] Run `./do test` and confirm all tests pass
- [ ] Grep for `// Covers: 2_TAS-REQ-401` and `// Covers: 2_TAS-REQ-402` and confirm matches exist
