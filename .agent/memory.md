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

- **[2026-02-22] - AOD doc fix:** Added missing AOD documentation `.agent/packages/core/orchestration/StateTransitionGuard.agent.md` to satisfy the AOD 1:1 ratio presubmit check and ensure CI passes.

- **Brittle area noted:** The AOD invariant (every new .ts module requires a corresponding `.agent.md`) caused the presubmit failure; maintainers should remember to add AOD files when adding source modules.

- **2026-02-22 - Roadmap Reconstruction (Phase 1/09):** Added initial integration test for roadmap reconstruction and a minimal RoadmapReconstructor stub in `@devs/core/persistence` that creates a placeholder `.devs/state.sqlite` and logs a `roadmap_reconstruct` event to `.devs/agent_logs.log`. This is intentionally minimal to allow TDD iteration in environments without native addons or dev tooling installed.


- **[2026-02-22 Reviewer] - Presubmit verification:** Executed `./do presubmit` in this worktree; all verification checks passed (Monorepo, Folder Structure, Shared State, AOD advisory). Noted the AOD advisory (RelationalRollback missing .agent) and confirmed no commits were made by the reviewer.

- **[2026-02-22 Reviewer] - Recommendation:** Add a short CONTRIBUTING.md checklist documenting the required local dev toolchain (tsc, vitest) and the AOD 1:1 invariant so future contributors don't accidentally omit `.agent.md` files.

- **[2026-02-22] - Rewind Review:** Performed a code review of `Orchestrator.rewind`, `GitClient.checkout`, and `RelationalRollback`. Confirmed the correct ordering: Git checkout (filesystem restore) is executed before any DB mutation, and relational rollback is performed inside a single ACID transaction. Ran `./do presubmit` — all presubmit checks passed (warnings only for AOD docs).

- **[2026-02-22] - Architectural Decision (Rewind):** Enforce Git-first rewinds: always perform `git checkout --force` and verify head hash before committing DB changes. Do NOT auto-delete untracked files by default; require an explicit `--clean`/`--force-clean` option to remove untracked files and document this behavior in the User Guide and CLI docs.

## ⚠️ New Brittle Areas Discovered

- **[2026-02-22] - Rewind: untracked-file policy:** The current implementation does not run `git clean -fd` and therefore preserves untracked files even when a forced checkout is performed. This can lead to workspace divergence between expected snapshot and actual files; recommend a clear policy and corresponding tests (and a user confirmation prompt) before enabling auto-clean.

- **[2026-02-22] - AOD coverage for Rewind modules:** `packages/core/src/Orchestrator.ts` and `packages/core/src/persistence/RelationalRollback.ts` should have corresponding AOD `.agent.md` files to satisfy the AOD 1:1 invariant and avoid CI warnings.

- **[2026-02-22 Reviewer] - Dirty Workspace Review:** Reviewed `packages/core/src/git/GitManager.ts` and `packages/core/src/orchestration/Orchestrator.ts`; confirmed `GitManager.isWorkspaceDirty()` inspects staged, modified, and untracked files via `simple-git` and filters `.devs/` and `.agent/`; `Orchestrator.startTask()` enforces dirty checks unless `force` is true or `stash` is provided, and throws `DirtyWorkspaceError` in headless mode. Ran integration test `tests/integration/dirty_workspace.test.ts` and `./do presubmit` locally; no code changes required.

## [2026-02-22] - Input Ingestor & LocalityGuard Added (Phase 1 Task 09-07)

- Implemented a minimal InputIngestor (packages/core/src/InputIngestor.ts) which accepts a project brief and user journeys and persists them into the Flight Recorder (`projects` + `documents`).
- Implemented a LocalityGuard middleware (packages/core/src/LocalityGuard.ts) that scans agent instances before/after a turn, persists ephemeral `findings`/`state` into `documents`, and clears those properties from the agent to enforce data locality.

## Architectural Decisions (Appended)

- Data Locality Enforcement: all agents must not retain ephemeral findings/state on their instance between turns; instead agents must return structured results and LocalityGuard will persist findings to the Flight Recorder. This is enforced by LocalityGuard but should be elevated to a project-wide TAS decision.

## Brittle Areas (Appended)

- AOD Invariant: Adding source modules requires corresponding `.agent.md` documentation under `.agent/packages/core/`; the presubmit runner only warns but CI may fail — remember to add these files when adding modules.
- LocalityGuard Persistence: Current LocalityGuard persists ephemeral data as `documents` with minimal metadata; for production use the persistence should use structured `agent_logs` with task-scoped FK and richer content types.

## Recent Changelog (Appended)

- **[2026-02-22] - Added InputIngestor & LocalityGuard:** Wrote tests and minimal implementations to satisfy Phase 1 determinism & robustness task: input ingestion and data-locality enforcement. Presubmit passed locally (unit tests were skipped in this environment).

- **[2026-02-22 Reviewer] - AOD docs added:** Created .agent AOD files for InputIngestor, LocalityGuard, Orchestrator, AuditTrailReconstructor, and RelationalRollback to satisfy AOD 1:1 invariant and silence presubmit advisory.

- **[2026-02-22 Reviewer] - Lifecycle enums/schema review:** Inspected `packages/core/src/types/lifecycle.ts` and confirmed exported ProjectStatus and ProjectPhase enums and the `validateTransition` helper; verified persistence columns `status`, `current_phase`, and `last_milestone` exist in `packages/core/src/persistence/schema.ts` and are used by `StateRepository` (`packages/core/src/persistence/state_repository.ts`). All tests for lifecycle enums exist at `packages/core/test/lifecycle/ProjectState.test.ts` and are consistent with the implementation.

- **[2026-02-22 Reviewer] - Brittle Areas Discovered:** AOD 1:1 advisory remains (some source modules lack corresponding `.agent.md` files); local `./do presubmit` may skip `tsc`/`vitest` when those tools are not installed in the ephemeral environment—CI must run the full toolchain to avoid masking issues.

- **[2026-02-22 Reviewer] - Recent Changelog:** Verified lifecycle enums, state schema, and persistence tests; executed `./do presubmit` and confirmed all presubmit checks passed locally (warnings only); no code changes were required.

- **[2026-02-22] - MilestoneService added:** Implemented `MilestoneService` in `@devs/core` (`packages/core/src/lifecycle/MilestoneService.ts`) with the centralized `MILESTONE_PHASE_MAP` mapping M1→[1,2], M2→[3,4,5], M3→[6,7,8] and accompanying unit tests at `packages/core/test/lifecycle/Milestones.test.ts`.

- **Architectural Decision:** Milestone progress is calculated from atomic tasks (the `tasks` table) rather than epic-level heuristics to ensure accurate, fine-grained progress metrics; milestone definitions are centralized to simplify roadmap updates.

- **[2026-02-22 Reviewer] - MilestoneService review:** Reviewed `packages/core/src/lifecycle/MilestoneService.ts` and `packages/core/test/lifecycle/Milestones.test.ts`; implementation matches roadmap requirements, uses centralized `MILESTONE_PHASE_MAP`, and calculates progress from atomic tasks; no code changes required.

- **Recommendation:** Add a corresponding AOD file `.agent/packages/core/lifecycle/MilestoneService.agent.md` and ensure CI images/install steps include `tsc` and `vitest` so unit tests are executed in presubmit environments.

