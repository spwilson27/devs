# Task: Implement devs-mcp-bridge stdio proxy (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-007]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-proto]

## 1. Initial Test Written
- [ ] Create a new crate `crates/devs-mcp-bridge`.
- [ ] Write an integration test that spawns the `devs-mcp-bridge` binary.
- [ ] The test should pipe a mock JSON-RPC request to its stdin and assert that it receives a response on stdout.
- [ ] Mock the MCP HTTP server using `wiremock` or similar to verify that the bridge correctly forwards the request and returns the response.
- [ ] // Covers: [3_MCP_DESIGN-REQ-007]

## 2. Task Implementation
- [ ] Implement the `main` function in `crates/devs-mcp-bridge/src/main.rs`.
- [ ] Use `tokio::io::stdin()` and `tokio::io::stdout()` to read/write JSON-RPC lines.
- [ ] Implement the discovery protocol (shared component `devs-grpc`) to find the MCP server address.
- [ ] Implement an HTTP client to forward JSON-RPC payloads to the MCP port.
- [ ] Handle connection loss: if the HTTP request fails or the connection is dropped, write a structured error object to stdout and exit with code 1.
- [ ] Ensure all output to stdout is newline-delimited JSON.

## 3. Code Review
- [ ] Verify that the bridge does not log sensitive information to stdout/stderr.
- [ ] Ensure the bridge correctly handles partial reads from stdin (buffers until `\n`).
- [ ] Verify that the discovery protocol is only run once at startup.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp-bridge`.
- [ ] Verify that the integration test passes.

## 5. Update Documentation
- [ ] Update `README.md` to document how to use `devs-mcp-bridge` with stdio-only MCP clients.

## 6. Automated Verification
- [ ] Run `./do presubmit` to ensure no regressions and verify traceability.
