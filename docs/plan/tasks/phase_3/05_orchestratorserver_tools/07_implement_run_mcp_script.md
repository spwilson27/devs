# Task: Implement `run-mcp` Script to Start the Project's Internal MCP Server (Sub-Epic: 05_OrchestratorServer Tools)

## Covered Requirements
- [2_TAS-REQ-013]

## 1. Initial Test Written
- [ ] In `packages/core/src/__tests__/run_mcp_script.test.ts`, write unit tests for the script's startup logic (extracted into a testable `startMcpServer(config)` function):
  - Test: `startMcpServer({ port: 3100, authToken: "test-token", projectRoot: "/tmp/test-project" })` calls `createOrchestratorServer` with the correct config derived from the project root's `devs.config.json`.
  - Test: if `devs.config.json` is missing from `projectRoot`, `startMcpServer` throws an error with message `"devs.config.json not found at <path>"`.
  - Test: if `DEVS_MCP_AUTH_TOKEN` environment variable is set, it overrides the `authToken` from config.
  - Test: if `DEVS_MCP_PORT` environment variable is set, it overrides the `port` from config (must parse as a valid port number 1–65535).
  - Test: `DEVS_MCP_PORT=abc` results in a startup error `"Invalid DEVS_MCP_PORT: 'abc' is not a valid port number"`.
- [ ] In `packages/core/src/__tests__/run_mcp_script.integration.test.ts`, write an integration test:
  - Spawn `node packages/core/dist/bin/run-mcp.js` as a child process with env `DEVS_MCP_PORT=13100` and `DEVS_MCP_AUTH_TOKEN=integration-test-token`, pointing at a temp project directory with a valid `devs.config.json`.
  - Assert the process writes `"OrchestratorServer listening on 127.0.0.1:13100"` (or equivalent) to stdout within 5 seconds.
  - Connect an MCP SDK client and call `get_project_status` successfully.
  - Send `SIGTERM` to the process and assert it exits with code 0 within 3 seconds (graceful shutdown).

## 2. Task Implementation
- [ ] Create `packages/core/src/bin/run-mcp.ts`:
  ```typescript
  #!/usr/bin/env node
  import { startMcpServer } from "../mcp/orchestrator/startup";
  
  startMcpServer().catch((err) => {
    console.error("Failed to start MCP server:", err.message);
    process.exit(1);
  });
  ```
- [ ] Create `packages/core/src/mcp/orchestrator/startup.ts` with the exported `startMcpServer` function:
  1. Determine `projectRoot` from `process.env.DEVS_PROJECT_ROOT` or `process.cwd()`.
  2. Load and parse `devs.config.json` from `projectRoot` using `JSON.parse(fs.readFileSync(..., "utf8"))`. Throw if missing.
  3. Resolve `port` from `process.env.DEVS_MCP_PORT` (parse and validate as integer 1–65535) or fall back to `config.mcp.port` or default `3100`.
  4. Resolve `authToken` from `process.env.DEVS_MCP_AUTH_TOKEN` or `config.mcp.authToken`. Throw if both are absent.
  5. Open SQLite database from `path.join(projectRoot, config.db.path)`.
  6. Initialize `VectorStore` from `@devs/memory` using `config.memory.lanceDbPath`.
  7. Initialize `GitServiceImpl` with `projectRoot`.
  8. Call `createOrchestratorServer({ port, authToken, db, vectorStore, gitService })` and start listening.
  9. Log `OrchestratorServer listening on 127.0.0.1:<port>` to stdout.
  10. Register `SIGTERM` and `SIGINT` handlers to call `server.close()` and `db.close()` before exiting with code 0.
- [ ] Add a `"run-mcp"` script entry to `packages/core/package.json`:
  ```json
  "scripts": {
    "run-mcp": "node dist/bin/run-mcp.js"
  }
  ```
- [ ] Add `"bin": { "devs-mcp": "dist/bin/run-mcp.js" }` to `packages/core/package.json` so the script is globally available when the package is installed.
- [ ] Ensure `packages/core/tsconfig.json` includes `src/bin/run-mcp.ts` in the compilation (`include` or `files` array).

## 3. Code Review
- [ ] Confirm the shebang line (`#!/usr/bin/env node`) is the first line of the compiled `dist/bin/run-mcp.js`.
- [ ] Confirm the file permission of `dist/bin/run-mcp.js` is set to executable (`chmod +x`) as part of the build process (add a `postbuild` script if needed: `chmod +x dist/bin/run-mcp.js`).
- [ ] Confirm `SIGTERM`/`SIGINT` handlers close the DB and server (no resource leaks on shutdown).
- [ ] Confirm that `authToken` is never logged to stdout or stderr, even on startup.
- [ ] Confirm port validation rejects 0 and values > 65535 with a clear error message.
- [ ] Confirm the script fails fast (within 1 second) if `devs.config.json` is missing or malformed, rather than hanging.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=run_mcp_script` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=run_mcp_script.integration` and confirm integration tests pass (including the process spawn/SIGTERM test).
- [ ] Run `pnpm --filter @devs/core build` and confirm the compiled `dist/bin/run-mcp.js` exists.
- [ ] Run the full `@devs/core` test suite and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/bin/run-mcp.agent.md` documenting:
  - Purpose: starts the `OrchestratorServer` for a given `devs` project.
  - All supported environment variables: `DEVS_PROJECT_ROOT`, `DEVS_MCP_PORT`, `DEVS_MCP_AUTH_TOKEN`.
  - Config file format: `devs.config.json` relevant fields (`mcp.port`, `mcp.authToken`, `db.path`, `memory.lanceDbPath`).
  - Graceful shutdown behavior on `SIGTERM`/`SIGINT`.
  - Example invocation: `DEVS_MCP_AUTH_TOKEN=secret pnpm run-mcp`.
  - How this script satisfies `[2_TAS-REQ-013]`.
- [ ] Update the root `README.md` (or `packages/core/README.md`) with a "Running the MCP Server" section referencing the `run-mcp` script.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build && ls -la packages/core/dist/bin/run-mcp.js` and assert the file exists and is executable (`-rwxr-xr-x`).
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=run_mcp_script` and assert statement coverage ≥ 90% for `startup.ts`.
- [ ] Spawn the script with no `DEVS_MCP_AUTH_TOKEN` and assert it exits with code 1 and prints an error to stderr containing `"authToken"`.
- [ ] Spawn the script with `DEVS_MCP_PORT=99999` and assert it exits with code 1 and prints an error to stderr containing `"Invalid DEVS_MCP_PORT"`.
