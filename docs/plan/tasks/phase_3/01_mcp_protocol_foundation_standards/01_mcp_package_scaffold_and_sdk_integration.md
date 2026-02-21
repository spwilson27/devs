# Task: Scaffold @devs/mcp Package and Integrate MCP TypeScript SDK (Sub-Epic: 01_MCP Protocol Foundation & Standards)

## Covered Requirements
- [TAS-101], [TAS-014]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/package.test.ts`, write a unit test that imports the package entry point (`@devs/mcp`) and asserts it exports a non-null `McpServer` class, a `createMcpServer` factory function, and a `MCP_SDK_VERSION` constant.
- [ ] Write an integration test `packages/mcp/src/__tests__/sdk_integration.test.ts` that:
  - Instantiates a minimal `McpServer` with a test name and version.
  - Calls `server.start()` in stdio mode and asserts the process does not throw.
  - Calls `server.stop()` and asserts the server shuts down cleanly within 2 seconds.
- [ ] Write a test that asserts importing `@devs/mcp` from a fresh Node.js `require()` call resolves without errors and that the exported `MCP_SDK_VERSION` string matches the version pinned in `package.json`.

## 2. Task Implementation
- [ ] Create the `packages/mcp/` directory at the monorepo root with the following structure:
  ```
  packages/mcp/
  ├── package.json
  ├── tsconfig.json
  ├── src/
  │   ├── index.ts          # public barrel export
  │   ├── server.ts         # McpServer wrapper class
  │   └── constants.ts      # MCP_SDK_VERSION and other package-level constants
  └── src/__tests__/
  ```
- [ ] In `packages/mcp/package.json`, set:
  - `name`: `@devs/mcp`
  - `version`: `0.1.0`
  - `main`: `dist/index.js`
  - `types`: `dist/index.d.ts`
  - Add `@modelcontextprotocol/sdk` as a production dependency (pin to the latest stable semver, e.g., `^1.0.0`).
  - Add `typescript`, `@types/node` as dev dependencies.
  - Add build script: `tsc -p tsconfig.json`.
  - Add test script: `jest --testPathPattern=src/__tests__`.
- [ ] In `packages/mcp/tsconfig.json`, extend the root `tsconfig.base.json` (create one if absent at repo root) with:
  - `compilerOptions.outDir`: `./dist`
  - `compilerOptions.rootDir`: `./src`
  - `compilerOptions.declaration`: `true`
  - `compilerOptions.strict`: `true`
  - `include`: `["src/**/*"]`
- [ ] In `packages/mcp/src/constants.ts`, export `MCP_SDK_VERSION` by reading the installed `@modelcontextprotocol/sdk` package's `version` field from its `package.json` at runtime.
- [ ] In `packages/mcp/src/server.ts`, implement a `McpServer` class that:
  - Wraps the `Server` class from `@modelcontextprotocol/sdk/server/index.js`.
  - Accepts constructor arguments `{ name: string; version: string; capabilities?: ServerCapabilities }`.
  - Exposes `start(transport: Transport): Promise<void>` and `stop(): Promise<void>` methods.
  - Re-exports all relevant types from the SDK (`Tool`, `Resource`, `Prompt`, `CallToolResult`, etc.) so downstream packages import solely from `@devs/mcp`.
- [ ] In `packages/mcp/src/index.ts`, re-export `McpServer`, `createMcpServer` factory, `MCP_SDK_VERSION`, and all type re-exports from `server.ts` and `constants.ts`.
- [ ] Register `packages/mcp` in the monorepo's root `package.json` workspaces array (or `pnpm-workspace.yaml` / `turbo.json` pipeline).
- [ ] Run `pnpm install` (or the project's package manager equivalent) at the repo root to link the package.

## 3. Code Review
- [ ] Confirm the `McpServer` wrapper does **not** implement any proprietary extensions to the MCP SDK; all public API surface must be a thin, typed façade over the official SDK.
- [ ] Confirm `MCP_SDK_VERSION` is derived from the installed SDK at runtime, not hardcoded, to prevent version drift.
- [ ] Verify no circular imports exist between `server.ts`, `constants.ts`, and `index.ts` (use `madge --circular packages/mcp/src`).
- [ ] Confirm `tsconfig.json` `strict` mode is enabled and all files compile without errors or warnings.
- [ ] Confirm `package.json` has no devDependencies listed as production dependencies and vice versa.

## 4. Run Automated Tests to Verify
- [ ] From the repo root, run: `pnpm --filter @devs/mcp test` and confirm all tests pass with zero failures.
- [ ] From the repo root, run: `pnpm --filter @devs/mcp build` and confirm `dist/` is generated with `index.js`, `index.d.ts`, and all sub-module files.
- [ ] Run `node -e "const m = require('./packages/mcp/dist/index.js'); console.assert(m.MCP_SDK_VERSION, 'version missing');"` and confirm it exits 0.

## 5. Update Documentation
- [ ] Create `packages/mcp/README.md` documenting:
  - Purpose: canonical MCP SDK façade for all `devs` packages.
  - Exported symbols and their usage.
  - How to add a new MCP tool via this package.
- [ ] Append an entry to the repo-root `ARCHITECTURE.md` (create if absent) under a "Packages" section describing `@devs/mcp` as the single source of truth for MCP SDK access.
- [ ] Update the project's agent memory file (e.g., `docs/agent_memory/phase_3.md`) with the decision: "`@devs/mcp` is the only package allowed to import directly from `@modelcontextprotocol/sdk`. All other packages MUST depend on `@devs/mcp`."

## 6. Automated Verification
- [ ] Run the CI pipeline step (e.g., `pnpm turbo run build test --filter=@devs/mcp`) and assert exit code 0.
- [ ] Execute `ls packages/mcp/dist/index.js packages/mcp/dist/index.d.ts` and assert both files exist.
- [ ] Run `pnpm --filter @devs/mcp test -- --coverage` and assert line coverage ≥ 90% for `src/server.ts` and `src/constants.ts`.
