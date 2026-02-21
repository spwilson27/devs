# Task: DockerDriver Core Class & Container Lifecycle Implementation (Sub-Epic: 03_Docker Driver Implementation)

## Covered Requirements
- [2_TAS-REQ-025]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/docker/__tests__/DockerDriver.spec.ts`, write unit tests using a mocked `dockerode` (or equivalent Docker SDK) client injected via constructor.
- [ ] Write a test `DockerDriver implements the SandboxProvider interface` that instantiates `DockerDriver` and verifies it satisfies the `SandboxProvider` type contract (methods: `provision`, `exec`, `destroy`, `getStatus`).
- [ ] Write a test `provision() creates a container with the configured image and returns a SandboxHandle` — mock `docker.createContainer` to return a fake container object; assert `provision()` resolves with an object containing `containerId` and `workspacePath`.
- [ ] Write a test `provision() mounts /workspace volume correctly` — assert that `createContainer` is called with a `HostConfig.Binds` entry matching `<hostProjectPath>:/workspace`.
- [ ] Write a test `exec() runs a command inside the container and streams stdout/stderr` — mock `container.exec` and `exec.start`; assert that the returned `ExecResult` contains `exitCode`, `stdout`, and `stderr` strings.
- [ ] Write a test `exec() resolves with exitCode=1 when the container command fails` — mock the exec stream to emit an exit code of 1; assert `ExecResult.exitCode === 1`.
- [ ] Write a test `destroy() calls container.stop() then container.remove()` — assert both are called in order and the `SandboxHandle` is invalidated afterwards.
- [ ] Write a test `getStatus() returns "running" when container is running` — mock `container.inspect` to return `{ State: { Running: true } }`; assert status is `"running"`.
- [ ] Write a test `getStatus() returns "stopped" when container is stopped` — mock `container.inspect` to return `{ State: { Running: false } }`; assert status is `"stopped"`.
- [ ] Write a test `provision() throws SandboxProvisionError if docker.createContainer rejects` — assert the custom error type is thrown with a descriptive message.
- [ ] Write an integration test `DockerDriver full lifecycle: provision → exec → destroy` (tagged `@integration`) that actually pulls the base image, runs `echo "hello"`, captures output, and tears down the container — asserts `stdout` includes `"hello"` and the container no longer exists after `destroy()`.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/docker/DockerDriver.ts` implementing the `SandboxProvider` interface from `packages/sandbox/src/SandboxProvider.ts`.
- [ ] Import and use the `dockerode` library (add to `packages/sandbox/package.json` dependencies: `"dockerode": "^4.0.0"`, `"@types/dockerode": "^3.3.0"`).
- [ ] Define `DockerDriverConfig` interface with fields:
  - `image: string` — Docker image to use (defaults to `devs-sandbox-base:latest`).
  - `hostProjectPath: string` — absolute path on host to mount as `/workspace`.
  - `memoryLimitBytes: number` — RAM cap (default: `4 * 1024 * 1024 * 1024`).
  - `cpuQuota: number` — CPU quota in microseconds (default: `200000`, i.e., 2 cores × 100000).
  - `pidsLimit: number` — default `128`.
- [ ] Implement `provision(config: DockerDriverConfig): Promise<SandboxHandle>`:
  - Call `docker.createContainer(...)` with `HostConfig` binding `hostProjectPath` → `/workspace:rw`.
  - Start the container immediately after creation.
  - Return a `SandboxHandle` with `containerId`, `workspacePath: "/workspace"`, and a reference to the Dockerode `Container` object.
- [ ] Implement `exec(handle: SandboxHandle, command: string[]): Promise<ExecResult>`:
  - Call `container.exec({ Cmd: command, AttachStdout: true, AttachStderr: true })`.
  - Start the exec instance and collect all output chunks into `stdout` and `stderr` buffers.
  - Await the exec stream close; inspect the exec instance for `ExitCode`.
  - Return `{ exitCode, stdout, stderr }`.
- [ ] Implement `destroy(handle: SandboxHandle): Promise<void>`:
  - Call `container.stop({ t: 10 })` (10 second graceful period).
  - Call `container.remove({ force: true, v: true })` to remove volumes.
  - Mark the handle as destroyed so subsequent calls throw `SandboxDestroyedError`.
- [ ] Implement `getStatus(handle: SandboxHandle): Promise<SandboxStatus>`:
  - Call `container.inspect()` and map `State.Running` → `"running"` | `"stopped"` | `"unknown"`.
- [ ] Define and export `SandboxProvisionError`, `SandboxDestroyedError` custom error classes extending `Error` in `packages/sandbox/src/errors.ts`.
- [ ] Export `DockerDriver` from `packages/sandbox/src/index.ts`.

## 3. Code Review

- [ ] Verify `DockerDriver` does NOT extend any concrete class — it must implement the `SandboxProvider` interface only, ensuring substitutability (requirement: [2_TAS-REQ-025] depends on [2_TAS-REQ-024]).
- [ ] Verify all Dockerode calls are wrapped in `try/catch` that rethrow typed custom errors (`SandboxProvisionError`, etc.) — no raw Dockerode errors should escape the driver.
- [ ] Verify `exec()` correctly demultiplexes the Docker multiplexed stream (stdout/stderr share one TCP stream with a header byte).
- [ ] Verify `destroy()` calls `remove({ v: true })` to clean up anonymous volumes, preventing disk leaks.
- [ ] Verify the `DockerDriverConfig` defaults are applied via destructuring with default values, not magic strings scattered in method bodies.
- [ ] Confirm no `console.log` calls; all observability routes through the injected logger interface.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` — all unit tests in `DockerDriver.spec.ts` must pass (mocked Dockerode).
- [ ] Run `pnpm --filter @devs/sandbox test:integration` — the full lifecycle integration test must pass with a live Docker daemon.
- [ ] Confirm TypeScript compiles without errors: `pnpm --filter @devs/sandbox build`.

## 5. Update Documentation

- [ ] Create `packages/sandbox/src/docker/DockerDriver.agent.md` with:
  - **Intent**: Describe that `DockerDriver` is the CLI-mode implementation of `SandboxProvider`, using ephemeral Docker containers for agent task execution.
  - **Architecture**: Document the `provision → exec → destroy` lifecycle, the Dockerode dependency, and how `SandboxHandle` wraps the container reference.
  - **Agentic Hooks**: Specify that `exec()` must never be called after `destroy()`, and that agents should check `getStatus()` before issuing commands.
  - **Known Constraints**: Container startup adds ~2–5s latency. The Docker daemon must be accessible at the default socket path.
- [ ] Update `packages/sandbox/README.md` to include a `DockerDriver` usage example showing how to instantiate it with a custom config.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --reporter=json | jq '[.testResults[].assertionResults[] | select(.status=="failed")] | length'` and assert output is `0`.
- [ ] Run `pnpm --filter @devs/sandbox build` and assert exit code is 0 (no TypeScript errors).
- [ ] Integration guard: `docker ps -a --filter label=devs.sandbox=true --format '{{.ID}}' | wc -l` run before and after the integration test suite — assert the count after equals the count before (no leaked containers).
