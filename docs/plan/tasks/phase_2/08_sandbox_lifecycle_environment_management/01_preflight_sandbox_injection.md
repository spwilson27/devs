# Task: Implement Pre-flight Sandbox Injection Service (Sub-Epic: 08_Sandbox Lifecycle & Environment Management)

## Covered Requirements
- [1_PRD-REQ-IMP-006]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/preflight.test.ts`, write unit tests for a `PreflightService` class:
  - Test `injectCodebase(sandboxId, projectRootPath)`: verify that a mock `FilesystemManager` is called with the correct source path and that files are synced to `/workspace` inside the sandbox, excluding `.git/` and `.devs/` directories.
  - Test `injectTaskRequirements(sandboxId, task)`: verify the task manifest JSON is written to `/workspace/.devs/task.json` inside the sandbox.
  - Test `injectMcpTools(sandboxId, mcpConfig)`: verify the MCP server configuration object is written to `/workspace/.devs/mcp_config.json` inside the sandbox.
  - Test `runPreflight(sandboxId, { projectRoot, task, mcpConfig })`: verify it calls all three sub-methods in order (codebase → task → MCP), and that the sandbox is fully ready before returning.
  - Test error handling: if any injection step fails, the method throws a descriptive `PreflightError` and does not leave a partially-injected sandbox.
  - Write an integration test using a Docker sandbox fixture that starts a real container, runs `PreflightService.runPreflight`, and asserts that the workspace directory contains the expected files.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/preflight/PreflightService.ts`:
  - Define a `PreflightService` class that accepts a `SandboxProvider` instance in its constructor.
  - Implement `injectCodebase(sandboxId: string, projectRootPath: string): Promise<void>`:
    - Use `FilesystemManager.sync(projectRootPath, sandboxId, { exclude: ['.git', '.devs'] })` to copy project files into the sandbox's `/workspace` directory.
  - Implement `injectTaskRequirements(sandboxId: string, task: TaskManifest): Promise<void>`:
    - Serialize the `task` object to JSON and write it to `/workspace/.devs/task.json` inside the sandbox using `SandboxProvider.exec` or a filesystem write primitive.
  - Implement `injectMcpTools(sandboxId: string, mcpConfig: McpConfig): Promise<void>`:
    - Serialize `mcpConfig` to JSON and write it to `/workspace/.devs/mcp_config.json` inside the sandbox.
  - Implement `runPreflight(sandboxId: string, opts: PreflightOptions): Promise<void>`:
    - Call `injectCodebase`, then `injectTaskRequirements`, then `injectMcpTools` sequentially.
    - Wrap errors in a `PreflightError` class that carries `sandboxId` and the failed step name.
- [ ] Create `packages/sandbox/src/preflight/PreflightError.ts` with a typed error class extending `Error`.
- [ ] Export `PreflightService` and `PreflightError` from `packages/sandbox/src/index.ts`.
- [ ] Define `PreflightOptions`, `TaskManifest`, and `McpConfig` TypeScript interfaces in `packages/sandbox/src/types.ts`.

## 3. Code Review
- [ ] Verify that `PreflightService` has no hard-coded paths; all paths (e.g., `/workspace`, `.devs/`) are constants imported from a shared `SANDBOX_PATHS` config object.
- [ ] Verify that the service is side-effect free in tests by confirming all `SandboxProvider`/`FilesystemManager` dependencies are injected via constructor (no module-level singletons).
- [ ] Confirm that `PreflightError` captures `sandboxId` and `step` as typed properties, not just a string message.
- [ ] Verify that the integration test tears down the Docker container in an `afterAll` block regardless of test outcome.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit tests in `preflight.test.ts` pass with no failures.
- [ ] Run the integration test suite with `pnpm --filter @devs/sandbox test:integration` and confirm the Docker-based preflight test passes.
- [ ] Confirm test coverage for `PreflightService.ts` is ≥ 90% lines/branches.

## 5. Update Documentation
- [ ] Create `packages/sandbox/src/preflight/preflight.agent.md` documenting: the purpose of `PreflightService`, the sequence of injection steps, the `SANDBOX_PATHS` constants used, and the error contract for `PreflightError`.
- [ ] Update `packages/sandbox/README.md` to include a "Pre-flight Injection" section describing how to invoke `runPreflight` and what it places in the sandbox.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm it exits with code 0.
- [ ] Run the integration test with `SANDBOX_DRIVER=docker pnpm --filter @devs/sandbox test:integration` and confirm exit code 0 and that a log line matching `Preflight complete for sandbox` is emitted.
