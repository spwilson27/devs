# Task: Implement IPC Transport Layer (Unix Sockets / Named Pipes) for Headless-First Access (Sub-Epic: 01_MCP Protocol Foundation & Standards)

## Covered Requirements
- [3_MCP-REQ-SYS-003], [9_ROADMAP-REQ-SYS-003], [TAS-101]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/ipc_transport.test.ts`, write integration tests that:
  - Import `IpcTransport` and `createIpcServer` from `@devs/mcp/ipc`.
  - On POSIX systems: create an `IpcTransport` bound to a temporary Unix socket path (e.g., `/tmp/devs-test-${Date.now()}.sock`), assert `transport.listen()` resolves and the socket file exists on disk, then assert `transport.close()` removes the socket file.
  - On Windows systems: create an `IpcTransport` using a named pipe path (e.g., `\\.\pipe\devs-test`), assert `transport.listen()` resolves, and `transport.close()` cleans up.
  - Assert that attempting to bind a second `IpcTransport` to the same socket path while the first is listening throws an `AddressInUseError`.
  - Assert that a client connecting to the listening socket via `net.createConnection()` receives a JSON handshake response within 500 ms.
- [ ] In `packages/mcp/src/__tests__/ipc_transport_message.test.ts`, write tests that:
  - Create a loopback IPC server/client pair in the same test process.
  - Send a JSON-RPC 2.0 request over the socket and assert the response is a valid JSON-RPC 2.0 response with a matching `id` field.
  - Assert that malformed (non-JSON) data sent to the socket does not crash the server; the server must respond with a JSON-RPC parse error (`-32700`).

## 2. Task Implementation
- [ ] Create `packages/mcp/src/ipc/index.ts` as the IPC submodule barrel.
- [ ] Create `packages/mcp/src/ipc/ipc_transport.ts` implementing `IpcTransport`:
  - Constructor accepts `{ socketPath: string; onMessage: (msg: JsonRpcRequest) => Promise<JsonRpcResponse> }`.
  - Uses Node.js `net.createServer()` to listen on `socketPath` (on POSIX) or on the named pipe path (on Windows, where `socketPath` should begin with `\\.\pipe\`).
  - Internally frames messages by newline-delimited JSON (NDJSON) so partial chunks are buffered until a full message is received.
  - Implements `listen(): Promise<void>` — starts the server, resolves when ready, rejects with `AddressInUseError` if the address is occupied.
  - Implements `close(): Promise<void>` — gracefully closes all open client sockets, removes the socket file (POSIX only), resolves when fully shut down.
  - On POSIX, before calling `server.listen()`, check for a stale socket file using `fs.existsSync` and call `fs.unlinkSync` to remove it if present (prevents startup failures after crashes).
- [ ] Create `packages/mcp/src/ipc/errors.ts` defining:
  - `AddressInUseError extends Error` with `socketPath: string` property.
  - `IpcMessageParseError extends Error` with `raw: string` and `clientAddress: string` properties.
- [ ] Create `packages/mcp/src/ipc/json_rpc.ts` defining:
  - TypeScript interfaces `JsonRpcRequest`, `JsonRpcResponse`, `JsonRpcError` matching the JSON-RPC 2.0 specification.
  - A `parseJsonRpcRequest(raw: string): JsonRpcRequest` function that throws `IpcMessageParseError` on invalid JSON or missing required fields.
  - A `buildErrorResponse(id: number | string | null, code: number, message: string): JsonRpcResponse` helper.
- [ ] Create `packages/mcp/src/ipc/create_ipc_server.ts` with a `createIpcServer` factory function that:
  - Accepts a `McpServer` instance and a `socketPath`.
  - Creates an `IpcTransport` wired to forward JSON-RPC requests to the `McpServer`'s request handler.
  - Returns `{ listen(): Promise<void>; close(): Promise<void> }`.
- [ ] Export all IPC symbols from `packages/mcp/src/index.ts` under the `ipc` namespace re-export.
- [ ] Platform-detect at runtime using `process.platform === 'win32'` to choose Named Pipe vs Unix Socket path. Document the path convention in a constant: `DEFAULT_IPC_PATH` = `/tmp/devs-orchestrator.sock` (POSIX) or `\\.\pipe\devs-orchestrator` (Windows).

## 3. Code Review
- [ ] Confirm the NDJSON framing logic correctly handles TCP chunking (i.e., a single logical message arriving in multiple `data` events, and multiple messages arriving in a single `data` event).
- [ ] Confirm stale socket cleanup on POSIX happens before `server.listen()` and not after, to avoid a race condition.
- [ ] Confirm all client socket references are tracked in a `Set<net.Socket>` so `close()` can destroy them all before the server closes.
- [ ] Confirm `IpcTransport` does not leak event listeners: all `data`, `error`, and `close` listeners on client sockets are removed when the socket closes.
- [ ] Confirm `createIpcServer` does not expose any non-MCP-spec interface; the IPC layer is purely a transport adapter.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test -- --testPathPattern=ipc` and confirm all tests pass on the current OS.
- [ ] Run the tests with `--forceExit` to guard against dangling socket handles causing Jest to hang.
- [ ] Confirm socket file is cleaned up after tests by asserting `ls /tmp/devs-test-*.sock` returns nothing (POSIX only).

## 5. Update Documentation
- [ ] Add an "IPC Transport" section to `packages/mcp/README.md` documenting:
  - How to start an IPC server using `createIpcServer`.
  - Socket path conventions for POSIX and Windows.
  - The NDJSON framing protocol.
- [ ] Add a note to `docs/agent_memory/phase_3.md`: "The OrchestratorServer is accessible headlessly via a Unix Socket (POSIX) or Named Pipe (Windows) at `DEFAULT_IPC_PATH`. All CLI and Extension clients MUST connect via this IPC transport to ensure parity."
- [ ] Update `ARCHITECTURE.md` with a diagram (Mermaid) showing the IPC transport layer between the CLI/Extension client and the OrchestratorServer.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test -- --coverage --testPathPattern=ipc` and assert line coverage ≥ 85% for `src/ipc/ipc_transport.ts`.
- [ ] Execute a smoke test script: start an IPC server on a test socket path, connect with `net.createConnection`, send a minimal JSON-RPC request, assert a valid JSON-RPC response is received, then close. Assert the script exits 0.
- [ ] Run the full CI pipeline for `@devs/mcp` and assert exit code 0.
