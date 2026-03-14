# Task: Server Exposes Exactly Two TCP Ports (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-406]

## Dependencies
- depends_on: []
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] Write an architecture fitness test `test_server_exposes_exactly_two_tcp_ports` in the server or core crate that:
  - Asserts the server configuration struct has exactly two port fields: `grpc_port` and `mcp_port`.
  - Asserts there is no `http_port`, `rest_port`, `unix_socket_path`, or similar field.
- [ ] Write a compile-time or lint-level test `test_no_http_listener_bindings` that greps the server crate source for `TcpListener::bind`, `axum::`, `actix::`, `warp::`, `hyper::server`, or `UnixListener` and asserts only exactly two bind calls exist (one for gRPC, one for MCP), or that no HTTP framework imports exist.
- [ ] Write a unit test `test_server_config_rejects_extra_port_fields` that attempts to deserialize a TOML config with an `http_port` key and asserts it is either ignored or produces a validation error.

## 2. Task Implementation
- [ ] Ensure `ServerConfig` (or equivalent) has exactly two port-related fields: `grpc_port: u16` and `mcp_port: u16`. No additional listener fields.
- [ ] Add a doc comment on the config struct: "The server exposes exactly two TCP ports: gRPC and MCP. No HTTP/REST or Unix socket listeners are permitted (2_TAS-REQ-406)."
- [ ] If any HTTP or Unix socket listener code exists, remove it.
- [ ] Add `// Covers: 2_TAS-REQ-406` annotations to each test.

## 3. Code Review
- [ ] Confirm no `TcpListener::bind` calls exist outside the gRPC and MCP server setup.
- [ ] Confirm no HTTP framework dependencies in `Cargo.toml` for the server crate.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- tcp_ports` and the architecture fitness tests. Confirm all pass.

## 5. Update Documentation
- [ ] Add doc comment on the server config struct documenting the two-port constraint.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Run `./do lint` and confirm no new warnings.
