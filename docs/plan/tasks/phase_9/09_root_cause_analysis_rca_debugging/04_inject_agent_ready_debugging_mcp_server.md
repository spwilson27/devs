# Task: Inject Agent-Ready Debugging MCP Server Blueprint (Sub-Epic: 09_Root Cause Analysis (RCA) & Debugging)

## Covered Requirements
- [REQ-GOAL-004]

## 1. Initial Test Written
- [ ] Create an integration test in `tests/integration/ProjectScaffolding.test.ts`.
- [ ] Mock a `devs init` request for a new greenfield project.
- [ ] Write an assertion that checks for the existence of `mcp-server/index.ts` and `mcp-server/package.json` in the generated project directory.
- [ ] Write a test to ensure the generated MCP server blueprint contains the standard `capture_trace` and `read_local_state` debugging tools.

## 2. Task Implementation
- [ ] Create the blueprint templates for the agentic debugging MCP server in `src/templates/mcp-server/`.
- [ ] Update the `ProjectGenerator` class in `src/core/scaffolding/ProjectGenerator.ts` to copy these templates into the `mcp-server/` directory of every newly initialized project.
- [ ] Ensure the `package.json` of the generated project contains a script (e.g., `npm run mcp:start`) to boot the internal debugging server.

## 3. Code Review
- [ ] Verify that the injected MCP server blueprint binds exclusively to `127.0.0.1` and requires a Bearer token by default (adhering to global security design).
- [ ] Ensure the template code is well-commented and self-explanatory for future AI Developer agents that will interact with it.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/integration/ProjectScaffolding.test.ts`.
- [ ] Ensure the scaffolding tests pass and accurately validate the copied blueprint files.

## 5. Update Documentation
- [ ] Update `docs/architecture/ProjectStructure.md` to define the mandatory `mcp-server/` directory and its purpose for agentic debugging.
- [ ] Add an entry in the global `.agent.md` file explaining how developer agents can connect to this internal MCP server during the `RefactorNode` phase.

## 6. Automated Verification
- [ ] Execute `npm run test:e2e:scaffold` to perform a full mock project generation and automatically start the injected MCP server, pinging its `/health` endpoint to ensure the blueprint compiles and runs flawlessly.
