# Task: Scaffold the ProjectServerTemplate Package and Directory Structure (Sub-Epic: 08_ProjectServer Template)

## Covered Requirements
- [2_TAS-REQ-031], [TAS-062], [9_ROADMAP-TAS-802]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/templates/__tests__/projectServerTemplate.scaffold.test.ts`, write a unit test suite for the `ProjectServerTemplateScaffolder` class:
  - Test `scaffold(outputDir: string): Promise<void>` writes the following file tree under `outputDir/mcp-server/`:
    - `package.json` (valid JSON with `"name": "@generated/mcp-server"`, `"type": "module"`, a `"start"` script running `node dist/index.js`, and `"@modelcontextprotocol/sdk"` as a dependency)
    - `tsconfig.json` (valid JSON that extends `"@tsconfig/node20/tsconfig.json"`, sets `"outDir": "dist"`, `"rootDir": "src"`, and `"strict": true`)
    - `src/index.ts` (non-empty; contains at least the string `"McpServer"` and `"StdioServerTransport"`)
    - `src/tools/index.ts` (re-exports all tools)
    - `.agent/index.agent.md` (AOD manifest; contains the headings `## Tools`, `## Introspection Points`)
    - `README.md` (contains the string `mcp-server` and at least one tool name)
  - Test that calling `scaffold()` on an existing directory does NOT throw but is idempotent (re-running produces the same files).
  - Test that the generated `package.json` passes `JSON.parse` without error and includes `"scripts": { "start": "node dist/index.js", "build": "tsc" }`.
  - Use `tmp` or Node's `fs/promises` + `os.tmpdir()` for a temporary output directory in each test.

## 2. Task Implementation
- [ ] Create the class `ProjectServerTemplateScaffolder` in `packages/devs-core/src/templates/projectServerTemplate.ts`:
  - Export a single public method `async scaffold(outputDir: string): Promise<void>`.
  - Use Node's `fs/promises` (`mkdir`, `writeFile`) to create the `mcp-server/` subtree.
  - Generate `package.json` with:
    ```json
    {
      "name": "@generated/mcp-server",
      "version": "0.1.0",
      "type": "module",
      "scripts": {
        "build": "tsc",
        "start": "node dist/index.js"
      },
      "dependencies": {
        "@modelcontextprotocol/sdk": "^1.0.0"
      },
      "devDependencies": {
        "typescript": "^5.4.0",
        "@tsconfig/node20": "^20.1.0"
      }
    }
    ```
  - Generate `tsconfig.json` with:
    ```json
    {
      "extends": "@tsconfig/node20/tsconfig.json",
      "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "strict": true,
        "module": "NodeNext",
        "moduleResolution": "NodeNext"
      },
      "include": ["src"]
    }
    ```
  - Generate `src/index.ts` as a minimal MCP server bootstrap (stub imports of `McpServer` and `StdioServerTransport` from `@modelcontextprotocol/sdk/server/index.js`, a `createServer()` factory that returns a new `McpServer` instance with name `"project-mcp-server"` and version `"0.1.0"`, and a `main()` function that connects the server to a `StdioServerTransport` and calls `server.listen()`).
  - Generate `src/tools/index.ts` as an empty re-export barrel (`export {};`).
  - Generate `.agent/index.agent.md` with sections `## Tools` and `## Introspection Points` (both empty initially, to be populated by downstream tasks).
  - Generate `README.md` with a brief description of the `mcp-server` directory, its purpose, and how to start it (`npm run build && npm run start`).
  - All `writeFile` calls MUST use `{ flag: 'wx' }` the first time and fall back to a no-op if the file already exists (idempotent behaviour).
- [ ] Export `ProjectServerTemplateScaffolder` from `packages/devs-core/src/templates/index.ts`.

## 3. Code Review
- [ ] Verify that `ProjectServerTemplateScaffolder` has **zero** direct imports of framework-specific or generated-project code—it must only use Node built-ins (`fs/promises`, `path`) and a small set of template strings.
- [ ] Confirm that all file paths are constructed with `path.join` (never string concatenation) to ensure cross-platform correctness.
- [ ] Verify that the generated `package.json` uses exact `"@modelcontextprotocol/sdk"` version pinning (semver range `^1.0.0`) consistent with the version used by the `OrchestratorServer` in `packages/devs-core`.
- [ ] Ensure the `.agent/index.agent.md` AOD manifest follows the established format documented in `[3_MCP-REQ-MET-008]` (tool name, parameters, return type, description columns in a Markdown table—even if the table is empty at this stage).
- [ ] Confirm no secrets or environment-specific paths are hardcoded.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="projectServerTemplate.scaffold"` and confirm all tests pass (exit code `0`).
- [ ] Run `pnpm --filter @devs/core build` to confirm the TypeScript compiles without errors.

## 5. Update Documentation
- [ ] Append an entry to `docs/architecture/templates.md` (create the file if it does not exist) documenting `ProjectServerTemplateScaffolder`: its purpose, public API (`scaffold(outputDir)`), and the directory tree it produces.
- [ ] Update `packages/devs-core/src/templates/.agent/index.agent.md` to record that `ProjectServerTemplateScaffolder` is the authoritative source for the `mcp-server/` scaffold.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern="projectServerTemplate.scaffold"` and assert coverage for `projectServerTemplate.ts` is ≥ 90 % (lines).
- [ ] Execute the scaffolder in a real temp directory via a Node one-liner and assert each expected file exists:
  ```bash
  node -e "
    import('@devs/core/templates').then(m => m.ProjectServerTemplateScaffolder.scaffold('/tmp/mcp-scaffold-verify')).then(() => {
      const files = ['package.json','tsconfig.json','src/index.ts','src/tools/index.ts','.agent/index.agent.md','README.md'];
      const missing = files.filter(f => !require('fs').existsSync('/tmp/mcp-scaffold-verify/mcp-server/' + f));
      if (missing.length) { console.error('MISSING:', missing); process.exit(1); }
      console.log('ALL FILES PRESENT');
    });
  "
  ```
