# Task: Client-Server Communication via gRPC or MCP Only (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-407]

## Dependencies
- depends_on: ["02_server_two_tcp_ports_only.md"]
- shared_components: ["devs-core", "Server Discovery Protocol"]

## 1. Initial Test Written
- [ ] Write an architecture fitness test `test_no_shared_memory_ipc` that scans all crate sources (excluding test code) for usage of `shared_memory`, `mmap`, `UnixStream`, `UnixListener`, `named_pipe`, or `windows::Win32::System::Pipes` and asserts zero matches.
- [ ] Write an architecture fitness test `test_no_unix_domain_socket_listener` that scans the server crate for `UnixListener::bind` or `tokio::net::UnixListener` and asserts zero matches.
- [ ] Write a documentation-level test `test_client_communication_contract` that asserts a constant or doc comment exists declaring: "All client-to-server communication uses gRPC or MCP TCP ports exclusively."

## 2. Task Implementation
- [ ] Add a module-level doc comment in the server's network/listener module: "All client-to-server communication goes through either the gRPC port or the MCP port. No shared memory, Unix domain sockets, or named pipes are used for client-server IPC (2_TAS-REQ-407)."
- [ ] If any Unix socket, shared memory, or named pipe code exists for client-server communication, remove it.
- [ ] Add `// Covers: 2_TAS-REQ-407` annotations to each test.

## 3. Code Review
- [ ] Verify no IPC mechanisms other than TCP (gRPC/MCP) exist for client-server communication.
- [ ] Verify the architecture fitness tests are comprehensive in their pattern matching.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- communication_contract` and the architecture fitness tests. Confirm all pass.

## 5. Update Documentation
- [ ] Ensure the server module docs clearly state the gRPC/MCP-only communication contract.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` and confirm zero failures.
