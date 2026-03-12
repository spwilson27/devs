# Task: Server Startup: Discovery File Management & Accept Interlock (Sub-Epic: 065_Detailed Domain Specifications (Part 30))

## Covered Requirements
- [2_TAS-REQ-401], [2_TAS-REQ-402], [2_TAS-REQ-404]

## Dependencies
- depends_on: [01_server_startup_config_validation.md]
- shared_components: [devs-server]

## 1. Initial Test Written
- [ ] Create a unit test for the discovery file path resolver in `devs-server/src/discovery.rs` that verifies the precedence: `DEVS_DISCOVERY_FILE` env var (first), `server.discovery_file` in `devs.toml` (second), and `~/.config/devs/server.addr` (last).
- [ ] Create a unit test for the discovery file writer that verifies the output format is exactly `<host>:<port>` as UTF-8 without a mandatory trailing newline.
- [ ] Create an integration test that attempts to connect to the gRPC service of a starting server and verifies it only succeeds *after* the discovery file is present.

## 2. Task Implementation
- [ ] Implement the `DiscoveryManager` in `devs-server`.
- [ ] Implement the path resolution logic following the specified precedence rules ([2_TAS-REQ-401]).
- [ ] Implement the atomic write protocol for the discovery file (write-to-temp then rename) and ensure it uses the `<host>:<port>` format ([2_TAS-REQ-402]).
- [ ] In the server startup sequence, place the call to `DiscoveryManager::publish_address()` *after* the ports are bound but *before* the servers begin accepting connections.
- [ ] Ensure that the servers (gRPC and MCP) do not start their main loops (accepting new clients) until the `DiscoveryManager::publish_address()` call has completed successfully ([2_TAS-REQ-404]).

## 3. Code Review
- [ ] Verify that the discovery file contains no extraneous characters (e.g., no surrounding spaces).
- [ ] Ensure that parent directories of the discovery file are created if missing.
- [ ] Verify that a failure to write the discovery file prevents the server from proceeding to accept connections.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --lib discovery` and ensure all discovery logic tests pass.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_0/065_detailed_domain_specifications_part_30_/REPORTS.md` with details on discovery file resolution and the acceptance interlock mechanism.

## 6. Automated Verification
- [ ] Run a shell command that sets `DEVS_DISCOVERY_FILE` to a custom path, starts the server, and verifies the file exists at that path with the correct format.
