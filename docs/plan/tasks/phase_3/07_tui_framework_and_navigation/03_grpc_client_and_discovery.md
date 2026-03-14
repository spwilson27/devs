# Task: gRPC Client Connection and Server Discovery (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-003], [6_UI_UX_ARCHITECTURE-REQ-008], [6_UI_UX_ARCHITECTURE-REQ-009], [6_UI_UX_ARCHITECTURE-REQ-010], [6_UI_UX_ARCHITECTURE-REQ-011], [6_UI_UX_ARCHITECTURE-REQ-013], [6_UI_UX_ARCHITECTURE-REQ-014], [6_UI_UX_ARCHITECTURE-REQ-021], [6_UI_UX_ARCHITECTURE-REQ-023], [6_UI_UX_ARCHITECTURE-REQ-024], [6_UI_UX_ARCHITECTURE-REQ-025], [6_UI_UX_ARCHITECTURE-REQ-033], [6_UI_UX_ARCHITECTURE-REQ-034], [6_UI_UX_ARCHITECTURE-REQ-035], [6_UI_UX_ARCHITECTURE-REQ-036], [6_UI_UX_ARCHITECTURE-REQ-037], [6_UI_UX_ARCHITECTURE-REQ-038], [6_UI_UX_ARCHITECTURE-REQ-044], [6_UI_UX_ARCHITECTURE-REQ-045], [6_UI_UX_ARCHITECTURE-REQ-046], [6_UI_UX_ARCHITECTURE-REQ-047], [6_UI_UX_ARCHITECTURE-REQ-071], [6_UI_UX_ARCHITECTURE-REQ-072], [6_UI_UX_ARCHITECTURE-REQ-073], [6_UI_UX_ARCHITECTURE-REQ-074], [6_UI_UX_ARCHITECTURE-REQ-075], [6_UI_UX_ARCHITECTURE-REQ-076], [6_UI_UX_ARCHITECTURE-REQ-077], [6_UI_UX_ARCHITECTURE-REQ-078], [6_UI_UX_ARCHITECTURE-REQ-079], [6_UI_UX_ARCHITECTURE-REQ-221], [6_UI_UX_ARCHITECTURE-REQ-335], [6_UI_UX_ARCHITECTURE-REQ-336]

## Dependencies
- depends_on: [01_tui_crate_scaffold_and_event_loop.md]
- shared_components: [devs-core (consumer — Server Discovery Protocol), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write test for discovery file reading: create temp file with `127.0.0.1:7890`, verify parsed as `(host, port)` tuple (REQ-008)
- [ ] Write test for `DEVS_DISCOVERY_FILE` env var override: set env var to custom path, verify it takes precedence over default `~/.config/devs/server.addr` (REQ-044)
- [ ] Write test for discovery precedence: `--server` flag > `DEVS_SERVER` env > `devs.toml` > `DEVS_DISCOVERY_FILE` > default path (REQ-008, REQ-221)
- [ ] Write test for `~` expansion using `dirs::home_dir()` at use time, not stored literally (REQ-335)
- [ ] Write test for Windows path: `USERPROFILE` or `HOMEDRIVE+HOMEPATH` for home directory (REQ-336)
- [ ] Write test for discovery file containing only gRPC address, MCP port obtained via `GetInfo` RPC (REQ-009, REQ-010)
- [ ] Write test for missing discovery file returning appropriate error with `server_unreachable` prefix (REQ-011)
- [ ] Write test for version header `x-devs-client-version` attached to all gRPC requests (REQ-023)
- [ ] Write test for version mismatch `FAILED_PRECONDITION` response: display message, exit code 1 (REQ-024)
- [ ] Write test for lazy channel connection with 5-second timeout on first RPC (REQ-013)
- [ ] Write test that no API keys or credentials exist in client code (REQ-047)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/discovery.rs` implementing `discover_server(config: &DiscoveryConfig) -> Result<ServerAddr>` with full precedence chain (REQ-008, REQ-221)
- [ ] Implement `~` expansion via `dirs::home_dir()` with Windows fallback to `USERPROFILE`/`HOMEDRIVE+HOMEPATH` (REQ-335, REQ-336)
- [ ] Implement discovery file parsing: read single line `<host>:<port>` (REQ-008)
- [ ] Create `crates/devs-tui/src/connection.rs` implementing `GrpcClient` that wraps tonic channels (REQ-003)
- [ ] Implement lazy channel connection: channel created on first RPC call, with 5-second connect timeout (REQ-013, REQ-014)
- [ ] Implement version header interceptor: attach `x-devs-client-version` metadata using `env!("CARGO_PKG_VERSION")` to every request (REQ-023, REQ-024)
- [ ] Handle `FAILED_PRECONDITION` gRPC status as version mismatch error with formatted message (REQ-024, REQ-025)
- [ ] Implement `GetInfo` RPC call to retrieve MCP port from server (REQ-010)
- [ ] Path normalization: convert backslashes to forward slashes on Windows in `connection.rs` (REQ-046)
- [ ] Ensure no credential/API key fields exist anywhere in the TUI crate (REQ-047)

## 3. Code Review
- [ ] Verify discovery precedence order matches spec exactly (REQ-221)
- [ ] Verify no hardcoded MCP port assumption (REQ-009)
- [ ] Verify version header on all outgoing RPCs (REQ-023)
- [ ] Verify no secrets/credentials in client code (REQ-047)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- discovery` and `cargo test -p devs-tui -- connection`

## 5. Update Documentation
- [ ] Add doc comments to discovery and connection modules

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `grep -r "api_key\|secret\|password\|credential" crates/devs-tui/src/ | grep -v test | grep -v "//.*Covers"` and confirm empty output
