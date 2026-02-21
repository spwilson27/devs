# Task: Implement UI-to-Core Tool Call Bridge via MCP (Sub-Epic: 05_UI_Interaction_Triggers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-009]

## 1. Initial Test Written
- [ ] Create an integration test for the `useToolCall` hook to verify it sends a `TOOL_CALL` message to the extension host.
- [ ] Implement a mock for the VSCode `postMessage` API and verify the message structure matches the SAOP envelope.
- [ ] Ensure that the hook returns the response from the orchestrator (or an error) asynchronously.

## 2. Task Implementation
- [ ] Implement the `useToolCall()` hook in `@devs/ui-hooks`. This hook should:
    - Provide a `callTool(toolName, args)` function to components.
    - Use the `vscode.postMessage` API to dispatch tool requests to the extension host.
    - Handle the `message` event from the extension host to receive tool results.
- [ ] Add the message listener to the extension host (`@devs/vscode`) to handle tool call requests.
- [ ] Forward the request to the `OrchestratorServer` via the MCP bridge established in Sub-Epic 01.

## 3. Code Review
- [ ] Verify that the `TOOL_CALL` message follows the strictly-typed JSON schema of the SAOP protocol.
- [ ] Ensure that the extension host correctly throttles high-frequency tool calls (max 60fps).
- [ ] Confirm that tool call results are correctly delivered back to the UI's `useToolCall` hook via `postMessage`.

## 4. Run Automated Tests to Verify
- [ ] Execute the `useToolCall` integration tests in a mock Webview environment.
- [ ] Run `pnpm build` to verify the bundling of the new bridge code.

## 5. Update Documentation
- [ ] Document the tool call flow between the UI and the Orchestrator in the project's architecture documentation.
- [ ] Add usage examples for `useToolCall` in the `@devs/ui-hooks` README.

## 6. Automated Verification
- [ ] Run a shell script that checks for the existence of the `useToolCall` hook and the extension host message handler.
- [ ] Validate the SAOP envelope structure used for tool call messages against the project's JSON schema.
