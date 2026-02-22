# Agent Long-Term Memory

This file serves as a shared, long-term memory for all agents working on this project. Agents should append to this document to record important architectural decisions, recurring issues, project-wide conventions, and any other crucial context that future tasks will benefit from.

Keep the file clean and relevant. Remove outdated information. If the file gets too large (over 200 lines), summarize or move older information to a `memory_archive.md` file.

## 🏛️ Architectural Decisions

- **pnpm Monorepo Structure:** Established workspace with 7 packages under `packages/` (`core`, `agents`, `sandbox`, `memory`, `mcp`, `cli`, `vscode`). Node.js >= 22. `shamefully-hoist=false`. `@devs/core` is the logic hub and must NEVER depend on `@devs/sandbox`.
- **Headless-First & Task Runner:** UI shells (`cli`, `vscode`) are thin layers over `@devs/core`. `./do` (Python) is the unified task runner for build, test, and audit.
- **TypeScript Standard:** Strict TS 5.9.3 with `NodeNext` resolution. All relative imports MUST use `.js` extension. Packages extend root `tsconfig.json`.
- **AOD (Agent-Oriented Documentation):** Enforces a 1:1 ratio between source modules and `.agent.md` files in `.agent/packages/`. Verified by `aod_lint.py`.
- **Persistence Layer:** SQLite via `better-sqlite3` with WAL mode and `0o600` file hardening. `StateRepository` provides an ACID transaction API with SAVEPOINT support for nested operations.
- **Orchestration Engine:** LangGraph-based engine with cyclical nodes (`research`, `design`, `distill`, `implement`, `verify`). Uses `OrchestratorState` for full engine snapshots.
- **SAOP Protocol:** Standardized Agent-Oriented Protocol for turn envelopes and event streams. Glass-Box audit logs use JSON blobs for thoughts, actions, and observations.
- **Git Integration:** Atomic "Snapshot-at-Commit" strategy linking git hashes to task status. Structured commit footers (`TASK-ID:`, `devs-state-snapshot:`) enable machine-readable history.
- **IPC & IPC Events:** Unix Domain Socket-based EventBus for cross-process communication. TraceInterceptor provides real-time observational capture.
- **Security & Integrity:** Mandatory workspace integrity checks and object-store validation before snapshots. Redaction of sensitive data (keys, tokens) in all logs/errors.

## ⚠️ Brittle Areas (Proceed with Caution)

- **Import Extensions:** Forgetting `.js` in TypeScript imports breaks `NodeNext` resolution and `tsc --noEmit`.
- **Package List Sync:** Adding packages requires updating `pnpm-workspace.yaml`, `verify_monorepo.sh`, `verify_typescript_strict.sh`, and root `tsconfig.json`.
- **Empty Scaffolds:** Leaf directories in the scaffold (e.g., `mcp-server/src/tools`) MUST have a `.gitkeep` or they evaporate in git.
- **AOD Invariant:** Every new `.ts` module REQUIRES a `.agent.md` counterpart or CI fails.
- **Native Addons:** `better-sqlite3` and `esbuild` require `pnpm.onlyBuiltDependencies` in root `package.json` for pnpm v10. Vitest must use `pool: "forks"` for stability.

## Recent Changelog

- **Infrastructure & Monorepo (Phase 1):** Completed pnpm workspace setup, AOD system, and project scaffolding utility. Verified with 80+ presubmit checks.
- **Persistence Hardening (Phase 2-3):** Implemented hardened SQLite manager (0o600), ACID StateRepository with async transaction support, and SchemaReconciler for drift detection.
- **Orchestration Core (Phase 1, 4-5):** Built LangGraph engine with HITL approval gates (`approveDesign`, `approveTaskDag`), crash recovery engine, and deterministic resume.
- **Git & Snapshotting (Phase 1, 6):** Delivered `GitClient` wrapper, `SnapshotManager` with exclusion logic, and `GitAtomicManager` for cross-system atomicity.
- **Glass-Box Observability (Phase 7):** Migrated to JSON-blob log schema. Implemented `DecisionLogger` and `TraceInterceptor` for real-time capture.
- **[2026-02-22] - Added sqlite chaos test & recovery checkpoint:** Added a chaos test and patched persistence modules to run `PRAGMA wal_checkpoint(TRUNCATE)` on startup.

## [2026-02-22] - ProjectManager changes

- Implemented lifecycle control (pause/resume/status) in `packages/core/src/lifecycle/ProjectManager.ts` as a minimal file-backed implementation for runtime verification.
- Implemented `ProjectManager.init` to scaffold a project, create the Flight Recorder `.devs/state.sqlite`, initialize schema, and persist an initial project row with status `INITIALIZING`.

## ⚠️ Additional Notes

- **Presubmit toolchain fragility:** Presubmit previously assumed `tsc` and `vitest` present in the environment; missing tooling caused presubmit to fail unexpectedly. Consider documenting required dev tooling or vendor-install devDeps in CI images.
- **AOD coverage:** Add `.agent` AOD files for new source modules to satisfy the AOD 1:1 invariant.

