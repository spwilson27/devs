# Task: OrchestratorServer Package Scaffold & TypeScript Configuration (Sub-Epic: 04_OrchestratorServer Core)

## Covered Requirements
- [1_PRD-REQ-INT-003], [2_TAS-REQ-030]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/package.test.ts`, write a test that:
  - Imports `OrchestratorServer` from `@devs/mcp` and asserts the export exists and is a class/constructor.
  - Asserts the package exports a `createOrchestratorServer` factory function.
  - Asserts that calling `createOrchestratorServer({ port: 0, token: 'test' })` returns an object with `start` and `stop` async methods (without actually starting the server).
- [ ] In `packages/mcp/src/__tests__/config.test.ts`, write a test that:
  - Imports `OrchestratorServerConfig` type and `validateConfig` from `@devs/mcp/config`.
  - Asserts `validateConfig({ port: 3100, token: 'abc', host: 'localhost' })` returns `{ valid: true }`.
  - Asserts `validateConfig({ port: -1, token: '', host: '0.0.0.0' })` returns `{ valid: false, errors: [...] }` with at least two validation errors (invalid port, empty token, non-localhost host).
- [ ] Confirm all tests are failing (red) before proceeding to implementation.

## 2. Task Implementation
- [ ] Create the `packages/mcp/` directory under the `devs` monorepo root.
- [ ] Scaffold `packages/mcp/package.json` with:
  - `name: "@devs/mcp"`, `version: "0.1.0"`, `private: true`.
  - `main: "dist/index.js"`, `types: "dist/index.d.ts"`.
  - Dependencies: `@modelcontextprotocol/sdk` (latest), `zod` (for schema validation).
  - DevDependencies: `typescript`, `vitest`, `@types/node`.
  - Scripts: `"build": "tsc"`, `"test": "vitest run"`, `"dev": "tsc --watch"`.
- [ ] Create `packages/mcp/tsconfig.json` extending the root `tsconfig.base.json` with:
  - `"outDir": "dist"`, `"rootDir": "src"`, `"declaration": true`, `"declarationMap": true`, `"strict": true`.
  - `"include": ["src/**/*"]`, `"exclude": ["node_modules", "dist"]`.
- [ ] Create `packages/mcp/vitest.config.ts` that references the root vitest config or defines one pointing to `src/__tests__/**/*.test.ts`.
- [ ] Create `packages/mcp/src/index.ts` that exports:
  - `OrchestratorServer` class (stub — just a class with no-op `start()` and `stop()` async methods).
  - `createOrchestratorServer(config: OrchestratorServerConfig): OrchestratorServer` factory.
- [ ] Create `packages/mcp/src/config.ts` with:
  - `OrchestratorServerConfig` interface: `{ port: number; token: string; host?: string }`.
  - `validateConfig(config: Partial<OrchestratorServerConfig>): { valid: boolean; errors?: string[] }` — validates port is `1024–65535`, token is non-empty, host (if specified) is `'localhost'` or `'127.0.0.1'`.
- [ ] Add `@devs/mcp` to the root `pnpm-workspace.yaml` (or equivalent monorepo workspace config) so it is recognized as a workspace package.
- [ ] Run `pnpm install` from the monorepo root to link the new package.

## 3. Code Review
- [ ] Verify `packages/mcp/package.json` sets `private: true` to prevent accidental publishing.
- [ ] Confirm `tsconfig.json` enables `strict: true` — no loose typing allowed.
- [ ] Verify `validateConfig` returns structured error messages (not raw exceptions) — consumer-friendly error surface.
- [ ] Confirm the `OrchestratorServer` stub does NOT import or instantiate the MCP SDK yet (that comes in a later task) — keep the stub clean.
- [ ] Verify the package is correctly registered in the workspace and can be resolved via `import from '@devs/mcp'` in sibling packages.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test` and confirm all tests in `packages/mcp/src/__tests__/` pass (green).
- [ ] Run `pnpm --filter @devs/mcp build` and confirm TypeScript compiles without errors and `dist/` is populated.
- [ ] Run `pnpm --filter @devs/core test` to confirm no regressions in sibling packages.

## 5. Update Documentation
- [ ] Add a `packages/mcp/README.md` describing:
  - Purpose: MCP server exposing internal `devs` orchestrator state.
  - `OrchestratorServerConfig` fields and their constraints.
  - How to run locally: `pnpm --filter @devs/mcp dev`.
- [ ] Update the root `docs/architecture/packages.md` (or equivalent) to include `@devs/mcp` in the package registry table with a one-line description.
- [ ] Update agent memory (`docs/agent-memory/phase_3.md`) to note that `@devs/mcp` package scaffold is complete and `OrchestratorServerConfig` validation rules are established.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test --reporter=json > /tmp/mcp-package-test-results.json` and verify exit code is `0`.
- [ ] Run `cat /tmp/mcp-package-test-results.json | jq '.testResults[].status' | grep -v '"passed"'` — must produce no output (all tests passed).
- [ ] Run `ls packages/mcp/dist/index.js packages/mcp/dist/index.d.ts` — both files must exist, confirming the build output is complete.
