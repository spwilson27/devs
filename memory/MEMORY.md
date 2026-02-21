# Reviewer Memory

## Task: Phase 1 / 06_git_integration/01_git_client_wrapper

**Status: PASSED — 1 fix applied. All 34 unit tests + all infra checks pass.**

### Review Notes

- Implementation agent did a high quality job. Core logic is correct and well-tested.
- `packages/core/src/git/GitClient.ts` — clean thin wrapper. Named imports for `simple-git` correctly used. `upath` normalization applied consistently. `GitError` wraps all failures with `cause`. Idempotent `initRepository` uses `checkIsRepo`. `commit` injects local user identity defaults if missing. No logic changes needed.
- `packages/core/src/git/GitClient.test.ts` — 34 tests, comprehensive coverage of all branches including error wrapping, user identity injection, and path normalization.
- AOD files (`.agent/packages/core/git/`) — complete, well-formed YAML front-matter, accurate module documentation.
- **Fix applied:** `vitest.config.ts` used `reporter: "verbose"` (singular, deprecated) instead of `reporters: ["verbose"]` (plural, array — the correct Vitest v4 API). Changed to `reporters`. Tests still pass in verbose mode.

### Key Discovery: `vitest.config.ts` is NOT type-checked

- Root `tsconfig.json` only includes `packages/**/*` and `src/**/*`.
- `vitest.config.ts` at the repo root is OUTSIDE these paths.
- TypeScript silently accepts any field name in `vitest.config.ts` — typos like `reporter` vs `reporters` are never caught by `tsc --noEmit`.
- Memory updated with this as a Brittle Area.

### Deferred Items (future phases)

- `packages/core/package.json` has `"main": "./src/index.ts"` but `git/GitClient.ts` is not yet re-exported from `index.ts`. A future phase must add exports to `packages/core/src/index.ts`.
- The `vitest.config.ts` file could be added to a separate `tsconfig.vitest.json` to enable type-checking for it — not required now but worth considering as the test suite grows.

---

## Task: Phase 1 / 05_define_shared_state_manifest

**Status: PASSED — no fixes required. All 59 presubmit checks pass.**

### Review Notes

- Implementation agent did a high quality job. No refactoring needed.
- `packages/core/src/constants.ts` — clean, well-documented, uses `as const` for type safety.
- `packages/core/src/persistence.ts` — correct ESM `.js` import extension; filesystem root sentinel `parent === current` is correct; error messages are actionable.
- `tests/infrastructure/verify_shared_state.sh` — 18 checks, consistent with existing scripts, uses `set -euo pipefail`.
- `docs/architecture/state_sharing.md` — thorough, includes mermaid diagram, maps requirements.
- Root `package.json` `devs` field correctly typed and formatted.

### Deferred Items (future phases)

- `packages/core/package.json` has `"main": "./src/index.ts"` but no `index.ts` exists yet. This is intentional for Phase 1 (no TypeScript compilation yet). A future phase must create `packages/core/src/index.ts` that re-exports from `constants.ts` and `persistence.ts`.
- The TypeScript subpath export pattern (`@devs/core/constants`) is not yet configured via `exports` in `package.json`. This is a future TypeScript configuration task.

---

## Task: Phase 2 / 02_sqlite_schema_persistence_layer / 01_initialize_persistence_layer

**Status: PASSED — no fixes required. All 95 presubmit checks pass (30 monorepo + 11 folder + 18 state + 27 ts-strict + 9 unit tests).**

### Review Notes

- Implementation agent produced excellent work end-to-end. No refactoring needed.
- `packages/core/src/persistence/database.ts` — factory + singleton pattern, well-documented JSDoc, correct `node:path` imports, `ensureDirSync(dirname(dbPath))` for dir creation, WAL + NORMAL PRAGMAs.
- `packages/core/test/persistence/database.test.ts` — 9 tests covering dir creation, file creation, connection, WAL pragma, synchronous pragma, SELECT 1, idempotent init, singleton identity, singleton reset. Tests are isolated (unique temp paths via `makeTestDbPath()`), properly cleaned up in `afterEach`.
- `scripts/verify_db_init.ts` — opens DB in `readonly: true` mode (correct — never modifies state). Uses `#!/usr/bin/env tsx` shebang.
- `vitest.config.ts` (root + packages/core) — both use `pool: "forks"` for native addon (better-sqlite3) compatibility.
- `package.json` changes — `pnpm.onlyBuiltDependencies` array correctly includes `better-sqlite3` and `esbuild`.
- `docs/architecture/state_sharing.md` — updated with DB connection manager docs, PRAGMA table, mermaid diagram extended.
- All ESM `.js` extensions used on relative imports; `node:` protocol used for built-ins.

### Key Decisions Made by Implementation Agent (confirmed correct)

- `DatabaseOptions.dbPath` override exists for tests (avoids project-root resolution in isolated temp dirs).
- Singleton `_instance` is properly closed before being nulled in `closeDatabase()`.
- `@types/fs-extra` and `@types/better-sqlite3` correctly added to `packages/core` devDependencies.
- `vitest` added to both root AND `packages/core` devDependencies (root for `./do test`; per-package for `pnpm test` within the package).

### Deferred Items (future phases)

- `packages/core/src/index.ts` remains a stub (`export {}`). The database module is consumed via its direct path (`persistence/database.js`). A future phase must add proper subpath exports via `exports` in `package.json`.
- `scripts/verify_db_init.ts` is a manual utility (requires the database to exist before running). It is not part of `./do presubmit` — intentional design choice to avoid a chicken-and-egg problem.

---

## Task: Phase 2 / 02_sqlite_schema_persistence_layer / 04_implement_state_repository

**Status: PASSED — 1 fix applied. All 147 unit tests + all infra checks pass.**

### Review Notes

- Implementation agent did a high quality job. Core logic is correct, ACID-compliant, and well-tested.
- `packages/core/src/persistence/state_repository.ts` — 14 prepared statements (8 write, 6 query) all now pre-compiled in constructor. Entity types well-documented with JSDoc. `upsertProject` correctly uses `ON CONFLICT(id) DO UPDATE SET` to preserve child rows. Bulk write methods all wrapped in `db.transaction()` for ACID rollback.
- `packages/core/test/persistence/state_repository.test.ts` — 36 tests covering all 9 public methods, default field values, FK constraint enforcement, ACID rollback for all 3 bulk methods, cascade delete, and full lifecycle.
- `scripts/db_stress_test.ts` — 11 checks: 1000 bulk requirement writes in single transaction, 1000 individual log appends, data integrity, WAL mode verified after 2000 operations.
- AOD at `.agent/packages/core/persistence/state_repository.agent.md` — accurate, complete, includes usage example.
- **Fix applied:** Query statements (`_stmtGetProject`, `_stmtGetRequirements`, `_stmtGetEpics`, `_stmtGetTasks`, `_stmtGetAgentLogs`, `_stmtGetTaskLogs`) were compiled inside `getProjectState()` and `getTaskLogs()` on every call. This was inconsistent with the class JSDoc claim ("Prepared statements are compiled once in the constructor and reused on every method call") and the established pattern for write statements. Moved all 6 query statements to the constructor as `private readonly` fields.

### Deferred Items (future phases)

- `packages/core/src/index.ts` does not yet re-export `StateRepository` or its entity types. A future phase should add these to the barrel so consumers can import from `@devs/core` directly.

---

## Task: Phase 3 / 03_acid_transactions_state_integrity / 02_acid_state_repository

**Status: PASSED — 1 fix applied. All 213 unit tests + all infra checks pass.**

### Review Notes

- Implementation agent did a high quality job. Core logic is correct, the ACID invariants are sound, and the tests are comprehensive.
- `packages/core/src/persistence/state_repository.ts` — `transaction<T>(cb)` delegates correctly to `db.transaction(cb)()`. Every write method (9 total, 8 previous + new `updateTaskStatus`) calls `this.transaction()` internally — no raw `stmt.run()` outside a transaction block. SAVEPOINT nesting semantics documented in both the file header and the class docblock.
- `packages/core/test/persistence/StateRepository.test.ts` — 26 tests: basic commit/rollback (6), nested savepoints (3), `updateTaskStatus` lifecycle + atomicity (6), all-method rollback coverage (9), isolation (2). Every test is tightly scoped and asserts database state directly via raw SQL, not via `getProjectState`.
- `docs/architecture/acid_transactions.md` — thorough ACID design guide: ACID properties table, WAL crash-recovery explanation, `transaction()` API, nested savepoint example with SQL annotations, no-raw-writes invariant table, parallel safety note, atomic task-start example.
- `scripts/simulate_crash_during_write.ts` — 4-phase simulation: baseline insert, child process crash mid-transaction, WAL recovery verification (row count + value + crash_value absence + journal_mode), StateRepository ACID equivalence. 10 checks total.
- `.agent/packages/core/persistence/state_repository.agent.md` — updated with full transaction API docs, savepoint nesting behaviour, and updated prepared-statement count (15 total: 9 write + 6 query).
- **Fix applied:** `execFileSync` was imported from `node:child_process` but never used in `scripts/simulate_crash_during_write.ts`. Only `spawnSync` is needed. Removed the dead import. (`noUnusedLocals` is not in `tsconfig.json` so TypeScript does not flag this — it slips through silently.)

### Key Discovery: `noUnusedLocals` is not enabled

- Root `tsconfig.json` has `strict: true` but does NOT enable `noUnusedLocals` or `noUnusedParameters`.
- Dead imports (like the removed `execFileSync`) will not be caught by `tsc --noEmit`.
- A future phase should consider adding `noUnusedLocals: true` and `noUnusedParameters: true` to the root `tsconfig.json` to catch these automatically. Not done now to avoid scope creep.

### Deferred Items (future phases)

- `packages/core/src/index.ts` does not yet export `updateTaskStatus` or `StateRepository` entity types. A future phase should add barrel exports so consumers can `import { StateRepository } from '@devs/core'` directly.
- `noUnusedLocals: true` would prevent future dead-import regressions. Consider adding when tightening TypeScript config.

---

## Task: Phase 3 / 03_acid_transactions_state_integrity / 04_git_atomic_manager

**Status: PASSED — implementation complete. All 328 unit tests + all infra checks pass.**

### Review Notes

- Implemented `GitAtomicManager` in `packages/core/src/orchestration/GitAtomicManager.ts`.
- Extended `StateRepository` with `transactionAsync<T>()` (SAVEPOINT-based async transaction primitive) and `updateTaskGitCommitHash()` (16th prepared statement).
- `commitTaskChange(taskId, commitMessage)` runs inside one SAVEPOINT: updateTaskStatus('completed') → await gitClient.commit() → updateTaskGitCommitHash(hash). SAVEPOINT rollback on any failure.
- 10 unit tests (6 mock-based + 4 integration with real SQLite). All pass.
- `scripts/simulate_git_failure.ts` (13 checks, 3 scenarios) verifies rollback invariant end-to-end.
- AOD at `.agent/packages/core/orchestration/GitAtomicManager.agent.md`.

### Key Design Decision: SAVEPOINT for async-SQLite bridging

- `db.exec('SAVEPOINT "name"')` is used instead of `db.exec('BEGIN')` to avoid conflicting with better-sqlite3's internal transaction tracking. `db.inTransaction` reads `sqlite3_get_autocommit()` which returns 0 for SAVEPOINT, so nested `db.transaction(cb)()` calls correctly detect the open transaction.
- Rolling back the outer SAVEPOINT undoes all inner changes including those from already-RELEASEd inner SAVEPOINTs — SQLite guarantees this. This is the critical property that ensures full atomicity across the async git boundary.
- Concurrency note: must NOT be called concurrently on same connection (documented in JSDoc).

---

## Task: Phase 1 / 06_git_integration_snapshot_strategy / 02_task_commit_logic

**Status: PASSED — 1 fix applied. All 259 unit tests + all infra checks pass.**

### Review Notes

- Implementation agent produced clean, well-structured work. No logic changes required.
- `packages/core/src/git/SnapshotManager.ts` — `SnapshotContext` interface and `createTaskSnapshot` method added correctly. `void context;` pattern is valid for reserving a parameter without unused-variable warnings. Clean / dirty branching logic is correct and matches TAS-054 spec.
- `packages/core/src/orchestration/ImplementationNode.ts` — factory pattern enables clean DI for tests. `initialize()` correctly called before `createTaskSnapshot()`. `readonly TaskRecord[]` type on `updatedTasks` is compatible with `GraphState["tasks"]`. No-op path returns `{}` (not `null`) — correct for LangGraph partial state.
- `packages/core/src/git/SnapshotManager.test.ts` — 23 tests (7 initialize + 4 takeSnapshot + 10 createTaskSnapshot + 2 getStatus). Mock pattern mirrors `GitClient.test.ts` consistently. Mock returns simple-git format (`isClean: () => boolean`) which is correctly processed by `GitClient.status()` before being consumed by `SnapshotManager`.
- `packages/core/src/orchestration/ImplementationNode.test.ts` — 11 tests. Full coverage of all branches: null activeTaskId, dirty workspace, clean workspace, ordering guarantee, error propagation.
- `packages/core/src/index.ts` — Both new exports present with correct `.js` extensions.
- AOD files — accurate, well-formed YAML front-matter.
- **Fix applied:** `ImplementationNode.agent.md` claimed "17 tests" but actual count is 11 (confirmed by vitest output and manual count of test file). Corrected to "11 tests". Also corrected the same count in `.agent/memory.md` changelog entry.

### Key Architecture Confirmed

- `createTaskSnapshot` returns `string | null` — `null` on clean workspace (not an error, a no-op signal). This is the correct semantic for the "Snapshot-at-Commit" strategy.
- `ImplementationNode` uses the factory pattern (`createImplementationNode(config)`) rather than a class — enables DI of `snapshotManager` without needing a test subclass.
- The `SnapshotContext` parameter is `context: SnapshotContext` (required, not optional) even though all its fields are optional. This is intentional — it forces the call site to pass an object, making future enrichment easier without a breaking API change.

### Deferred Items (future phases)

- `SnapshotContext.taskName` is currently unused in `createTaskSnapshot` — reserved for future commit trailer enrichment. The `void context;` expression suppresses unused-variable warnings.
- `ImplementationNode` only updates `TaskRecord.gitHash`. Future phases may want to also transition the task status (e.g., `in_progress → complete`) in the same node return.

---

## Task: Phase 2 / 02_sqlite_schema_persistence_layer / 03_define_interaction_schemas

**Status: PASSED — no fixes required. All presubmit checks pass (139 total: 105 infra + 34 unit tests).**

### Review Notes

- Implementation agent did a high quality job. No refactoring needed.
- `packages/core/src/schemas/turn_envelope.ts` — well-structured Zod v4 schema with clear section separation (enum → content → metadata → root). Proper `.js` import extension. Inline JSDoc is thorough and accurate.
- `packages/core/src/schemas/events.ts` — five event payload schemas correctly defined as discriminated union on `"type"`. `z.record(z.string(), z.unknown())` correctly uses two-arg form (Zod v4 requirement). `EventSchema` wraps payload with UUID-validated `event_id`.
- `packages/core/test/schemas/interaction.test.ts` — 34 tests; comprehensive coverage of valid and invalid inputs for all schemas. Rejection tests use destructuring to remove fields cleanly.
- `packages/core/src/index.ts` — barrel exports all schema symbols. Correct `.js` extensions throughout.
- `.agent/packages/core/schemas/` — AOD 1:1 ratio maintained: two `.agent.md` files for two production modules.
- `docs/architecture/saop_protocol.md` — thorough, includes mermaid sequence diagram, persistence mapping table, extensibility guide, and field rationale table.
- `vitest.config.ts` — minimal and correct; `include` glob matches test file layout.
- Root `package.json` has `vitest` as devDependency; `packages/core/package.json` has `zod` as production dependency.

### Deferred Items (future phases)

- `packages/core/package.json` still uses `"main": "./src/index.ts"` (TypeScript source, not compiled output). A future phase will configure the TypeScript compiler output and update `main`/`exports` to point to `./dist/index.js`.
- The `from_state`/`to_state` fields in `TaskTransitionPayloadSchema` are `z.string()`. A future phase should consider narrowing these to a `z.enum()` of known task lifecycle states once those states are formally defined in the TAS.
