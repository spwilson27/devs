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
