# Agent Long-Term Memory (condensed)

This file captures the project's most important architectural decisions, recurring brittle areas, and a short changelog. It has been condensed to keep essential context easy to scan.

## Architectural Decisions
- Monorepo (pnpm workspace), Node >=22, TypeScript with NodeNext resolution and explicit `.js` runtime imports.
- Headless-first: @devs/core is the logic hub; CLI and other UIs are thin shells.
- Persistence: SQLite (better-sqlite3) with WAL; StateRepository provides ACID transactions and savepoints.
- Testing conventions: create isolated DBs per test (createDatabase + initializeSchema), use hoist-safe vi.mock factories, and prefer real timers for async sampling where needed.
- Agent-Oriented Documentation (AOD): 1:1 module → `.agent/*.agent.md` invariant enforced by AOD linter.

## Brittle Areas
- Missing `.js` extensions in imports (NodeNext resolver) and type/ambient mismatches.
- Native addons (better-sqlite3) and CI images require prebuilt binaries or proper toolchain.
- AOD coverage: missing agent docs trigger presubmit advisories.
- Filesystem write races: zero-byte DB artifacts on some filesystems — addressed with fsync + retry in RoadmapReconstructor.

## Recent Changelog (summary)
- Presubmit remediation: added tsconfig path mappings, vitest/node types, and ambient declarations to reduce TS failures.
- Runtime & exports: added runtime re-exports so tests importing .js entrypoints resolve cleanly.
- Persistence fixes: standardized createDatabase/initializeSchema usage and hardened reconstructor with buffered write + fsync + retries to avoid zero-byte `.devs/state.sqlite`.
- Tests: made vi.mock factories hoist-safe, removed async callbacks from setInterval sampling, and adjusted flaky tests to use short real-time intervals.
- Outcome: `./do presubmit` passes locally (2026-02-22).
- [2026-02-22 Reviewer] Implemented and verified network allowlist enforcement: added/validated AllowlistEngine and EgressProxy allowlist integration tests; created docs/security/network-egress-policy.md listing canonical allowed domains; all targeted tests passed.

- [2026-02-22 Reviewer] Implemented per-call execution timeout across sandbox drivers: added `packages/sandbox/src/utils/execution-timeout.ts` exporting `DEFAULT_TOOL_CALL_TIMEOUT_MS = 300_000`, `ExecutionTimeoutError`, and `withExecutionTimeout`; applied `withExecutionTimeout` in both `DockerDriver.exec()` and `WebContainerDriver.exec()` and ensured `DockerDriver.forceStop()` is called with the correct container id before re-throwing timeouts; added unit tests in `packages/sandbox/src/__tests__/execution-timeout.test.ts` and `packages/sandbox/src/__tests__/docker-driver-timeout.test.ts` to validate behavior and timer cleanup.

## Next steps
1. Add missing `.agent` AOD docs flagged by the linter.
2. Stabilize Docker integration tests and ensure CI images include prebuilt native dependencies or build tooling.
3. Finish remaining small todos tracked in session DB (see session todos table).


## Architectural Decisions (recent addition)
- 2026-02-22 - WebContainerPackageInstaller gates native npm packages before install; blocked packages are reported with a non-empty reason and an optional alternative to avoid network traffic and failed native compilation inside WebContainers.

## Brittle Areas (recent discovery)
- WebContainer verification and some package-level tests rely on prebuilt CommonJS artifacts in packages/sandbox/dist (e.g., TempDirManager.cjs). CI must run the build step or include shims for Node-run checks.

## Recent Changelog (append)
- [2026-02-22] Added packages/sandbox/dist/TempDirManager.cjs as a small CommonJS shim so CI tempdir checks run without a full build; verified WebContainerPackageInstaller implementation and its integration point on WebContainerDriver (installPackages).

- [2026-02-22 Reviewer] Reviewed WebContainerDriver tests and helpers: confirmed contract + e2e tests present and correct; helpers located at packages/sandbox/src/drivers/webcontainer/__tests__/helpers are test-only and not exported; drainStream correctly uses ReadableStreamDefaultReader and awaits read() to handle backpressure; boot-driver registers afterEach to call teardown ensuring teardown idempotency; no code fixes required. Presubmit: ./do presubmit passed locally (2026-02-22).

- 2026-02-22 - WebContainer egress controlled by patching globalThis.fetch; same AllowlistEngine logic applied; no TCP-level proxy available in WebContainer context.
- [2026-02-22 Reviewer] Implemented ProxyAuditLogger review: ensured file sink uses append-only WriteStream, structured JSON per-request contains only host, method, and timestamp (no full URLs), added TypeScript test fix, and verified EgressProxy wiring; Presubmit: ./do presubmit passed.

_Last updated: 2026-02-22T21:53:46Z_

## 2026-02-22 - Shim added for CI compatibility
- Architectural Decision: Added a minimal CommonJS shim at `packages/sandbox/dist/TempDirManager.cjs` so `scripts/ci-tempdir-tests.cjs` can run without requiring a full TypeScript build step or installed devDependencies.
- Brittle Area: CI tempdir checks depend on compiled artifacts in `packages/sandbox/dist`; environments without a build (or missing devDependencies) will fail unless shims or prebuilt artifacts are present.

## Recent Changelog (append)
- [2026-02-22 Reviewer] Created `packages/sandbox/dist/TempDirManager.cjs` shim to satisfy ci-tempdir-tests and enable presubmit checks in minimal environments without installing devDependencies.

_Last updated: 2026-02-22T22:19:08Z_

- [2026-02-22 Reviewer] Added CI workflow `.github/workflows/sandbox-e2e.yml` to run the network e2e suite (job: network-egress-e2e); verified E2E tests pass locally with `E2E=true` and Docker sub-tests are gated via `DOCKER_INTEGRATION=true`. This verifies end-to-end enforcement of the allow-list, DNS resolver stub behavior, and audit metrics collection.

- [2026-02-22 Reviewer] Minor test hardening: added JSDoc `@group e2e` tag to `packages/sandbox/src/network/__e2e__/egressPolicy.e2e.test.ts` and wrapped `afterAll` cleanup in a try/finally to ensure resources are released even when stop logic throws.

- [2026-02-22 Reviewer] Fixed preflight tests: aligned MockProvider to provider types (cpuPercent/memoryBytes, createdAt as ISO string) so TypeScript checks pass and preflight unit tests succeed.
- [2026-02-22 Reviewer] Minimal test refactor only; no runtime behavior changed in PreflightService.
