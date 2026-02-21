# Task: OrchestratorServer Lifecycle Integration with devs Engine & run-mcp Entry Point (Sub-Epic: 04_OrchestratorServer Core)

## Covered Requirements
- [3_MCP-TAS-036], [2_TAS-REQ-030], [4_USER_FEATURES-REQ-011], [1_PRD-REQ-INT-003]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/lifecycle.test.ts`, write integration tests that:
  - Test `OrchestratorServer.start()` is idempotent: calling `start()` twice without `stop()` in between resolves with the same port on the second call (does not open a second listener or throw).
  - Test `OrchestratorServer.stop()` is idempotent: calling `stop()` twice resolves cleanly without error.
  - Test that a `SIGTERM` signal emitted in the process triggers an orderly `stop()` (use a forked child process with the server running, send `SIGTERM`, and assert the child exits with code `0` within 5 seconds).
  - Test that `SIGINT` also triggers orderly shutdown — same mechanism as `SIGTERM`.
- [ ] In `packages/mcp/src/__tests__/run-mcp.test.ts`, write tests that:
  - Spawn the `run-mcp` script (e.g., `node packages/mcp/dist/bin/run-mcp.js --port 0 --token test-token`) as a child process.
  - Assert the process prints `{"event":"server_started","port":<n>}` (newline-delimited JSON) to stdout within 3 seconds of startup.
  - Assert the process exits cleanly (`code: 0`) when `SIGTERM` is sent.
  - Assert the process exits with `code: 1` and prints a structured JSON error to stderr when started with `--port -1` (invalid config).
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] In `packages/mcp/src/orchestrator-server.ts`, harden lifecycle:
  - Add a `started: boolean` guard so repeated `start()` calls are no-ops after the first.
  - Register `process.on('SIGTERM', () => this.stop())` and `process.on('SIGINT', () => this.stop())` inside `start()`.
  - On shutdown, log `{ event: "server_stopped", port: this.port, uptimeMs: ... }` to stdout as newline-delimited JSON.
- [ ] Create `packages/mcp/src/bin/run-mcp.ts` — the CLI entry point:
  - Parse CLI args using Node.js `util.parseArgs` (no external CLI libraries): `--port <n>`, `--token <str>`, `--host <str>`.
  - Validate args via `validateConfig()` — on failure, print `{ event: "startup_error", errors: [...] }` to `process.stderr` and exit with code `1`.
  - Instantiate and start `OrchestratorServer`.
  - On successful bind, print `{ event: "server_started", port: <n>, host: "127.0.0.1" }` to `process.stdout` (newline-delimited JSON).
  - Register `SIGTERM` / `SIGINT` handlers that call `server.stop()` and exit `0`.
- [ ] Add the following to `packages/mcp/package.json`:
  - `"bin": { "run-mcp": "dist/bin/run-mcp.js" }` so the script is available as `pnpm run-mcp` or via `npx`.
  - `"scripts": { ..., "run-mcp": "node dist/bin/run-mcp.js" }`.
- [ ] In `packages/mcp/tsconfig.json`, ensure `src/bin/run-mcp.ts` is included in compilation.
- [ ] In the devs engine package (e.g., `packages/core/src/engine.ts`), integrate the `OrchestratorServer`:
  - On engine startup, instantiate `OrchestratorServer` from `@devs/mcp` with config from the devs engine config (port, token from environment/config file).
  - Expose a `getOrchestratorServer(): OrchestratorServer` method on the engine for use by the VSCode Extension and CLI.
  - On engine shutdown, call `orchestratorServer.stop()` as part of the teardown sequence.
  - Wire `setState()` calls so when the engine's internal `OrchestratorState` changes, the MCP server's state is updated synchronously.

## 3. Code Review
- [ ] Confirm `SIGTERM` / `SIGINT` handlers call `server.stop()` and then `process.exit(0)` — no hanging processes.
- [ ] Verify `run-mcp.ts` uses `process.stdout.write(JSON.stringify({...}) + '\n')` for structured output — no `console.log` with human-readable strings that would break machine parsing.
- [ ] Confirm `started` guard prevents double-binding, which would cause an `EADDRINUSE` crash.
- [ ] Confirm engine integration uses dependency injection (the engine does not `require('@devs/mcp')` directly at module load but instead at runtime after config is validated) — supports lazy loading and testability.
- [ ] Verify the shutdown sequence order: stop accepting new connections → drain in-flight → close MCP server → resolve `stop()` promise. No step is skipped.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test` — lifecycle and run-mcp tests must pass.
- [ ] Run `pnpm --filter @devs/mcp build` — no TypeScript errors; confirm `dist/bin/run-mcp.js` exists.
- [ ] Run the run-mcp script directly:
  ```bash
  timeout 5 node packages/mcp/dist/bin/run-mcp.js --port 3200 --token local-test | head -1
  ```
  — assert output is valid JSON with `event: "server_started"`.
- [ ] Test SIGTERM shutdown:
  ```bash
  node packages/mcp/dist/bin/run-mcp.js --port 3201 --token local-test &
  PID=$!; sleep 1; kill -TERM $PID; wait $PID; echo "exit: $?"
  ```
  — must print `exit: 0`.

## 5. Update Documentation
- [ ] Add a `## Running the Server` section to `packages/mcp/README.md`:
  - Document `run-mcp` CLI usage: `node dist/bin/run-mcp.js --port 3100 --token <token>`.
  - Document required env/CLI flags and their defaults.
  - Document JSON structured startup/shutdown log events.
- [ ] Update `packages/core/README.md` (or `docs/architecture/engine.md`) to document the `getOrchestratorServer()` integration point.
- [ ] Update `docs/agent-memory/phase_3.md`: "OrchestratorServer lifecycle: start is idempotent, SIGTERM/SIGINT trigger orderly stop. `run-mcp` entry point emits NDJSON events. Engine integration via `getOrchestratorServer()` — `setState()` keeps MCP server state synchronized with engine state."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test --reporter=json > /tmp/mcp-lifecycle-results.json` and assert exit code `0`.
- [ ] Run `cat /tmp/mcp-lifecycle-results.json | jq '[.testResults[].assertionResults[] | select(.status != "passed")] | length'` — must output `0`.
- [ ] Run end-to-end lifecycle script:
  ```bash
  node packages/mcp/dist/bin/run-mcp.js --port 0 --token e2e-token > /tmp/mcp-run-output.txt &
  MCP_PID=$!
  sleep 1
  # Verify server_started event emitted
  grep -q '"event":"server_started"' /tmp/mcp-run-output.txt && echo "startup: PASS" || echo "startup: FAIL"
  # Send SIGTERM and verify clean exit
  kill -TERM $MCP_PID
  wait $MCP_PID
  [ $? -eq 0 ] && echo "shutdown: PASS" || echo "shutdown: FAIL"
  ```
  — must print both `startup: PASS` and `shutdown: PASS`.
