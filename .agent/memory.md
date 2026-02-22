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

## Next steps
1. Add missing `.agent` AOD docs flagged by the linter.
2. Stabilize Docker integration tests and ensure CI images include prebuilt native dependencies or build tooling.
3. Finish remaining small todos tracked in session DB (see session todos table).

_Last updated: 2026-02-22T19:33:02Z_
