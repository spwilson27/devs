# Task: Create Agent-Ready Next.js Project Template (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-TAS-805]

## 1. Initial Test Written
- [ ] Create `src/templates/__tests__/nextjsTemplate.test.ts`:
  - Write a test `"Next.js template scaffold contains all required agent-ready files"` that:
    - Calls `TemplateEngine.scaffold("nextjs", "/tmp/test-nextjs-project")`.
    - Asserts the following files exist in the scaffolded output directory:
      - `devs.config.ts`
      - `mcp-server/index.ts`
      - `mcp-server/tools/get_project_status.ts`
      - `mcp-server/tools/run_profiler.ts`
      - `mcp-server/tools/execute_query.ts`
      - `scripts/bootstrap-sandbox.sh`
      - `scripts/run-mcp.sh`
      - `scripts/validate-all.sh`
      - `package.json` (with a `devs` section)
      - `.devs/` directory (with 0700 permissions)
      - `src/app/page.tsx`
      - `src/app/layout.tsx`
      - `tsconfig.json` (with `strict: true`)
      - `requirements.md` (stub)
  - Write a test `"Next.js template devs.config.ts has correct defaults"` that:
    - Reads the scaffolded `devs.config.ts` and asserts `config.agentModel === "gemini-3-pro"`, `config.selfHost === false`, `config.testCommand === "npm run test"`.
  - Write a test `"Next.js template package.json contains devs section"` that:
    - Reads `package.json` and asserts `pkg.devs.config === "devs.config.ts"` and `pkg.devs.version` is a semver string.
  - Write a test `"Next.js template .devs directory has 0700 permissions"` that:
    - Stats `.devs/` and asserts `(mode & 0o777) === 0o700`.

## 2. Task Implementation
- [ ] Create the template source directory at `src/templates/nextjs/` containing:
  - `devs.config.ts.ejs` — EJS template for the devs config, with placeholders `<%= projectName %>`, `<%= agentModel %>`.
  - `mcp-server/index.ts.ejs` — MCP server entry point (see task 08 for shared MCP server template base).
  - `mcp-server/tools/get_project_status.ts` — static file implementing the `get_project_status` MCP tool stub.
  - `mcp-server/tools/run_profiler.ts` — static file implementing the `run_profiler` MCP tool stub.
  - `mcp-server/tools/execute_query.ts` — static file implementing the `execute_query` MCP tool stub.
  - `scripts/bootstrap-sandbox.sh` — shell script that creates `.devs/` with `mkdir -m 700 -p .devs`.
  - `scripts/run-mcp.sh` — shell script that runs `node mcp-server/index.js`.
  - `scripts/validate-all.sh` — shell script that runs lint, test, and build in sequence, exiting non-zero on any failure.
  - `package.json.ejs` — template with `"devs": { "config": "devs.config.ts", "version": "1.0.0" }`, Next.js deps, and scripts.
  - `tsconfig.json` — TypeScript config with `"strict": true`, `"target": "ES2022"`, `"moduleResolution": "bundler"`.
  - `src/app/page.tsx` — minimal Next.js App Router page.
  - `src/app/layout.tsx` — minimal Next.js App Router layout.
  - `requirements.md` — stub file with `# Requirements\n\n<!-- Add project requirements here -->`.
- [ ] Create `src/templates/TemplateEngine.ts`:
  - Export a `TemplateEngine` class with `scaffold(templateName: string, outputDir: string, vars?: Record<string, string>): Promise<void>`.
  - Uses `ejs.renderFile()` to process `.ejs` files and writes output without the `.ejs` extension.
  - Copies non-`.ejs` files verbatim.
  - After scaffolding, runs `chmod 700 <outputDir>/.devs` on the `.devs/` directory.
- [ ] Register `TemplateEngine` in the DI container under token `TEMPLATE_ENGINE`.

## 3. Code Review
- [ ] Confirm all shell scripts (`bootstrap-sandbox.sh`, `run-mcp.sh`, `validate-all.sh`) have `#!/usr/bin/env bash` as the first line and `set -euo pipefail` as the second line.
- [ ] Confirm `devs.config.ts.ejs` renders valid TypeScript (no syntax errors) for any valid `projectName` input.
- [ ] Confirm the MCP tool stubs each export a `handler` function with the correct MCP tool signature.
- [ ] Confirm `TemplateEngine.scaffold()` is idempotent: calling it twice on the same output directory does not throw and does not corrupt files.
- [ ] Confirm no `any` types in `TemplateEngine.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- --testPathPattern=nextjsTemplate` and confirm all four tests pass.
- [ ] Run `npm run lint -- src/templates/` and confirm zero errors.
- [ ] Scaffold a test project with `node -e "const {TemplateEngine} = require('./dist/templates/TemplateEngine'); new TemplateEngine().scaffold('nextjs', '/tmp/verify-nextjs')"` and confirm exit code 0.
- [ ] Run `ls -la /tmp/verify-nextjs/.devs` and confirm `drwx------` permissions.

## 5. Update Documentation
- [ ] Create `docs/templates/nextjs.md` documenting:
  - The full file tree of the Next.js agent-ready template.
  - How to scaffold: `devs scaffold nextjs <project-name>`.
  - The `devs.config.ts` fields and their default values.
  - The MCP server tools included and their purpose.
- [ ] Update `docs/agent_memory/phase_14.md`: "Next.js agent-ready template scaffolded; TemplateEngine.scaffold() implemented."

## 6. Automated Verification
- [ ] Run `npm run test -- --ci --testPathPattern=nextjsTemplate` and verify exit code 0.
- [ ] Run `stat -c '%a' /tmp/verify-nextjs/.devs` (Linux) or `stat -f '%OLp' /tmp/verify-nextjs/.devs` (macOS) and assert output is `700`.
