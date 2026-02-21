# Task: MCP Tool-Rich Environment Integration (Sub-Epic: 37_1_PRD)

## Covered Requirements
- [1_PRD-REQ-NEED-AGENT-02]

## 1. Initial Test Written
- [ ] Create `tests/mcp/tools_integration.test.ts`.
- [ ] Write integration tests connecting a mock MCP client to the server.
- [ ] Assert successful execution of `FileSystemTool.read`, `TerminalTool.execute`, and `ProfilerTool.start` via the MCP protocol.
- [ ] Write tests verifying that unauthorized or out-of-sandbox file system access attempts are explicitly rejected.

## 2. Task Implementation
- [ ] In `src/mcp/tools/`, implement `FileSystemTool`, `TerminalTool`, and a mock `ProfilerTool`.
- [ ] Register these tools with the main MCP server instance, providing JSON schemas for their arguments.
- [ ] Implement the sandboxing logic ensuring the `TerminalTool` uses the WebContainer or Docker sandbox API and `FileSystemTool` is restricted to the workspace `/workspace` directory.

## 3. Code Review
- [ ] Verify rigorous input sanitization (Anti-injection) on the `TerminalTool` arguments.
- [ ] Ensure standard output and standard error from terminal commands are correctly multiplexed and returned in the MCP response envelope.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test tests/mcp/tools_integration.test.ts` to confirm the MCP tools are accessible and sandboxed correctly.

## 5. Update Documentation
- [ ] Update `specs/3_mcp_design.md` or relevant MCP documentation with the detailed JSON schemas of the new FileSystem, Terminal, and Profiler tools.
- [ ] Update the system prompt or agent memory to notify the agents of the newly available debugging and filesystem tools.

## 6. Automated Verification
- [ ] Run the test suite or a mock MCP payload script (e.g., `node scripts/test_mcp_tools.js`) to confirm the tool-rich environment is successfully registered and functioning.
