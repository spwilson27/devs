# Task: Implement P6 Loop Integration Tests for Self-Host Execution (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-TAS-804], [9_ROADMAP-REQ-039]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/selfHostP6Loop.integration.test.ts`:
  - Use a real (non-mocked) `SelfHostConfigLoader` pointing to `devs.config.ts`.
  - Write a test `"P6Loop can be instantiated against the devs source tree"` that:
    - Instantiates `P6OrchestratorLoop` with `selfHost: true`.
    - Loads a pre-written stub task file (a fixture at `tests/fixtures/stub_self_host_task.md`) describing a trivial change (e.g., add a `// self-host-test` comment to a designated scratch file).
    - Verifies that `P6OrchestratorLoop.dryRun(stubTask)` returns a `P6DryRunResult` without throwing.
    - Asserts `result.requirementsChecked` is an array containing `"9_ROADMAP-TAS-804"`.
    - Asserts `result.agentStepsPlanned` is a non-empty array.
  - Write a test `"P6Loop respects sandboxBoundary in selfHost mode"` that:
    - Attempts to queue a task targeting a file outside `config.sourceRoot`.
    - Asserts the loop throws `SandboxViolationError` before any agent call is made.
  - Write a test `"P6Loop aborts on lint failure before implementation step"` that:
    - Mocks `lintRunner.run()` to resolve with exit code 1 and stderr `"error TS2345"`.
    - Asserts the loop emits a `task:aborted` event with `reason: "lint_failure"`.

## 2. Task Implementation
- [ ] If `P6OrchestratorLoop` does not yet have a `dryRun(task: TaskManifest): Promise<P6DryRunResult>` method, add it to `src/orchestrator/P6OrchestratorLoop.ts`:
  - `dryRun` must parse the task manifest, resolve requirement IDs, and plan agent steps without executing any real agent calls or writing any files.
  - Return `{ requirementsChecked: string[], agentStepsPlanned: AgentStep[], estimatedTokens: number }`.
- [ ] Add a `selfHost: boolean` property to the `OrchestratorConfig` type in `src/orchestrator/types/OrchestratorConfig.ts`.
- [ ] In `P6OrchestratorLoop`, when `selfHost === true`:
  - Enforce that all task target paths resolve under `config.sourceRoot`.
  - Throw `SandboxViolationError` (defined in `src/errors/SandboxViolationError.ts`) if a path escapes the source root.
- [ ] Create the fixture file `tests/fixtures/stub_self_host_task.md` with a minimal task manifest targeting a scratch file `src/_selfhost_scratch.ts`.
- [ ] Create the scratch target file `src/_selfhost_scratch.ts` (initially empty, with a comment `// self-host scratch target — safe to modify`).

## 3. Code Review
- [ ] Confirm `dryRun` never invokes any network calls or spawns child processes.
- [ ] Confirm `SandboxViolationError` extends the project's base `DevsError` class and includes `targetPath` and `sourceRoot` in its `context` field.
- [ ] Confirm the integration test uses `jest.setTimeout(30000)` and is tagged with `@group integration` in its docblock.
- [ ] Confirm no production code paths are skipped or mocked in the `dryRun` path except actual agent API calls.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- --testPathPattern=selfHostP6Loop --runInBand` and confirm all three tests pass.
- [ ] Run `npm run test -- --testPathPattern=selfHostP6Loop --coverage` and confirm ≥ 85% branch coverage for `P6OrchestratorLoop.ts` `dryRun` method.
- [ ] Run `npm run lint` on modified source files and confirm zero errors.

## 5. Update Documentation
- [ ] In `docs/orchestrator.md`, add a `### Self-Host Dry Run` section explaining the `dryRun` API, its return type, and the sandbox boundary enforcement behavior.
- [ ] Update `docs/agent_memory/phase_14.md`: "P6OrchestratorLoop.dryRun() implemented; sandbox violation guard active in selfHost mode."

## 6. Automated Verification
- [ ] Run `npm run test -- --ci --testPathPattern=selfHostP6Loop.integration` and verify exit code 0.
- [ ] Assert in CI output that no HTTP requests were made during the dry-run tests by checking that the `nock.isDone()` helper (or equivalent request interceptor) reports zero unmatched network calls.
