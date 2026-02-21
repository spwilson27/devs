# Task: WebContainers Lightweight Sandbox Fallback for Low-Overhead Tasks (Sub-Epic: 11_Sandbox and Failure Preservation)

## Covered Requirements
- [3_MCP-RISK-301], [RISK-401]

## 1. Initial Test Written

- [ ] Write unit tests in `src/sandbox/__tests__/sandbox-selector.test.ts`:
  - Assert `SandboxSelector.select(task)` returns `SandboxType.WEBCONTAINER` for a task with `weight: 'light'` (e.g., linting, unit test generation, log summarization).
  - Assert `SandboxSelector.select(task)` returns `SandboxType.DOCKER` for a task with `weight: 'heavy'` (e.g., integration tests, build steps, database operations).
  - Assert `SandboxSelector.select(task)` returns `SandboxType.DOCKER` when the task's `requiredCapabilities` array includes `'network'` or `'persistent_fs'`, regardless of weight.
  - Assert `SandboxSelector.select(task)` returns `SandboxType.DOCKER` when `devs.config.ts` field `sandbox.forceDocker: true`.
- [ ] Write unit tests in `src/sandbox/__tests__/webcontainer-sandbox.test.ts`:
  - Mock `@webcontainer/api`'s `WebContainer.boot()`.
  - Assert `WebContainerSandbox.create()` calls `WebContainer.boot()` once and caches the instance (subsequent calls reuse the booted instance).
  - Assert `WebContainerSandbox.execute(command, args)` calls `webcontainerInstance.spawn(command, args)` and returns `{ stdout, stderr, exitCode }`.
  - Assert `WebContainerSandbox.writeFile(path, content)` calls `webcontainerInstance.fs.writeFile(path, content)`.
  - Assert `WebContainerSandbox.dispose()` calls `webcontainerInstance.teardown()`.
- [ ] Write an integration test in `src/sandbox/__tests__/webcontainer-sandbox.integration.test.ts` (Node.js environment only):
  - Boot a WebContainer, write a simple JS file, execute `node file.js`, assert stdout equals expected output.
  - Measure boot time and assert < 10 seconds for first boot.

## 2. Task Implementation

- [ ] Install dependency: `npm install @webcontainer/api`.
- [ ] Create `src/sandbox/webcontainer-sandbox.ts` exporting `WebContainerSandbox` implementing the `ISandbox` interface:
  ```typescript
  interface ISandbox {
    execute(command: string, args: string[], opts?: ExecOpts): Promise<ExecResult>
    writeFile(path: string, content: string): Promise<void>
    readFile(path: string): Promise<string>
    dispose(): Promise<void>
  }
  ```
  - Use a module-level singleton for the `WebContainer` instance (boot once, reuse).
  - `execute()`: use `wc.spawn(command, args)` → collect output via stream readers → return `{ stdout, stderr, exitCode }`.
  - `writeFile()`: use `wc.fs.writeFile(path, content, { encoding: 'utf8' })`.
  - `readFile()`: use `wc.fs.readFile(path, 'utf8')`.
  - `dispose()`: call `wc.teardown()` and reset the singleton to `null`.
- [ ] Create `src/sandbox/docker-sandbox.ts` (if not existing) also implementing `ISandbox` as a wrapper around the existing `WarmPool`-backed Docker execution.
- [ ] Create `src/sandbox/sandbox-selector.ts` exporting `SandboxSelector`:
  - Define `SandboxType` enum: `DOCKER`, `WEBCONTAINER`.
  - `select(task: Task): SandboxType` — decision logic:
    1. If `config.sandbox.forceDocker` → `DOCKER`.
    2. If `task.requiredCapabilities` includes `'network'` or `'persistent_fs'` → `DOCKER`.
    3. If `task.weight === 'light'` → `WEBCONTAINER`.
    4. Default → `DOCKER`.
- [ ] Create `src/sandbox/sandbox-factory.ts` exporting `SandboxFactory.create(task: Task): ISandbox` — calls `SandboxSelector.select(task)` and returns the appropriate instance.
- [ ] Update `src/orchestration/implementation-loop.ts` to use `SandboxFactory.create(task)` instead of directly using `WarmPool.acquire()`.
- [ ] Add `sandbox.forceDocker: boolean` (default `false`) to `devs.config.ts` schema.
- [ ] Add `task.weight: 'light' | 'heavy'` field to the `Task` SQLite schema and set it during task generation (Phase 5): linting/unit-test-gen tasks → `'light'`; all others → `'heavy'`.

## 3. Code Review

- [ ] Confirm both `WebContainerSandbox` and `DockerSandbox` implement the same `ISandbox` interface — the implementation loop must never call sandbox-type-specific methods.
- [ ] Confirm WebContainer is only used in environments where it is supported (browser/Node.js with SharedArrayBuffer). Add a runtime capability check in `WebContainerSandbox.create()` that throws `UnsupportedEnvironmentError` with a helpful message if unavailable (gracefully fall back to Docker).
- [ ] Confirm the WebContainer singleton is properly torn down (`dispose()`) on process exit (register in `SIGTERM`/`SIGINT` handlers alongside `WarmPool.drain()`).
- [ ] Confirm `task.weight` is never `undefined` — add a database migration to backfill existing tasks with `weight = 'heavy'`.
- [ ] Confirm `SandboxSelector` decision is logged at `debug` level for observability.

## 4. Run Automated Tests to Verify

- [ ] Run: `npx vitest run src/sandbox/__tests__/sandbox-selector.test.ts`
- [ ] Run: `npx vitest run src/sandbox/__tests__/webcontainer-sandbox.test.ts`
- [ ] Run: `npx vitest run src/sandbox/__tests__/webcontainer-sandbox.integration.test.ts`
- [ ] Run: `npx vitest run src/orchestration/` and confirm no regressions.
- [ ] Confirm all tests pass with exit code 0.

## 5. Update Documentation

- [ ] Add section `## Sandbox Selection` to `docs/sandbox-architecture.md`:
  - Document the `SandboxType` enum and selection logic.
  - Document `task.weight` values and how they are assigned.
  - Document `devs.config.ts` field `sandbox.forceDocker`.
  - Document the `UnsupportedEnvironmentError` fallback behavior.
- [ ] Update `docs/agent-memory/phase_13.md`: "Sandbox type is selected per-task by `SandboxFactory.create(task)`. Never instantiate `WebContainerSandbox` or `DockerSandbox` directly. Light tasks (linting, unit test gen) use WebContainers; heavy tasks use Docker warm pool."

## 6. Automated Verification

- [ ] Run `npx vitest run --reporter=json src/sandbox/__tests__/sandbox-selector.test.ts | jq '.numFailedTests == 0'` — assert `true`.
- [ ] Run `grep -n "WarmPool.acquire\|DockerSandbox.create\|WebContainerSandbox.create" src/orchestration/implementation-loop.ts` — assert zero matches (all replaced by `SandboxFactory.create`).
- [ ] Run `grep -n "ISandbox" src/sandbox/webcontainer-sandbox.ts src/sandbox/docker-sandbox.ts` — assert both files implement the interface.
- [ ] Run the integration test and assert WebContainer boot time < 10s: integration test must include an explicit timing assertion.
