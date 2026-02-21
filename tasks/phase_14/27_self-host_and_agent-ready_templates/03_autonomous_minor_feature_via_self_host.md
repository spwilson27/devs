# Task: Use devs to Autonomously Implement a Minor Feature in Its Own Codebase (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-TAS-804], [9_ROADMAP-REQ-039]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/selfHostExecution.e2e.test.ts`:
  - Tag this file `@group e2e` in its docblock.
  - Set `jest.setTimeout(300000)` (5 minutes) to allow agent execution.
  - Define the target minor feature: **add a `getVersion(): string` export to `src/orchestrator/index.ts`** that reads the version from `package.json`.
  - Write a test `"devs can autonomously implement getVersion() in its own orchestrator"` that:
    - Loads `devs.config.ts` via `SelfHostConfigLoader`.
    - Constructs a `TaskManifest` for implementing `getVersion()` with covered requirement `"9_ROADMAP-TAS-804"`.
    - Runs `P6OrchestratorLoop.execute(taskManifest)` with `selfHost: true`.
    - After execution, dynamically imports `src/orchestrator/index.ts` and calls `getVersion()`.
    - Asserts the return value matches the `version` field in `package.json`.
    - Asserts that a test file `src/orchestrator/__tests__/getVersion.test.ts` was created by the agent.
    - Asserts that running `npm run test -- --testPathPattern=getVersion` exits with code 0.
  - Write a test `"self-host execution does not modify files outside sourceRoot"` that:
    - Inspects git status after execution (`git status --porcelain`) and asserts every modified path starts with `src/`.

## 2. Task Implementation
- [ ] Write the `TaskManifest` fixture JSON at `tests/fixtures/get_version_task_manifest.json`:
  ```json
  {
    "id": "self-host-get-version-001",
    "title": "Add getVersion() export to orchestrator index",
    "coveredRequirements": ["9_ROADMAP-TAS-804", "9_ROADMAP-REQ-039"],
    "targetFiles": ["src/orchestrator/index.ts"],
    "testFiles": ["src/orchestrator/__tests__/getVersion.test.ts"],
    "description": "Export a getVersion() function from src/orchestrator/index.ts that reads and returns the version string from package.json. Follow TDD: write the test first, then implement."
  }
  ```
- [ ] In `P6OrchestratorLoop.execute()`, ensure the following steps are performed in order when `selfHost: true`:
  1. **Agent: Initial Test Written** — invoke the test-writing agent with the task manifest; write the generated test file to disk.
  2. **Agent: Task Implementation** — invoke the implementation agent; apply file patches within `sourceRoot`.
  3. **Agent: Code Review** — invoke the review agent; if `LGTM` not returned, retry once, then abort.
  4. **Automated: Run Tests** — spawn `config.testCommand` as a child process; if exit code ≠ 0, trigger retry or abort flow.
  5. **Agent: Update Documentation** — invoke the docs agent.
  6. **Automated: Verify** — re-run tests and assert exit code 0.
- [ ] Ensure `P6OrchestratorLoop` emits typed events: `task:step-started`, `task:step-completed`, `task:completed`, `task:aborted`.
- [ ] Ensure `git status --porcelain` is executed after step 2 and any path outside `config.sourceRoot` triggers `SandboxViolationError` and reverts the offending changes via `git checkout -- <path>`.

## 3. Code Review
- [ ] Confirm that the e2e test is excluded from the default `npm run test` run and only included when `TEST_GROUP=e2e` env var is set.
- [ ] Confirm `P6OrchestratorLoop.execute()` is fully idempotent: re-running with the same manifest is safe if the feature already exists.
- [ ] Confirm all six P6 steps are logged to the structured logger with step index, timestamp, and duration.
- [ ] Confirm agent API calls use the `agentModel` from `devs.config.ts`, not a hardcoded string.

## 4. Run Automated Tests to Verify
- [ ] Run `TEST_GROUP=e2e npm run test -- --testPathPattern=selfHostExecution.e2e --runInBand` and confirm both tests pass.
- [ ] Confirm `src/orchestrator/index.ts` now exports `getVersion()` and `src/orchestrator/__tests__/getVersion.test.ts` exists.
- [ ] Run `npm run test -- --testPathPattern=getVersion` and confirm exit code 0.
- [ ] Run `git diff --name-only` and confirm only `src/` paths are modified.

## 5. Update Documentation
- [ ] Add a `## Self-Host Execution` section to `docs/orchestrator.md` documenting the full P6 loop execution flow in self-host mode, including the six steps, event emissions, and sandbox enforcement.
- [ ] Update `docs/agent_memory/phase_14.md`: "Self-host e2e test complete; getVersion() feature implemented autonomously via P6OrchestratorLoop; all P6 steps executed and verified."

## 6. Automated Verification
- [ ] Run `node -e "const {getVersion} = require('./dist/orchestrator/index.js'); const pkg = require('./package.json'); if (getVersion() !== pkg.version) process.exit(1); console.log('Self-host verification PASSED:', getVersion());"` and confirm exit code 0.
- [ ] Run `git status --porcelain | grep -v '^.. src/'` and assert this produces no output (i.e., no files outside `src/` were modified).
