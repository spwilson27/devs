# Task: Implement `run-mcp` Script to Start the Project's Internal MCP Server (Sub-Epic: 18_MCP Scripts and Profiling Tools)

## Covered Requirements
- [2_TAS-REQ-013]

## 1. Initial Test Written

- [ ] Create `scripts/__tests__/run-mcp.test.ts`.
- [ ] Write a unit test that mocks `src/mcp/server.ts` (the MCP server factory) and verifies that running the `run-mcp` script entry point calls `startMcpServer({ port, transport })` exactly once with arguments derived from CLI flags or environment variables.
- [ ] Write a unit test verifying that when `--transport=stdio` is passed, the server is started with `transport: 'stdio'` and no TCP port is bound.
- [ ] Write a unit test verifying that when `--transport=http --port=3100` is passed, the server starts with `{ transport: 'http', port: 3100 }`.
- [ ] Write a unit test verifying that if the MCP server throws during startup (simulated by the mock), the script catches the error, logs it to stderr with a structured `{ level: 'error', event: 'MCP_START_FAILED', message: '...' }` JSON line, and exits with code `1`.
- [ ] Write a unit test that verifies the script registers `SIGINT` and `SIGTERM` handlers that call `server.shutdown()` and `process.exit(0)` gracefully.
- [ ] Write an integration test that spawns `node scripts/run-mcp.js --transport=stdio` as a child process and verifies it writes a JSON line `{ "event": "MCP_SERVER_READY", "transport": "stdio" }` to stdout within 5 seconds before sending `SIGTERM` and confirming the process exits cleanly (exit code `0`).
- [ ] All tests must fail before implementation (red phase confirmed).

## 2. Task Implementation

- [ ] Create `scripts/run-mcp.ts` as the entry point.
- [ ] Parse CLI arguments: `--transport=<stdio|http>` (default: `stdio`), `--port=<number>` (default: `3099`, only relevant for `http` transport), `--project-root=<path>` (default: `process.cwd()`).
- [ ] Import and call `startMcpServer(config)` from `src/mcp/server.ts`, passing the resolved config.
- [ ] On successful server start, emit a structured JSON log line to stdout: `JSON.stringify({ event: 'MCP_SERVER_READY', transport, port: transport === 'http' ? port : null, pid: process.pid })`.
- [ ] Register `process.on('SIGINT', gracefulShutdown)` and `process.on('SIGTERM', gracefulShutdown)` where `gracefulShutdown` calls `await server.shutdown()` then `process.exit(0)`.
- [ ] Wrap the startup sequence in a top-level `try/catch`; on error, emit `JSON.stringify({ level: 'error', event: 'MCP_START_FAILED', message: err.message })` to stderr and call `process.exit(1)`.
- [ ] Add `// [2_TAS-REQ-013]` requirement tracing comment at the top of the file.
- [ ] Add `"run-mcp": "node scripts/run-mcp.js"` to the `scripts` section of `package.json`.

## 3. Code Review

- [ ] Confirm both `stdio` and `http` transport modes are handled without shared mutable state between the two paths.
- [ ] Verify the graceful shutdown handler awaits async cleanup before calling `process.exit`; confirm there is no risk of the process hanging if `server.shutdown()` never resolves (add a shutdown timeout of ≤ 5 seconds with `Promise.race`).
- [ ] Confirm all log output uses structured JSON (no bare `console.log` with string interpolation) to support log ingestion pipelines.
- [ ] Verify the script does not import the entire `devs-core` bundle; only the `src/mcp/server.ts` module and its transitive dependencies.
- [ ] Confirm `--port` value is validated to be a valid integer in range [1024, 65535] before passing to the server.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="run-mcp"` and confirm all tests pass.
- [ ] Run `npm run build` to confirm TypeScript compiles without errors.
- [ ] Start the server manually with `node scripts/run-mcp.js --transport=stdio` and verify the ready message appears on stdout within 3 seconds, then send `SIGTERM` and confirm clean exit.

## 5. Update Documentation

- [ ] Create `scripts/run-mcp.agent.md` documenting: purpose, CLI flags, environment variables, transport modes, structured log events (`MCP_SERVER_READY`, `MCP_START_FAILED`), and graceful shutdown behavior.
- [ ] Update the top-level `README.md` (or `docs/scripts.md`) to include a "Starting the MCP Server" section showing both `stdio` and `http` usage examples.
- [ ] Update `package.json` `devs` section (per `[TAS-006]`) to reference this script under `scripts.runMcp`.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="run-mcp" --coverage` and verify ≥ 90% line coverage for `scripts/run-mcp.ts`.
- [ ] Run `npx tsc --noEmit` and verify exit code is `0`.
- [ ] Spawn `node scripts/run-mcp.js --transport=stdio` in a subprocess, read stdout for 5 seconds, and assert the `MCP_SERVER_READY` JSON event is present; then send `SIGTERM` and assert exit code `0`. This verification must be scripted (e.g., as an npm script `verify:run-mcp`) and produce a machine-readable pass/fail result.
