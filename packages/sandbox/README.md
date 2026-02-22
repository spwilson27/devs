# @devs/sandbox

Isolated execution abstraction for shell commands and file I/O.

## Build

pnpm --filter @devs/sandbox run build

## Test

pnpm --filter @devs/sandbox test

## Source tree

```
src/
├── index.ts           # Public barrel export
├── providers/         # SandboxProvider abstraction barrels
│   └── index.ts
├── drivers/           # Concrete driver implementations
│   └── index.ts
├── filesystem/        # FilesystemManager barrel
│   └── index.ts
├── network/           # Network egress components and policies
│   └── index.ts
├── types/             # Shared TypeScript types and interfaces
│   └── index.ts
└── utils/             # Internal utility functions
    └── index.ts
```

One-line descriptions:
- providers: Provider abstractions (SandboxProvider) used by consumers to inject implementations.
- drivers: Concrete drivers (process, container) that implement execution semantics.
- filesystem: FilesystemManager helpers and adapters.
- network: Network egress components and policies.
- types: Shared interfaces like SandboxExecResult and SandboxProvisionOptions.
- utils: Internal helpers not exported to consumers.

## .agent

Agent-Oriented Documentation (AOD) lives in `packages/sandbox/.agent` and provides module context, architectural decisions, hard constraints, dependency mappings, and a progress tracker for the package.

Files and purpose:
- `CONTEXT.md` — module purpose, phase context, public surface, integration points.
- `DECISIONS.md` — numbered, immutable architectural decisions.
- `CONSTRAINTS.md` — hard constraints that must be followed.
- `DEPENDENCIES.md` — upstream/downstream and driver-level external deps.
- `PROGRESS.md` — task progress tracker for the sub-epic.

AI agents should update these files as part of the TDD loop when implementing tasks in this package.

## Base Image

The sandbox base image is an immutable, minimal Alpine-based image pinned to an exact SHA-256 digest. It is built from alpine:3.19.1@sha256:1111111111111111111111111111111111111111111111111111111111111111 and runs a non-root user `agent` (UID 1001).

Rebuild:

pnpm --filter @devs/sandbox run build:base-image

Verify digest matches Dockerfile:

node -e "const m = require('./docker/base/image-manifest.json'); const fs = require('fs'); const df = fs.readFileSync('./docker/base/Dockerfile','utf8'); if(!df.includes(m.digest)) process.exit(1);"

## Testing

This package organizes tests into three tiers:

- unit: fast unit tests mirroring src/ submodules (tests/unit/)
- integration: integration tests for drivers and external interactions (tests/integration/)
- agent: agent-driven end-to-end behavioural tests (tests/agent/)

Run individual tiers:
- pnpm --filter @devs/sandbox test --project unit
- pnpm --filter @devs/sandbox test --project integration
- pnpm --filter @devs/sandbox test --project agent
- pnpm --filter @devs/sandbox validate-all [--skip-integration]  # runs lint, typecheck, build, and unit tests (integration only when DEVS_INTEGRATION_TESTS=1)

Run coverage:
- pnpm --filter @devs/sandbox test:coverage

Coverage targets: lines >= 80%

## Scripts

- pnpm --filter @devs/sandbox run bootstrap-sandbox [docker|webcontainer] — run preflight bootstrap checks for the sandbox; defaults to "docker".
- On success: prints "Bootstrap OK (<driver>) in <duration>ms" and exits with code 0.
- On failure: prints "Bootstrap FAILED: <message>" and exits with code 1.
- Environment prerequisites: Docker daemon running for the "docker" driver; Node.js >= 22 for the "webcontainer" driver.

## WebContainer Compatibility

This package depends on @webcontainer/api ^1.3.0 for local WebContainer spikes and experiments. Run the spike runner at `packages/sandbox/src/drivers/webcontainer/spike-runner.ts` to generate concrete probe outputs and place them in `spike-results/`.

## DockerDriver usage

Example:

```ts
import { DockerDriver } from './src/docker/DockerDriver';
// `docker` should be an injected Docker client (e.g., dockerode instance) available in the environment
const docker = /* docker client */;
const driver = new DockerDriver(docker, { hostProjectPath: '/absolute/path/to/project' });
const ctx = await driver.provision();
const res = await driver.exec(ctx, 'echo', ['hello']);
console.log(res.stdout);
await driver.destroy(ctx);
```

## Drivers

The sandbox package provides driver implementations for different sandbox runtimes. Example usage with WebContainerDriver:

```ts
import { WebContainerDriver } from '@devs/sandbox';

const driver = new WebContainerDriver();
const ctx = await driver.provision();
const res = await driver.exec(ctx, 'echo', ['hello']);
console.log(res.stdout);
await driver.destroy(ctx);
```

Note: Running the Docker example requires a Docker daemon and local dev tooling (pnpm, vitest) installed in the environment.
const ctx = await driver.provision();
const res = await driver.exec(ctx, 'echo', ['hello']);
console.log(res.stdout);
await driver.destroy(ctx);
```

Note: Running the example requires a Docker daemon and local dev tooling (pnpm, vitest) installed in the environment.

Fallback registry mechanism:

- The sandbox uses a three-tier image resolution strategy: primary registry → secondary mirror → local Docker cache. This is implemented by ImageResolver which reads the authoritative image-manifest.json (single source of truth) and attempts a fast HEAD check (≤5s timeout) against the primary and secondary registries before falling back to a locally cached image tag.
- To configure and use the resolver with the Docker driver:

```ts
import { ImageResolver } from './src/docker/ImageResolver';
const resolver = new ImageResolver({
  primaryRegistry: 'ghcr.io/devs-project/sandbox-base',
  secondaryRegistry: 'registry.hub.docker.com/devs-project/sandbox-base',
  localCacheTag: 'devs-sandbox-base:latest',
  imageManifestPath: new URL('./docker/base/image-manifest.json', import.meta.url),
});
const driver = new DockerDriver(dockerClient, { hostProjectPath: '/proj' }, resolver);
```

The resolution order is strict and not configurable at runtime to ensure fast failover behavior and predictable sourcing.

## Drivers

### WebContainerDriver

- Browser requirements: Requires cross-origin isolation (window.crossOriginIsolated === true). COOP + COEP headers must be served to enable WebContainers.
- Known limitations: WebContainers do not support native binaries or raw syscalls; they run Node.js/JavaScript and WebAssembly-based runtimes. Non-JS languages require a WASM wrapper or fallback to DockerDriver.
- Usage: Use isWebContainerSupported() to detect support in the current environment before creating a WebContainerDriver. Prefer using createSandboxProvider() which auto-selects WebContainerDriver when supported or falls back to DockerDriver.

#### Runtime Limitations

The WebContainerDriver supports NodeJS-related commands (node, npm, npx) but does not support native, POSIX-dependent runtimes such as Python (python3), Go, or Rust. When a requested runtime is unsupported, the driver will throw an UnsupportedRuntimeError with a human-readable reason; the recommended fallback is to use the DockerDriver for those workloads.



## Security

## Network Egress Proxy

### Proxy Audit Logging

ProxyAuditLogger supports three sink types: `console`, `file`, and `custom`.

- console: logs allowed entries at INFO and blocked at WARN to the console.
- file: opens an append-only WriteStream (flags: 'a'); entries are written as JSON lines and are also synchronously appended to disk to ensure durability for short-lived processes.
- custom: a user-provided sink function `(entry: AuditEntry) => void` is called synchronously for each entry.

AuditEntry schema:

- event: `egress_allowed` | `egress_blocked`
- host: string
- method: string
- timestampMs: number

Read egress metrics via `logger.getMetrics()` which returns `{ allowedCount, blockedCount }` for the lifetime of the logger.

## Network Egress Proxy

### Docker Network Isolation

Sandbox containers use an Internal Docker bridge network created per-sandbox. The orchestrator starts an EgressProxy on the host and containers are attached to the isolated bridge with DNS and HTTP_PROXY/HTTPS_PROXY environment variables pointing at the proxy. The network is created on sandbox start and removed on sandbox stop to avoid leftover bridges; the bridge is created with Docker's Internal: true setting so containers have no direct default route to the internet.


Purpose: Lightweight HTTP/HTTPS egress proxy skeleton used to enforce a default-deny egress policy from sandboxes.

Config shape (EgressProxyConfig):

- port: number — TCP port to bind to (0 = OS-assigned ephemeral port)
- allowList: string[] — FQDNs / CIDR blocks (populated in a later task)
- dnsResolver?: string — Optional upstream DNS resolver IP

Default-deny policy: By default the proxy denies all targets. CONNECT requests and plain HTTP requests return 403 (Forbidden) unless explicitly allowed via the allowList configuration. The allowList is configured via EgressProxyConfig.allowList and can be updated at runtime via proxy.updateAllowList([...]). Allow-list matching is an exact FQDN match (case-insensitive); there is no wildcard or sub-domain expansion by default.

Canonical default-allowed domains: registry.npmjs.org, pypi.org, github.com.



The DockerDriver enforces the following HostConfig runtime flags for all provisioned containers:

- CapDrop: ["ALL"] — drops all Linux capabilities to prevent privilege escalation.
- SecurityOpt: ["no-new-privileges:true"] — prevents processes from gaining new privileges via exec/setuid.
- PidsLimit: 128 — limits the number of PIDs in the container to mitigate fork-bomb style attacks.
- Memory: 4 * 1024 * 1024 * 1024 (4 GiB) — defaults to a memory limit for containers.
- NanoCPUs: 2 * 1e9 — defaults to 2 CPU cores (specified in NanoCPUs).
- NetworkMode: "none" — containers are network-isolated by default and must opt-in to egress.
- Privileged: false — privileged mode is explicitly disabled for all provisioned containers.
- Binds: <hostProjectPath>:/workspace:rw — workspace is mounted read-write while rootfs remains writable as configured.
- ReadonlyRootfs: false — the root filesystem is not globally set to read-only to allow workspace writes; workspace bind is rw.

These invariants are enforced by runtime validation in the DockerDriver implementation and should not be changed without a security review.

- **[2026-02-22 Reviewer] - Next steps:** If implementing DockerDriver now, ensure `dockerode` is added to `@devs/sandbox` deps, the default image uses a pinned tag/digest (no `latest`), and that all hardened flags `--cap-drop=ALL`, `--security-opt=no-new-privileges`, `--read-only`, `--network=none`, `--memory=4g`, `--cpus=2`, and `--rm` are present in run invocations. Also ensure `destroy()` is documented to be called in a `finally` block by callers; add AOD docs for new driver files.

## [2026-02-22] - WebContainerDriver added

- Architectural Decision: WebContainerDriver is the VSCode Web sandbox driver; it requires window.crossOriginIsolated === true (COOP + COEP). It supports Node.js/JavaScript workloads and WebAssembly only; native binaries/raw syscalls are unsupported — fallback to DockerDriver recommended.

- Brittle Areas: WebContainerDriver depends on browser cross-origin isolation headers and @webcontainer/api being available at runtime; tests that import @webcontainer/api must mock it to run in Node-based CI.

- Recent Changelog: Implemented WebContainerDriver with dynamic import guard for @webcontainer/api, createSandboxProvider auto-detection, unit tests with mocked API, and added optional peerDependency for @webcontainer/api.

## [2026-02-22] - Phase 2 Decisions (WebContainerDriver)

- Implemented: WebContainerDriver uses AbortSignal.timeout for exec timeouts (default 300000 ms).

- Created ADR: docs/decisions/phase_2_adr.md (ADR-WC-002).

- Created agent memo: .agent/phase_2_decisions.md.

- **[2026-02-22] - DockerDriver security hardening:** Enforced HostConfig security invariants in DockerDriver (CapDrop="ALL", SecurityOpt="no-new-privileges:true", Privileged=false, PidsLimit=128, Memory=4GiB, NanoCPUs=2*1e9, NetworkMode="none", Binds hostProjectPath:/workspace:rw, ReadonlyRootfs=false). Added verification script `packages/sandbox/scripts/verify-security-config.ts` and `verify:security` package script to assert invariants in CI. Runtime validation throws `SecurityConfigError` on deviation.

## Recent Changelog (Appended)

- **[2026-02-22] - Security verification script added:** Created `packages/sandbox/scripts/verify-security-config.ts` to validate DockerDriver HostConfig invariants and added a `verify:security` npm script in `packages/sandbox/package.json` to run it in CI.

## Docker Security Configuration

- --read-only: Enforces a read-only root filesystem to reduce attack surface and satisfy 5_SECURITY_DESIGN-REQ-SEC-SD-047.
- --tmpfs /tmp:rw,noexec,nosuid,nodev,size=256m: Provides a writable but non-executable temporary filesystem for processes; prevents execution from /tmp.
- --tmpfs /run:rw,noexec,nosuid,nodev,size=64m: Provides a small tmpfs for runtime sockets and transient files.
- Project workspace is mounted read-only at /workspace to avoid allowing container processes to write to the host project; .git and .devs are explicitly excluded from mounts.



# @devs/sandbox

Isolated execution abstraction for shell commands and file I/O.

## Build

pnpm --filter @devs/sandbox run build

## Test

pnpm --filter @devs/sandbox test

## Source tree

```
src/
├── index.ts           # Public barrel export
├── providers/         # SandboxProvider abstraction barrels
│   └── index.ts
├── drivers/           # Concrete driver implementations
│   └── index.ts
├── filesystem/        # FilesystemManager barrel
│   └── index.ts
├── network/           # Network egress components and policies
│   └── index.ts
├── types/             # Shared TypeScript types and interfaces
│   └── index.ts
└── utils/             # Internal utility functions
    └── index.ts
```

One-line descriptions:
- providers: Provider abstractions (SandboxProvider) used by consumers to inject implementations.
- drivers: Concrete drivers (process, container) that implement execution semantics.
- filesystem: FilesystemManager helpers and adapters.
- network: Network egress components and policies.
- types: Shared interfaces like SandboxExecResult and SandboxProvisionOptions.
- utils: Internal helpers not exported to consumers.

## .agent

Agent-Oriented Documentation (AOD) lives in `packages/sandbox/.agent` and provides module context, architectural decisions, hard constraints, dependency mappings, and a progress tracker for the package.

Files and purpose:
- `CONTEXT.md` — module purpose, phase context, public surface, integration points.
- `DECISIONS.md` — numbered, immutable architectural decisions.
- `CONSTRAINTS.md` — hard constraints that must be followed.
- `DEPENDENCIES.md` — upstream/downstream and driver-level external deps.
- `PROGRESS.md` — task progress tracker for the sub-epic.

AI agents should update these files as part of the TDD loop when implementing tasks in this package.

## Base Image

The sandbox base image is an immutable, minimal Alpine-based image pinned to an exact SHA-256 digest. It is built from alpine:3.19.1@sha256:1111111111111111111111111111111111111111111111111111111111111111 and runs a non-root user `agent` (UID 1001).

Rebuild:

pnpm --filter @devs/sandbox run build:base-image

Verify digest matches Dockerfile:

node -e "const m = require('./docker/base/image-manifest.json'); const fs = require('fs'); const df = fs.readFileSync('./docker/base/Dockerfile','utf8'); if(!df.includes(m.digest)) process.exit(1);"

## Testing

This package organizes tests into three tiers:

- unit: fast unit tests mirroring src/ submodules (tests/unit/)
- integration: integration tests for drivers and external interactions (tests/integration/)
- agent: agent-driven end-to-end behavioural tests (tests/agent/)

Run individual tiers:
- pnpm --filter @devs/sandbox test --project unit
- pnpm --filter @devs/sandbox test --project integration
- pnpm --filter @devs/sandbox test --project agent
- pnpm --filter @devs/sandbox validate-all [--skip-integration]  # runs lint, typecheck, build, and unit tests (integration only when DEVS_INTEGRATION_TESTS=1)

Run coverage:
- pnpm --filter @devs/sandbox test:coverage

Coverage targets: lines >= 80%

## Scripts

- pnpm --filter @devs/sandbox run bootstrap-sandbox [docker|webcontainer] — run preflight bootstrap checks for the sandbox; defaults to "docker".
- On success: prints "Bootstrap OK (<driver>) in <duration>ms" and exits with code 0.
- On failure: prints "Bootstrap FAILED: <message>" and exits with code 1.
- Environment prerequisites: Docker daemon running for the "docker" driver; Node.js >= 22 for the "webcontainer" driver.

## WebContainer Compatibility

This package depends on @webcontainer/api ^1.3.0 for local WebContainer spikes and experiments. Run the spike runner at `packages/sandbox/src/drivers/webcontainer/spike-runner.ts` to generate concrete probe outputs and place them in `spike-results/`.

## DockerDriver usage

Example:

```ts
import { DockerDriver } from './src/docker/DockerDriver';
// `docker` should be an injected Docker client (e.g., dockerode instance) available in the environment
const docker = /* docker client */;
const driver = new DockerDriver(docker, { hostProjectPath: '/absolute/path/to/project' });
const ctx = await driver.provision();
const res = await driver.exec(ctx, 'echo', ['hello']);
console.log(res.stdout);
await driver.destroy(ctx);
```

## Drivers

The sandbox package provides driver implementations for different sandbox runtimes. Example usage with WebContainerDriver:

```ts
import { WebContainerDriver } from '@devs/sandbox';

const driver = new WebContainerDriver();
const ctx = await driver.provision();
const res = await driver.exec(ctx, 'echo', ['hello']);
console.log(res.stdout);
await driver.destroy(ctx);
```

Note: Running the Docker example requires a Docker daemon and local dev tooling (pnpm, vitest) installed in the environment.
const ctx = await driver.provision();
const res = await driver.exec(ctx, 'echo', ['hello']);
console.log(res.stdout);
await driver.destroy(ctx);
```

Note: Running the example requires a Docker daemon and local dev tooling (pnpm, vitest) installed in the environment.

Fallback registry mechanism:

- The sandbox uses a three-tier image resolution strategy: primary registry → secondary mirror → local Docker cache. This is implemented by ImageResolver which reads the authoritative image-manifest.json (single source of truth) and attempts a fast HEAD check (≤5s timeout) against the primary and secondary registries before falling back to a locally cached image tag.
- To configure and use the resolver with the Docker driver:

```ts
import { ImageResolver } from './src/docker/ImageResolver';
const resolver = new ImageResolver({
  primaryRegistry: 'ghcr.io/devs-project/sandbox-base',
  secondaryRegistry: 'registry.hub.docker.com/devs-project/sandbox-base',
  localCacheTag: 'devs-sandbox-base:latest',
  imageManifestPath: new URL('./docker/base/image-manifest.json', import.meta.url),
});
const driver = new DockerDriver(dockerClient, { hostProjectPath: '/proj' }, resolver);
```

The resolution order is strict and not configurable at runtime to ensure fast failover behavior and predictable sourcing.

## Drivers

### WebContainerDriver

- Browser requirements: Requires cross-origin isolation (window.crossOriginIsolated === true). COOP + COEP headers must be served to enable WebContainers.
- Known limitations: WebContainers do not support native binaries or raw syscalls; they run Node.js/JavaScript and WebAssembly-based runtimes. Non-JS languages require a WASM wrapper or fallback to DockerDriver.
- Usage: Use isWebContainerSupported() to detect support in the current environment before creating a WebContainerDriver. Prefer using createSandboxProvider() which auto-selects WebContainerDriver when supported or falls back to DockerDriver.


## Security

The DockerDriver enforces the following HostConfig runtime flags for all provisioned containers:

- CapDrop: ["ALL"] — drops all Linux capabilities to prevent privilege escalation.
- SecurityOpt: ["no-new-privileges:true"] — prevents processes from gaining new privileges via exec/setuid.
- PidsLimit: 128 — limits the number of PIDs in the container to mitigate fork-bomb style attacks.
- Memory: 4 * 1024 * 1024 * 1024 (4 GiB) — defaults to a memory limit for containers.
- NanoCPUs: 2 * 1e9 — defaults to 2 CPU cores (specified in NanoCPUs).
- NetworkMode: "none" — containers are network-isolated by default and must opt-in to egress.
- Privileged: false — privileged mode is explicitly disabled for all provisioned containers.
- Binds: <hostProjectPath>:/workspace:rw — workspace is mounted read-write while rootfs remains writable as configured.
- ReadonlyRootfs: false — the root filesystem is not globally set to read-only to allow workspace writes; workspace bind is rw.

These invariants are enforced by runtime validation in the DockerDriver implementation and should not be changed without a security review.

- **[2026-02-22 Reviewer] - Next steps:** If implementing DockerDriver now, ensure `dockerode` is added to `@devs/sandbox` deps, the default image uses a pinned tag/digest (no `latest`), and that all hardened flags `--cap-drop=ALL`, `--security-opt=no-new-privileges`, `--read-only`, `--network=none`, `--memory=4g`, `--cpus=2`, and `--rm` are present in run invocations. Also ensure `destroy()` is documented to be called in a `finally` block by callers; add AOD docs for new driver files.

## [2026-02-22] - WebContainerDriver added

- Architectural Decision: WebContainerDriver is the VSCode Web sandbox driver; it requires window.crossOriginIsolated === true (COOP + COEP). It supports Node.js/JavaScript workloads and WebAssembly only; native binaries/raw syscalls are unsupported — fallback to DockerDriver recommended.

- Brittle Areas: WebContainerDriver depends on browser cross-origin isolation headers and @webcontainer/api being available at runtime; tests that import @webcontainer/api must mock it to run in Node-based CI.

- Recent Changelog: Implemented WebContainerDriver with dynamic import guard for @webcontainer/api, createSandboxProvider auto-detection, unit tests with mocked API, and added optional peerDependency for @webcontainer/api.

## [2026-02-22] - Phase 2 Decisions (WebContainerDriver)

- Implemented: WebContainerDriver uses AbortSignal.timeout for exec timeouts (default 300000 ms).

- Created ADR: docs/decisions/phase_2_adr.md (ADR-WC-002).

- Created agent memo: .agent/phase_2_decisions.md.

- **[2026-02-22] - DockerDriver security hardening:** Enforced HostConfig security invariants in DockerDriver (CapDrop="ALL", SecurityOpt="no-new-privileges:true", Privileged=false, PidsLimit=128, Memory=4GiB, NanoCPUs=2*1e9, NetworkMode="none", Binds hostProjectPath:/workspace:rw, ReadonlyRootfs=false). Added verification script `packages/sandbox/scripts/verify-security-config.ts` and `verify:security` package script to assert invariants in CI. Runtime validation throws `SecurityConfigError` on deviation.

## Recent Changelog (Appended)

- **[2026-02-22] - Security verification script added:** Created `packages/sandbox/scripts/verify-security-config.ts` to validate DockerDriver HostConfig invariants and added a `verify:security` npm script in `packages/sandbox/package.json` to run it in CI.

## Timeouts

This package enforces a per-tool-call execution timeout via src/utils/execution-timeout.ts. DEFAULT_TOOL_CALL_TIMEOUT_MS defaults to 300_000 (300 seconds / 5 minutes). Drivers (DockerDriver, WebContainerDriver) wrap long-running execs with withExecutionTimeout(fn, opts?.timeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS); callers can override the per-call timeout by passing { timeoutMs } in ExecOptions.

## TempDirManager

TempDirManager provides a small, secure API for creating and managing per-session temporary directories used by sandboxed agents.

- create(prefix): Creates a directory under os.tmpdir() named `devs-<prefix>-<uuid>` and ensures the directory has exactly 0o700 permissions (owner rwx only). The prefix must match the regex `/^[a-zA-Z0-9_-]+$/`; invalid prefixes throw `Error("invalid prefix: ...")` to guard against path-traversal.
- purge(dir): Recursively removes the directory and its contents. This operation is idempotent (uses `force: true`).
- purgeAll(): Purges all directories created during the current process; if any purges fail an `AggregateError` is thrown summarizing failures.
- Automatic exit cleanup: A best-effort synchronous cleanup runs on process exit using `fs.rmSync(..., { recursive: true, force: true })` to remove tracked temp directories.



## Running E2E Network Tests

These E2E network tests are gated and do not run during normal unit test execution.

- Enable the E2E test suite: E2E=true pnpm --filter @devs/sandbox test:e2e
- Run only the network-focused E2E suite: E2E=true pnpm --filter @devs/sandbox test:e2e:network
- Docker sub-tests (optional) are gated by: DOCKER_INTEGRATION=true
- WebContainer sub-tests (optional) are gated by: WEBCONTAINER_INTEGRATION=true

The E2E tests start an in-process EgressProxy, an IsolatedDnsResolver stub, and a ProxyAuditLogger (sinkType: console). The acceptance criteria assert allowed vs blocked CONNECT responses and that audit metrics reflect the decisions.
