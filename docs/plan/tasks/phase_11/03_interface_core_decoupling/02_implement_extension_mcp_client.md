# Task: Implement Extension Host MCP Client Bridge (Sub-Epic: 03_Interface_Core_Decoupling)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-008]

## 1. Initial Test Written
- [ ] Create an integration test `packages/vscode/tests/mcp_client_bridge.test.ts`.
- [ ] Mock an MCP Server (using the MCP SDK) that responds to `listResources` and `callTool`.
- [ ] Write a test that initializes the `McpClientBridge` in the extension host and verifies it can successfully connect to the mock server and retrieve the project state.

## 2. Task Implementation
- [ ] Implement the `McpClientBridge` class in `packages/vscode/src/mcp/McpClientBridge.ts`.
- [ ] Use the `@modelcontextprotocol/sdk` to establish a JSON-RPC connection over the project's internal MCP socket.
- [ ] Implement a subscription mechanism that listens for `notifications/resources/updated` from the orchestrator and prepares them for the Webview.
- [ ] Add error handling to catch orchestrator disconnections and propagate them as `BRIDGE_ERROR` events.

## 3. Code Review
- [ ] Ensure the bridge is a singleton managed by the Extension context lifecycle.
- [ ] Verify that the bridge does not attempt to parse or modify the business data, only "tunnels" it from MCP to the internal event bus.
- [ ] Confirm that authentication tokens are correctly passed to the MCP server during the handshake (REQ-SEC-SD-026).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/vscode/tests/mcp_client_bridge.test.ts` and ensure the bridge correctly handles connection, data retrieval, and errors.

## 5. Update Documentation
- [ ] Add a comment block to `McpClientBridge.ts` explaining its role as the strictly-observational conduit between the core and the UI.

## 6. Automated Verification
- [ ] Execute `devs status --json` while the extension is running (in a dev instance) and verify that the bridge logs connection success in the extension output channel.
