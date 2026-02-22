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

_Last updated: 2026-02-22T21:53:46Z_
