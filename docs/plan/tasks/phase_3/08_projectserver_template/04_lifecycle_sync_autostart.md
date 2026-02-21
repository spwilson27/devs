# Task: Implement Lifecycle Sync – ProjectServer Auto-Start in Dev Mode (Sub-Epic: 08_ProjectServer Template)

## Covered Requirements
- [3_MCP-TAS-081]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/agent/__tests__/projectServerLifecycle.test.ts`, write unit tests for the `ProjectServerLifecycleManager` class:
  - Mock `child_process.spawn` using `jest.spyOn` / `vi.spyOn`.
  - Test `start(projectRoot: string): Promise<void>`:
    - Assert it spawns `node dist/index.js` inside `<projectRoot>/mcp-server/` (i.e., the `cwd` option equals `path.join(projectRoot, 'mcp-server')`).
    - Assert the spawned process uses `stdio: ['pipe', 'pipe', 'pipe']` (STDIO transport).
    - Assert `start()` resolves after the child process emits a ready signal (simulated by writing a known JSON-RPC `initialize` response to the mock process's stdout within 2 seconds).
    - Assert calling `start()` a second time without calling `stop()` first is a no-op (idempotent).
  - Test `stop(): Promise<void>`:
    - Assert it sends `SIGTERM` to the child process.
    - Assert that if the process does not exit within 5 seconds, it sends `SIGKILL`.
    - Assert that `stop()` resolves once the process exits.
  - Test `isRunning(): boolean`:
    - Returns `false` before `start()`.
    - Returns `true` after `start()` resolves.
    - Returns `false` after `stop()` resolves.
  - Test that if the child process crashes unexpectedly, `isRunning()` returns `false` and a `"projectserver:crash"` event is emitted on the `EventEmitter` returned by `getEventBus()`.

- [ ] In `packages/devs-core/src/agent/__tests__/devModeIntegration.test.ts`, write an integration test verifying that the `DeveloperAgent`'s `runDevMode()` call triggers `ProjectServerLifecycleManager.start()`:
  - Use a stub `DeveloperAgent` with `runDevMode()` stubbed to call the lifecycle manager.
  - Assert that after `runDevMode()` resolves, `lifecycleManager.isRunning()` is `true`.
  - Assert that after `devMode.stop()` is called, `lifecycleManager.isRunning()` is `false`.

## 2. Task Implementation
- [ ] Create `packages/devs-core/src/agent/projectServerLifecycleManager.ts`:
  - Export class `ProjectServerLifecycleManager extends EventEmitter`.
  - Private fields: `proc: ChildProcess | null`, `projectRoot: string`.
  - Constructor: `constructor(projectRoot: string)` — stores `projectRoot`, sets `proc = null`.
  - `async start(): Promise<void>`:
    - If `this.proc !== null`, return immediately (idempotent).
    - Resolve the MCP server entry point: `path.join(this.projectRoot, 'mcp-server', 'dist', 'index.js')`.
    - Assert the file exists (`fs.existsSync`); if not, throw `Error("ProjectServer not built. Run 'npm run build' in mcp-server/ first.")`.
    - Spawn the process: `spawn('node', ['dist/index.js'], { cwd: path.join(this.projectRoot, 'mcp-server'), stdio: ['pipe', 'pipe', 'pipe'] })`.
    - Wait for a valid MCP `initialize` handshake by sending the init request over `proc.stdin` and waiting for a response on `proc.stdout` (timeout: 10 seconds). If no response within 10 seconds, kill the process and throw `Error("ProjectServer failed to start: initialize timeout")`.
    - Register a `proc.on('exit', ...)` handler that sets `this.proc = null` and emits `"projectserver:crash"` if exit code is non-zero.
    - Register a `proc.stderr.on('data', ...)` handler that emits `"projectserver:stderr"` events for observability.
  - `async stop(): Promise<void>`:
    - If `this.proc === null`, return immediately.
    - Send `this.proc.kill('SIGTERM')`.
    - Wait for the process to exit (await a `Promise` that resolves on `proc.on('exit')`).
    - If not exited within 5 seconds, call `this.proc.kill('SIGKILL')`.
    - Set `this.proc = null`.
  - `isRunning(): boolean`: return `this.proc !== null`.
  - `getEventBus(): EventEmitter`: return `this` (since the class extends `EventEmitter`).

- [ ] In `packages/devs-core/src/agent/developerAgent.ts` (or equivalent), update the `runDevMode()` method to:
  1. Instantiate `new ProjectServerLifecycleManager(this.projectRoot)` if not already created.
  2. Call `await this.projectServerLifecycleManager.start()` before running the dev server / watch process.
  3. On dev mode shutdown (process signal or `stop()` call), call `await this.projectServerLifecycleManager.stop()`.
  - If `DeveloperAgent` does not yet have a `runDevMode()` method, add a stub that only starts/stops the `ProjectServerLifecycleManager` (the full dev server implementation is out of scope for this task).

- [ ] Export `ProjectServerLifecycleManager` from `packages/devs-core/src/agent/index.ts`.

## 3. Code Review
- [ ] Verify that `start()` is strictly idempotent: calling it multiple times in rapid succession (e.g., concurrently via `Promise.all([mgr.start(), mgr.start()])`) spawns exactly one process.
- [ ] Verify the 10-second handshake timeout is implemented correctly and cleans up the spawned process on failure (no zombie processes).
- [ ] Verify the `SIGTERM` → 5-second grace → `SIGKILL` pattern in `stop()` so the sandbox cannot be left with orphan `node` processes.
- [ ] Confirm all event names emitted (`"projectserver:crash"`, `"projectserver:stderr"`) are documented with their payload types in a JSDoc comment on the class.
- [ ] Verify no circular imports are introduced between `projectServerLifecycleManager.ts` and `developerAgent.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="projectServerLifecycle|devModeIntegration"` and confirm all tests pass (exit code `0`).
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a section `### Lifecycle Sync` to `docs/architecture/templates.md` describing:
  - When the `ProjectServerLifecycleManager` starts and stops the MCP server.
  - The handshake protocol used to confirm server readiness.
  - The SIGTERM → SIGKILL graceful shutdown pattern.
- [ ] Update the `.agent/index.agent.md` AOD manifest template (in the scaffolder) to document the `ProjectServer` lifecycle: "Starts automatically when DeveloperAgent enters Dev Mode. Stops when Dev Mode exits."

## 6. Automated Verification
- [ ] Run the following end-to-end lifecycle smoke test against a real scaffolded project in a temp directory:
  ```bash
  node -e "
    const path = require('path');
    const { ProjectServerLifecycleManager } = require('@devs/core/agent');
    const root = '/tmp/mcp-lifecycle-verify';
    const mgr = new ProjectServerLifecycleManager(root);
    (async () => {
      await mgr.start();
      if (!mgr.isRunning()) { console.error('FAIL: not running after start()'); process.exit(1); }
      await mgr.stop();
      if (mgr.isRunning()) { console.error('FAIL: still running after stop()'); process.exit(1); }
      console.log('PASS: lifecycle sync OK');
    })().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
  "
  ```
