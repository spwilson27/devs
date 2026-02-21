# Task: Implement bootstrap-sandbox Script (Sub-Epic: 01_Module Foundation & Directory Structure)

## Covered Requirements
- [2_TAS-REQ-012], [TAS-099]

## 1. Initial Test Written
- [ ] Create `packages/sandbox/tests/unit/scripts/bootstrap-sandbox.test.ts` that:
  - Mocks the `child_process.execSync` module to capture shell invocations.
  - Imports the `bootstrapSandbox` function from `packages/sandbox/src/scripts/bootstrap-sandbox.ts`.
  - Asserts that when called with `{ driver: 'docker' }`, the function invokes a Docker availability check (e.g., `docker info`).
  - Asserts that when `docker info` fails (mock throws), the function throws a descriptive `SandboxBootstrapError` with message matching `/Docker daemon is not running/`.
  - Asserts that when called with `{ driver: 'webcontainer' }`, the function performs a Node.js version check (`node --version`) and throws `SandboxBootstrapError` if the major version is below 22.
  - Asserts that on success, the function returns a `BootstrapResult` object with fields `{ driver: string, ready: true, durationMs: number }`.
- [ ] Create `packages/sandbox/tests/integration/docker/bootstrap-sandbox-integration.test.ts` (gated behind the `integration` vitest project) that:
  - Skips if the `DEVS_INTEGRATION_TESTS` environment variable is not set to `"1"`.
  - Calls `bootstrapSandbox({ driver: 'docker' })` in a real environment where Docker is running.
  - Asserts the returned `BootstrapResult.ready` is `true` and `durationMs` is a positive number under 30,000ms.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/scripts/bootstrap-sandbox.ts`:
  - Define and export `SandboxBootstrapError extends Error` with a `driver` property.
  - Define and export `BootstrapResult` interface: `{ driver: 'docker' | 'webcontainer'; ready: true; durationMs: number }`.
  - Define and export `BootstrapOptions` interface: `{ driver: 'docker' | 'webcontainer'; timeoutMs?: number }`.
  - Implement `bootstrapSandbox(options: BootstrapOptions): Promise<BootstrapResult>`:
    - Record start time with `performance.now()`.
    - For `driver: 'docker'`: run `docker info` via `child_process.execSync` with a `stdio: 'pipe'` option and a timeout derived from `options.timeoutMs ?? 10_000`. If it throws, catch and re-throw as `SandboxBootstrapError`.
    - For `driver: 'webcontainer'`: parse `process.version` and assert major version ≥ 22. If not, throw `SandboxBootstrapError`.
    - Return `{ driver: options.driver, ready: true, durationMs: Math.round(performance.now() - start) }`.
- [ ] Create `packages/sandbox/scripts/bootstrap-sandbox.mjs` — a thin CLI wrapper:
  ```js
  #!/usr/bin/env node
  import { bootstrapSandbox } from '../dist/scripts/bootstrap-sandbox.js';
  const driver = process.argv[2] ?? 'docker';
  bootstrapSandbox({ driver })
    .then(r => { console.log(`Bootstrap OK (${r.driver}) in ${r.durationMs}ms`); process.exit(0); })
    .catch(e => { console.error(`Bootstrap FAILED: ${e.message}`); process.exit(1); });
  ```
- [ ] Add a `"bootstrap-sandbox"` script to `packages/sandbox/package.json`:
  ```json
  "bootstrap-sandbox": "node scripts/bootstrap-sandbox.mjs"
  ```
- [ ] Export `bootstrapSandbox`, `SandboxBootstrapError`, `BootstrapResult`, and `BootstrapOptions` from `packages/sandbox/src/scripts/index.ts`, and re-export from `src/index.ts` (or add `src/scripts/` as a new barrel entry).

## 3. Code Review
- [ ] Verify that `bootstrapSandbox` is a pure async function with no side effects beyond executing a subprocess — it must not write files, modify state, or interact with Docker images.
- [ ] Verify `SandboxBootstrapError` is a typed subclass of `Error` with a non-enumerable `driver` property.
- [ ] Confirm that all `execSync` calls use `stdio: 'pipe'` to prevent output leaking to the parent process's stdout/stderr.
- [ ] Confirm the CLI wrapper (`scripts/bootstrap-sandbox.mjs`) imports from `dist/` (compiled output), not `src/`, ensuring the build step is required before the script can run.
- [ ] Verify the `timeoutMs` option propagates correctly to the underlying `execSync` call as `timeout: options.timeoutMs`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox build` to compile the TypeScript.
- [ ] Run `pnpm --filter @devs/sandbox test --project unit` and confirm `bootstrap-sandbox.test.ts` passes all unit tests.
- [ ] (Optional, CI-gated) Run `DEVS_INTEGRATION_TESTS=1 pnpm --filter @devs/sandbox test --project integration` on a machine with Docker running and confirm the integration test passes.

## 5. Update Documentation
- [ ] Update `packages/sandbox/.agent/PROGRESS.md` to mark the `bootstrap-sandbox` script item as complete (`[x]`).
- [ ] Add a **Scripts** section to `packages/sandbox/README.md` documenting:
  - `pnpm bootstrap-sandbox [docker|webcontainer]` — usage, expected output on success, and expected exit codes.
  - The environment prerequisites (Docker daemon running for `docker` driver; Node ≥22 for `webcontainer` driver).
- [ ] Add a JSDoc block to the exported `bootstrapSandbox` function explaining parameters, return value, and thrown errors.

## 6. Automated Verification
- [ ] Build the package and run:
  ```bash
  node -e "
  import('./packages/sandbox/dist/scripts/bootstrap-sandbox.js').then(m => {
    if (typeof m.bootstrapSandbox !== 'function') throw new Error('bootstrapSandbox not exported');
    if (typeof m.SandboxBootstrapError !== 'function') throw new Error('SandboxBootstrapError not exported');
    console.log('bootstrap-sandbox exports OK');
  });
  "
  ```
  and verify exit code is 0.
- [ ] Run `pnpm --filter @devs/sandbox bootstrap-sandbox webcontainer` (which does not require Docker) and verify it exits with code 0 and prints `Bootstrap OK (webcontainer)`.
