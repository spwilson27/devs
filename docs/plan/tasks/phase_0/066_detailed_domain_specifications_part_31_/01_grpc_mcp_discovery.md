# Task: Implement GetInfo and Update Discovery Protocol (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-405]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-server, devs-grpc]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-server` that verifies the discovery file is written containing only the gRPC port (e.g., `127.0.0.1:7890`).
- [ ] Write an integration test that connects to the gRPC server and calls `ServerService.GetInfo`, asserting that it returns the correct MCP port.
- [ ] Write a test in `devs-grpc` that uses the discovery file to locate the gRPC server and then successfully retrieves the MCP port via `GetInfo`.

## 2. Task Implementation
- [ ] Update `proto/devs/v1/server.proto` to include the `GetInfo` RPC in `ServerService`.
    - `message GetInfoRequest {}`
    - `message GetInfoResponse { uint32 mcp_port = 1; string version = 2; }`
- [ ] Implement `GetInfo` in `devs-server`'s `ServerService` implementation, returning the configured MCP port.
- [ ] Modify the server startup logic in `devs-server` to write the discovery file with ONLY the gRPC host and port (remove any previously included MCP port).
- [ ] Update the `ClientChannel` or equivalent in `devs-grpc` to perform a two-step discovery:
    1. Read gRPC address from discovery file.
    2. Call `GetInfo` to resolve the MCP address.

## 3. Code Review
- [ ] Verify that the discovery file format is strictly `host:port` (UTF-8).
- [ ] Ensure `GetInfo` is added to the gRPC reflection service if enabled.
- [ ] Check that the MCP port returned by `GetInfo` matches the actual port the MCP server is bound to.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -p devs-grpc`.
- [ ] Verify that all discovery-related tests pass.

## 5. Update Documentation
- [ ] Update the `Server Discovery` section in `README.md` or internal docs to reflect the two-step MCP discovery process.
- [ ] Record the protocol change in the project "memory".

## 6. Automated Verification
- [ ] Run `./do test` and check `target/traceability.json` for `2_TAS-REQ-405`.
