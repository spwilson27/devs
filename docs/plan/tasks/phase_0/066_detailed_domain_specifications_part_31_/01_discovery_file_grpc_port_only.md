# Task: Discovery File Encodes gRPC Port Only (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-405]

## Dependencies
- depends_on: ["none"]
- shared_components: ["Server Discovery Protocol", "devs-core"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/discovery.rs` (or the module that owns the discovery file logic), write a unit test `test_discovery_file_contains_grpc_port_only` that:
  - Creates a discovery file via the project's discovery-file write function.
  - Reads the file back and asserts the content is exactly `host:grpc_port` on a single line (no MCP port, no JSON, no additional fields).
  - Asserts that parsing the file yields only the gRPC address and no MCP port field.
- [ ] Write a unit test `test_mcp_port_not_in_discovery_file` that writes a discovery file with a server that has both gRPC and MCP ports configured, then asserts the MCP port does NOT appear anywhere in the discovery file content.
- [ ] Write an integration test `test_client_obtains_mcp_port_via_getinfo` that:
  - Parses a discovery file to get the gRPC address.
  - Asserts the parsed result has a method or field for gRPC address but no MCP port.
  - Documents (via comment) that MCP port retrieval happens through `ServerService.GetInfo` RPC, not the discovery file.

## 2. Task Implementation
- [ ] In the discovery file write function, ensure the serialization format is strictly `host:grpc_port` (a single line, no trailing newline beyond the line terminator). Remove or never include MCP port information.
- [ ] In the discovery file read/parse function, ensure the return type provides only the gRPC endpoint address. If a struct is used, it must not have an `mcp_port` field. Add a doc comment stating: "MCP port is obtained via `ServerService.GetInfo` gRPC call, not from the discovery file."
- [ ] Add a `// Covers: 2_TAS-REQ-405` annotation to each test.

## 3. Code Review
- [ ] Verify the discovery file write path has no code path that could include MCP port information.
- [ ] Verify the parse return type does not expose an MCP port field.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- discovery` and confirm all new tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the discovery write function clarifying the gRPC-only contract.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Grep test output for the new test names to confirm they executed.
