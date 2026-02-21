# Reviewer Memory

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
