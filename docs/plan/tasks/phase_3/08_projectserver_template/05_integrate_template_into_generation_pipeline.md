# Task: Integrate ProjectServerTemplate into the devs Code Generation Pipeline (Sub-Epic: 08_ProjectServer Template)

## Covered Requirements
- [9_ROADMAP-TAS-802], [2_TAS-REQ-031], [TAS-062], [3_MCP-TAS-043]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/generation/__tests__/projectGeneration.mcp.test.ts`, write integration tests for the code generation pipeline's MCP server injection:
  - Mock the file system using `memfs` or a temp directory.
  - Call `CodeGenerator.generate({ projectRoot: '/tmp/gen-test', ... })` with a minimal project spec.
  - After `generate()` resolves, assert the following directory tree exists under `projectRoot`:
    - `mcp-server/package.json` (valid JSON, `name === "@generated/mcp-server"`)
    - `mcp-server/tsconfig.json` (valid JSON, `compilerOptions.strict === true`)
    - `mcp-server/src/index.ts` (contains `"McpServer"`)
    - `mcp-server/src/tools/index.ts` (contains `"registerAllTools"`)
    - `mcp-server/.agent/index.agent.md` (contains `"## Tools"`)
    - `mcp-server/README.md`
  - Test that the generation is **idempotent**: calling `generate()` twice on the same `projectRoot` does not corrupt existing `mcp-server/` files.
  - Test that if `projectRoot/mcp-server/` already exists with a custom `src/tools/customTool.ts`, re-running `generate()` does NOT overwrite it (the scaffolder must only write files that don't already exist).
  - Test that `generate()` calls `ProjectServerTemplateScaffolder.scaffold(projectRoot)` exactly once per generation run (verify via a spy on the scaffolder).

- [ ] Write a negative test: if the scaffolder throws (e.g. disk full simulation), `generate()` should propagate the error with context message `"Failed to scaffold ProjectServer: <original error>"`.

## 2. Task Implementation
- [ ] In `packages/devs-core/src/generation/codeGenerator.ts` (or the equivalent entry point for the code generation pipeline), locate the `generate()` method and inject the ProjectServer scaffold step:
  1. Import `{ ProjectServerTemplateScaffolder }` from `'../templates/index.js'`.
  2. After the primary project source tree is written (i.e., after `src/`, `tests/`, `docs/` are created), add:
     ```typescript
     try {
       await ProjectServerTemplateScaffolder.scaffold(projectRoot);
     } catch (err) {
       throw new Error(`Failed to scaffold ProjectServer: ${(err as Error).message}`);
     }
     ```
  3. Log the scaffold step using the existing orchestrator logger: `logger.info('[CodeGenerator] ProjectServer scaffolded', { projectRoot })`.

- [ ] Ensure the scaffolder is called for **every** project type/template (Next.js, FastAPI, Go, generic) by placing the call at the base level of `generate()`, not inside template-specific branches.

- [ ] If the code generator has a `GenerationManifest` or `GenerationPlan` data structure that lists the files/directories it will produce, add an entry for `mcp-server/` to that manifest so the UI (VSCode extension / CLI progress bar) can display it as a generation step.

- [ ] Update `packages/devs-core/src/generation/generationManifest.ts` (or equivalent) to include:
  ```typescript
  {
    step: "scaffold_project_server",
    description: "Injecting internal MCP observability server (mcp-server/)",
    outputPath: "mcp-server/",
    requirementIds: ["3_MCP-TAS-043", "TAS-062", "2_TAS-REQ-031", "9_ROADMAP-TAS-802"]
  }
  ```

## 3. Code Review
- [ ] Verify that the `ProjectServerTemplateScaffolder.scaffold()` call is positioned **after** all primary source files are written, so the MCP server can reference any project-specific type definitions if needed in future extensions.
- [ ] Verify that the generation step is logged at `INFO` level with the requirement IDs for full traceability (`[9_ROADMAP-TAS-802]`, `[3_MCP-TAS-043]`).
- [ ] Confirm that idempotency is enforced at the scaffolder level (task 01) and that the generator does not add an additional idempotency guard that could mask scaffolder bugs.
- [ ] Verify that the error wrapping preserves the original error message and does not swallow stack traces (use `{ cause: err }` in the `Error` constructor if TypeScript target supports it).
- [ ] Confirm the `GenerationManifest` entry includes all four requirement IDs so the requirement coverage report remains accurate.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="projectGeneration.mcp"` and confirm all tests pass (exit code `0`).
- [ ] Run the full `@devs/core` test suite to confirm no regressions: `pnpm --filter @devs/core test`.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/code-generation.md` (create if it does not exist) to document the ProjectServer injection step:
  - Where in the generation pipeline it runs.
  - What files it produces.
  - Which requirements it satisfies.
- [ ] Update the project-level `README.md` (or `docs/generated-project-structure.md`) to show the `mcp-server/` directory in the example generated project tree with a brief description.

## 6. Automated Verification
- [ ] Run an end-to-end generation smoke test:
  ```bash
  node -e "
    const { CodeGenerator } = require('@devs/core/generation');
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    const root = path.join(os.tmpdir(), 'devs-gen-smoke-' + Date.now());
    const gen = new CodeGenerator();
    gen.generate({ projectRoot: root, template: 'generic', projectName: 'smoke-test' }).then(() => {
      const required = [
        'mcp-server/package.json',
        'mcp-server/tsconfig.json',
        'mcp-server/src/index.ts',
        'mcp-server/src/tools/index.ts',
        'mcp-server/.agent/index.agent.md',
        'mcp-server/README.md',
      ];
      const missing = required.filter(f => !fs.existsSync(path.join(root, f)));
      if (missing.length) { console.error('MISSING:', missing); process.exit(1); }
      console.log('PASS: mcp-server/ injected correctly into generated project');
    }).catch(e => { console.error('FAIL:', e); process.exit(1); });
  "
  ```
- [ ] Confirm that the `GenerationManifest` entry for `scaffold_project_server` appears in the manifest output:
  ```bash
  node -e "
    const { GenerationManifest } = require('@devs/core/generation');
    const step = GenerationManifest.steps.find(s => s.step === 'scaffold_project_server');
    if (!step) { console.error('FAIL: manifest step not found'); process.exit(1); }
    const ids = ['3_MCP-TAS-043','TAS-062','2_TAS-REQ-031','9_ROADMAP-TAS-802'];
    const missing = ids.filter(id => !step.requirementIds.includes(id));
    if (missing.length) { console.error('FAIL: missing req IDs', missing); process.exit(1); }
    console.log('PASS: manifest step present with all requirement IDs');
  "
  ```
