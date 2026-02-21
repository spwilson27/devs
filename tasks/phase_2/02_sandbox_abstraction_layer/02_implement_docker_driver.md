# Task: Implement `DockerDriver` — Hardened Alpine-Based Sandbox Execution (Sub-Epic: 02_Sandbox Abstraction Layer)

## Covered Requirements
- [TAS-080], [1_PRD-REQ-IMP-010], [5_SECURITY_DESIGN-REQ-SEC-SD-045], [9_ROADMAP-TAS-202]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/__tests__/DockerDriver.spec.ts`, write **unit tests** using a mocked Docker client (e.g., mock `dockerode` or the Docker CLI subprocess) that:
  - `DockerDriver` extends `SandboxProvider` and can be instantiated with a `DockerDriverConfig` (image name, resource limits).
  - `provision()` calls `docker run` with the correct flags:
    - `--cap-drop=ALL` (all Linux capabilities dropped).
    - `--security-opt=no-new-privileges`.
    - `--read-only` on root filesystem.
    - `--network=none` (no network by default — network policy to be layered in a later task).
    - `--memory=4g` and `--cpus=2`.
    - `--rm` (ephemeral: container auto-removes on stop).
    - Uses the hardened Alpine base image (e.g., `ghcr.io/devs-project/sandbox-base:alpine-3.19`).
  - `provision()` returns a `SandboxContext` with a unique `id` (the Docker container ID or a UUID), a `workdir`, and `status: 'running'`.
  - `exec(ctx, 'echo', ['hello'])` calls `docker exec <containerId> echo hello` and returns a correct `ExecResult`.
  - `destroy(ctx)` calls `docker rm -f <containerId>` (or `docker stop` + `docker rm`) and resolves successfully.
  - Verify that if `provision()` fails (e.g., image not found), it throws a typed `SandboxProvisionError` with a descriptive message.
  - Verify that `exec()` respects `opts.timeoutMs` and throws `SandboxExecTimeoutError` if the command exceeds the timeout.

- [ ] In `packages/sandbox/src/__tests__/DockerDriver.integration.spec.ts`, write **integration tests** (tagged with `@integration` so they can be skipped in CI without Docker):
  - Provision a real Alpine container, run `echo "integration-test"`, and assert `stdout === "integration-test\n"`.
  - Assert that the container is removed after `destroy()` (run `docker inspect <id>` and confirm 404).
  - Assert that `--cap-drop=ALL` is reflected in `docker inspect` output (`CapAdd` is null, `CapDrop` includes `ALL`).

## 2. Task Implementation

- [ ] Install `dockerode` (or use the `child_process`-based Docker CLI wrapper) as a dependency of `@devs/sandbox`:
  ```
  pnpm --filter @devs/sandbox add dockerode
  pnpm --filter @devs/sandbox add -D @types/dockerode
  ```

- [ ] Create `packages/sandbox/src/drivers/DockerDriver.ts`:
  - Implement `DockerDriverConfig` interface with fields: `image: string`, `memoryMb: number` (default 4096), `cpuCount: number` (default 2), `workdir: string` (default `/workspace`).
  - Implement `class DockerDriver extends SandboxProvider` with a constructor accepting `DockerDriverConfig`.
  - `provision()`: Create a Docker container with the hardened flags (see test section). Store the container ID. Return a `SandboxContext` with `id: containerID`, `workdir: config.workdir`, `status: 'running'`, `createdAt: new Date()`.
  - `exec(ctx, cmd, args, opts)`: Run `docker exec <containerID> <cmd> <args>` with timeout enforcement using `Promise.race` and a `setTimeout`-based rejection. Capture stdout and stderr. Measure duration. Return `ExecResult`.
  - `destroy(ctx)`: Stop and remove the container. Set `ctx.status = 'stopped'`.

- [ ] Create custom error classes in `packages/sandbox/src/errors.ts`:
  ```typescript
  export class SandboxProvisionError extends Error { constructor(msg: string) { super(msg); this.name = 'SandboxProvisionError'; } }
  export class SandboxExecTimeoutError extends Error { constructor(timeoutMs: number) { super(`Exec timed out after ${timeoutMs}ms`); this.name = 'SandboxExecTimeoutError'; } }
  export class SandboxDestroyError extends Error { constructor(msg: string) { super(msg); this.name = 'SandboxDestroyError'; } }
  ```

- [ ] Create the hardened Alpine Dockerfile at `packages/sandbox/docker/Dockerfile.sandbox-base`:
  ```dockerfile
  FROM alpine:3.19
  RUN apk add --no-cache bash git nodejs npm python3 && \
      addgroup -S agent && adduser -S agent -G agent
  USER agent
  WORKDIR /workspace
  ```

- [ ] Export `DockerDriver` and `DockerDriverConfig` from `packages/sandbox/src/index.ts`.

- [ ] Document the required Docker flags with inline comments in `DockerDriver.ts` explaining the security rationale for each flag (e.g., `// --cap-drop=ALL: prevents privilege escalation; satisfies [5_SECURITY_DESIGN-REQ-SEC-SD-045]`).

## 3. Code Review

- [ ] Verify that every Docker `run` invocation includes `--cap-drop=ALL`, `--security-opt=no-new-privileges`, `--read-only`, and `--memory` / `--cpus` flags. No exceptions.
- [ ] Verify that the `DockerDriver` does **not** hardcode any credentials, API keys, or host paths. The `workdir` inside the container must always be an isolated path (e.g., `/workspace`), never a host path mounted without explicit opt-in.
- [ ] Verify that `destroy()` is always called in a `finally` block by any code that calls `provision()` — this must be enforced via documentation (the driver itself cannot enforce caller behavior, but the README must warn about this pattern).
- [ ] Verify that `SandboxExecTimeoutError` is thrown (not just logged) when a command exceeds `opts.timeoutMs`, ensuring callers can handle the timeout.
- [ ] Verify there are no unhandled promise rejections: all async paths in `provision`, `exec`, and `destroy` have `try/catch` that re-throw as typed errors.
- [ ] Confirm the Docker image tag used in `DockerDriverConfig` defaults to a pinned digest or version tag (not `latest`) to satisfy determinism requirements.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` (unit tests only, integration tests skipped) and confirm all tests in `DockerDriver.spec.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration` (if Docker is available in the environment) and confirm `DockerDriver.integration.spec.ts` passes.
- [ ] Run `pnpm --filter @devs/sandbox build` and confirm `dist/drivers/DockerDriver.js` and `.d.ts` are generated.

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` to add a "DockerDriver" section documenting:
  - Required host dependencies (Docker Engine ≥ 24.x).
  - Configuration options (`DockerDriverConfig` fields and defaults).
  - The hardened Docker flags used and why.
  - Example instantiation and usage code snippet.
- [ ] Update `.agent/memory.md` to record: "`DockerDriver` is the CLI-environment sandbox driver. It uses Alpine 3.19, drops all Linux capabilities, enforces 4GB RAM and 2 CPU limits, and is auto-removed on `destroy()`. Default network is `none`."
- [ ] Update `packages/sandbox/docker/README.md` documenting how to build and push the `sandbox-base` image.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage` and verify line coverage ≥ 85% for `src/drivers/DockerDriver.ts`.
- [ ] Run the following shell assertion to confirm hardened flags appear in the driver source:
  ```bash
  grep -q 'cap-drop' packages/sandbox/src/drivers/DockerDriver.ts && \
  grep -q 'no-new-privileges' packages/sandbox/src/drivers/DockerDriver.ts && \
  grep -q 'read-only' packages/sandbox/src/drivers/DockerDriver.ts && \
  echo "HARDENED FLAGS OK"
  ```
- [ ] Confirm no `latest` image tag is used as the default: `grep -v 'latest' packages/sandbox/src/drivers/DockerDriver.ts | grep -q 'alpine' && echo "PINNED TAG OK"`.
