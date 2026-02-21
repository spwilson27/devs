# Task: MCP Handshake 100% Success Rate Verification (Sub-Epic: 13_Definition of Done)

## Covered Requirements
- [9_ROADMAP-DOD-P2], [9_ROADMAP-REQ-023]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/dod/mcp-handshake.dod.test.ts`, write a test suite named `"[DoD-P2] MCP Handshake – 100% Success Rate"`.
- [ ] Write a test `"should complete initialize handshake for every registered MCP tool"`:
  - Enumerate all MCP tools registered in `@devs/mcp-server` (e.g., `surgical_edit`, `run_tests`, `read_file`, `write_file`, `exec_command` — load from the tool registry, not a hardcoded list).
  - For each tool, perform the full `@modelcontextprotocol/sdk` handshake sequence: `initialize` → `tools/list` → verify the tool appears → `tools/call` with a benign no-op payload.
  - Assert each handshake completes without error and returns a valid `CallToolResult`.
  - Assert the overall success rate is `totalSucceeded / totalTools === 1.0`.
- [ ] Write a test `"should return a structured error (not crash) for malformed tool calls"`:
  - Call a registered tool with a deliberately malformed JSON payload (missing required fields).
  - Assert the server responds with an MCP-compliant error envelope (`{ error: { code, message } }`) rather than a transport-level crash.
- [ ] Write a test `"should persist MCP handshake DoD result to state.sqlite"`:
  - Assert a row with `criterion: "MCP_HANDSHAKE"`, `result: "PASS"`, and `detail` containing `{ totalTools, succeededTools, failedTools: [] }` is present in `dod_results`.
- [ ] Confirm all tests start **RED**.

## 2. Task Implementation
- [ ] In `packages/sandbox/src/dod/mcp-handshake-verifier.ts`, implement and export `class McpHandshakeVerifier`.
  - Constructor accepts an `McpServerProcess` handle (a running instance of `@devs/mcp-server`), a `McpClient` (from `@modelcontextprotocol/sdk`), and a `DatabaseService`.
  - Method `run(): Promise<McpHandshakeResult>` that:
    1. Calls `McpClient.initialize()` to perform the SDK handshake.
    2. Calls `McpClient.listTools()` to retrieve the full tool list.
    3. For each tool, calls `McpClient.callTool(tool.name, tool.noOpPayload)` where `noOpPayload` satisfies the tool's input schema with safe, benign values.
    4. Tracks `succeededTools` and `failedTools`.
    5. Computes `successRate = succeededTools.length / totalTools`.
    6. Persists to `dod_results` with `criterion: "MCP_HANDSHAKE"` and `detail: { totalTools, succeededTools, failedTools }`.
    7. Returns `{ pass: successRate === 1.0, successRate, totalTools, succeededTools, failedTools }`.
- [ ] Implement a `noOpPayload` generator in `packages/sandbox/src/dod/mcp-noop-payload-factory.ts`: given a JSON Schema describing a tool's inputs, generate a valid minimal payload using default/empty values (strings → `""`, numbers → `0`, booleans → `false`, arrays → `[]`, objects → `{}`).
- [ ] Ensure `McpHandshakeVerifier` starts a fresh `McpServerProcess` (not a shared instance) so the handshake exercises the real server bootstrap path.

## 3. Code Review
- [ ] Verify the tool list is read dynamically from `McpClient.listTools()`, not hardcoded, so any newly registered tool is automatically included.
- [ ] Verify `successRate === 1.0` is a strict equality check (not `>=`).
- [ ] Verify `McpHandshakeVerifier` tears down the `McpServerProcess` in a `finally` block.
- [ ] Verify the malformed-payload error test does not use `try/catch` to swallow MCP errors — it must assert on the error envelope structure.
- [ ] Verify the `noOpPayload` factory does not call external services or perform I/O — it is a pure schema-to-value transformer.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test:integration -- --testPathPattern=dod/mcp-handshake` and confirm all tests pass (GREEN).
- [ ] Confirm test output prints `MCP Handshake: 100% (N/N tools succeeded)`.
- [ ] Confirm `state.sqlite`: `sqlite3 .devs/state.sqlite "SELECT detail FROM dod_results WHERE phase='P2' AND criterion='MCP_HANDSHAKE';"` returns a row with `failedTools: []`.

## 5. Update Documentation
- [ ] In `packages/mcp-server/.agent.md`, add a section `## DoD Verification` documenting the `MCP_HANDSHAKE` criterion, the handshake sequence, and the no-op payload factory.
- [ ] Update `docs/phase_2_dod.md` with row: `| P2 | MCP_HANDSHAKE | 100% agent-to-tool handshake success | McpHandshakeVerifier | state.sqlite:dod_results |`.
- [ ] Document the `noOpPayload` generator contract so future tool authors know to expose a minimal-valid-input schema.

## 6. Automated Verification
- [ ] The script `scripts/verify-dod.sh P2 MCP_HANDSHAKE` must query `state.sqlite` for `phase='P2' AND criterion='MCP_HANDSHAKE' AND result='PASS'` and exit `0` / `1`.
- [ ] The script must also print `totalTools` and `failedTools` from `detail` JSON for observability.
- [ ] Confirm CI gate is in place before Phase 3 can begin.
