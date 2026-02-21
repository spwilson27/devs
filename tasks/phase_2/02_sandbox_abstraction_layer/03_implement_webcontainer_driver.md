# Task: Implement `WebContainerDriver` — Browser-Based Sandbox Execution for VSCode Web (Sub-Epic: 02_Sandbox Abstraction Layer)

## Covered Requirements
- [9_ROADMAP-TAS-202], [1_PRD-REQ-IMP-010], [TAS-080]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/__tests__/WebContainerDriver.spec.ts`, write unit tests using a mocked `@webcontainer/api` that:
  - `WebContainerDriver` extends `SandboxProvider` and can be instantiated with a `WebContainerDriverConfig`.
  - `provision()` calls `WebContainer.boot()` exactly once and returns a `SandboxContext` with a unique `id`, `workdir: '/workspace'`, and `status: 'running'`.
  - A second call to `provision()` on the same `WebContainerDriver` instance throws a `SandboxProvisionError` because WebContainers are singleton per browser tab (or returns the existing context — document the chosen behavior).
  - `exec(ctx, 'node', ['-e', 'console.log("hello")'])` calls `webcontainerInstance.spawn('node', ['-e', ...])` and correctly returns `ExecResult` with `stdout: 'hello\n'`, `exitCode: 0`, and a measured `durationMs`.
  - `exec()` respects `opts.timeoutMs` and throws `SandboxExecTimeoutError` if the process does not exit within the timeout.
  - `destroy(ctx)` tears down the WebContainer instance (calls `webcontainerInstance.teardown()` if the API supports it, or no-ops with a warning if not) and sets `ctx.status = 'stopped'`.
  - Verify that `exec()` with an unsupported binary (e.g., a native C binary that WebContainers cannot run) rejects with a descriptive `SandboxExecError` rather than hanging.

- [ ] In `packages/sandbox/src/__tests__/WebContainerDriver.browser.spec.ts`, write Playwright-based browser integration tests (tagged `@browser`) that:
  - Boot a real WebContainer in a headless browser context.
  - Run `echo "wc-integration"` and assert `stdout === 'wc-integration\n'`.
  - Confirm the container is fully isolated from the host filesystem (no `fs.readFileSync` of host paths succeeds).

## 2. Task Implementation

- [ ] Add `@webcontainer/api` as a peer dependency in `packages/sandbox/package.json`:
  ```json
  "peerDependencies": {
    "@webcontainer/api": "^1.2.0"
  },
  "peerDependenciesMeta": {
    "@webcontainer/api": { "optional": true }
  }
  ```
  Mark it optional so CLI environments (Docker) can install without it.

- [ ] Create `packages/sandbox/src/drivers/WebContainerDriver.ts`:
  - Define `WebContainerDriverConfig` interface: `{ workdir?: string }` (minimal config since WebContainers self-host).
  - Implement `class WebContainerDriver extends SandboxProvider`:
    - Internal state: `private wc: WebContainer | null = null`, `private context: SandboxContext | null = null`.
    - `provision()`: Guard against double-boot. Call `WebContainer.boot()`. Create a `/workspace` directory in the virtual FS via `wc.fs.mkdir('/workspace', { recursive: true })`. Return `SandboxContext`.
    - `exec(ctx, cmd, args, opts)`: Call `wc.spawn(cmd, args, { cwd: opts?.cwd ?? ctx.workdir })`. Collect stdout/stderr via stream readers. Race against `opts.timeoutMs` using `Promise.race`. Return `ExecResult`.
    - `destroy(ctx)`: Call `this.wc?.teardown()` (if available in the API version), set `this.wc = null`, set `ctx.status = 'stopped'`.
  - Add a capability detection export: `export const isWebContainerSupported = (): boolean => typeof window !== 'undefined' && 'crossOriginIsolated' in window && window.crossOriginIsolated;`

- [ ] Export `WebContainerDriver`, `WebContainerDriverConfig`, and `isWebContainerSupported` from `packages/sandbox/src/index.ts`.

- [ ] Create a platform-detection factory helper in `packages/sandbox/src/createSandboxProvider.ts`:
  ```typescript
  import { DockerDriver } from './drivers/DockerDriver';
  import { WebContainerDriver, isWebContainerSupported } from './drivers/WebContainerDriver';
  import type { SandboxProvider } from './SandboxProvider';

  export function createSandboxProvider(): SandboxProvider {
    if (isWebContainerSupported()) {
      return new WebContainerDriver();
    }
    return new DockerDriver({ image: 'ghcr.io/devs-project/sandbox-base:alpine-3.19' });
  }
  ```

- [ ] Export `createSandboxProvider` from `packages/sandbox/src/index.ts`.

## 3. Code Review

- [ ] Verify that `WebContainerDriver` handles the singleton WebContainer constraint: calling `provision()` twice must either return the existing context or throw — not silently boot two instances (which WebContainers does not support).
- [ ] Verify that `isWebContainerSupported()` checks `window.crossOriginIsolated` — WebContainers require COOP/COEP headers and will not function without them.
- [ ] Verify that `exec()` stream readers correctly drain stdout and stderr even if the process exits before the reader has fully consumed the stream (avoid hanging promises).
- [ ] Verify that `@webcontainer/api` is never imported at the module's top level without a dynamic import guard or optional peer dep pattern, so that `DockerDriver`-only environments do not fail on import.
- [ ] Verify the `createSandboxProvider` factory is the recommended entry point for consumers and is properly documented.
- [ ] Confirm no TypeScript `any` escapes are introduced in the WebContainer stream handling code.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit tests in `WebContainerDriver.spec.ts` pass (mocked `@webcontainer/api`).
- [ ] Run `pnpm --filter @devs/sandbox test:browser` (if a Playwright environment is available) and confirm `WebContainerDriver.browser.spec.ts` passes.
- [ ] Run `pnpm --filter @devs/sandbox build` and confirm `dist/drivers/WebContainerDriver.js` and `dist/createSandboxProvider.js` are generated.
- [ ] Run `tsc --noEmit` inside `packages/sandbox` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` to add a "WebContainerDriver" section documenting:
  - Browser requirements: `crossOriginIsolated === true` (COOP + COEP headers required).
  - Known limitations: no native binary support, no raw syscalls, JavaScript/Node.js only unless WASM-wrapped.
  - How to use `isWebContainerSupported()` to detect the environment before instantiating.
  - The `createSandboxProvider()` factory as the recommended auto-detection entry point.
- [ ] Update `.agent/memory.md` to record: "`WebContainerDriver` is the VSCode Web sandbox driver. It requires `window.crossOriginIsolated === true`. It supports Node.js/JS workloads only. Non-JS language support requires a WASM wrapper. Use `createSandboxProvider()` to select the correct driver automatically."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage` and verify line coverage ≥ 80% for `src/drivers/WebContainerDriver.ts`.
- [ ] Confirm `isWebContainerSupported` is exported from the package dist:
  ```bash
  node -e "const s = require('./packages/sandbox/dist/index.js'); console.assert(typeof s.isWebContainerSupported === 'function', 'isWebContainerSupported must be exported'); console.log('OK')"
  ```
- [ ] Confirm `createSandboxProvider` is exported from the package dist:
  ```bash
  node -e "const s = require('./packages/sandbox/dist/index.js'); console.assert(typeof s.createSandboxProvider === 'function', 'createSandboxProvider must be exported'); console.log('OK')"
  ```
