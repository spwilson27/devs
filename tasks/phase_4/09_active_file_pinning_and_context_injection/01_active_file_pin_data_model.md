# Task: Define ActiveFilePin Data Model and Storage Layer (Sub-Epic: 09_Active_File_Pinning_and_Context_Injection)

## Covered Requirements
- [3_MCP-TAS-048]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/active-file-pin/__tests__/ActiveFilePinStore.test.ts`.
- [ ] Write a unit test verifying that `ActiveFilePinStore` can be instantiated and opens/creates the SQLite table `active_file_pins` with columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `absolute_path TEXT NOT NULL UNIQUE`, `pinned_at INTEGER NOT NULL` (Unix ms timestamp), `token_estimate INTEGER NOT NULL DEFAULT 0`.
- [ ] Write a test that `addPin(absolutePath, tokenEstimate)` inserts a row and returns the new `ActiveFilePin` record with all fields populated.
- [ ] Write a test that `addPin` throws `DuplicatePinError` if the same `absolute_path` is inserted twice.
- [ ] Write a test that `removePin(absolutePath)` deletes the row and returns `true`. Calling it again returns `false` (not found).
- [ ] Write a test that `listPins()` returns all pinned entries ordered by `pinned_at ASC` (oldest first).
- [ ] Write a test that `getPinCount()` returns the correct integer count.
- [ ] Write a test that `clearAllPins()` removes every row and `getPinCount()` subsequently returns 0.
- [ ] Ensure the test file uses `better-sqlite3` in-memory mode (`:memory:`) so there is no filesystem side-effect.

## 2. Task Implementation
- [ ] In `packages/memory/src/active-file-pin/`, create the following files:
  - `types.ts` — export the `ActiveFilePin` interface: `{ id: number; absolutePath: string; pinnedAt: number; tokenEstimate: number }` and the `DuplicatePinError` class extending `Error`.
  - `ActiveFilePinStore.ts` — class wrapping a `better-sqlite3` `Database` instance.
    - Constructor accepts `db: Database` (injected for testability).
    - `initialize()`: runs `CREATE TABLE IF NOT EXISTS active_file_pins (...)` with the schema described in the test section.
    - `addPin(absolutePath: string, tokenEstimate: number): ActiveFilePin` — uses `INSERT OR FAIL` statement and maps the result to `ActiveFilePin`.
    - `removePin(absolutePath: string): boolean` — DELETE by path, return `changes > 0`.
    - `listPins(): ActiveFilePin[]` — SELECT ordered by `pinned_at ASC`.
    - `getPinCount(): number` — `SELECT COUNT(*) ...`.
    - `clearAllPins(): void` — `DELETE FROM active_file_pins`.
  - `index.ts` — re-exports `ActiveFilePinStore`, `ActiveFilePin`, `DuplicatePinError`.
- [ ] Register this module in `packages/memory/package.json` exports under `./active-file-pin`.
- [ ] Run `pnpm install` (or equivalent) if a new dependency on `better-sqlite3` is needed.

## 3. Code Review
- [ ] Confirm zero raw SQL strings exist outside `ActiveFilePinStore.ts` — all queries must be prepared statements (`db.prepare(...)`).
- [ ] Confirm `DuplicatePinError` carries the duplicated `absolutePath` as a property, not just in the message string.
- [ ] Confirm the store is side-effect free at import time — the DB table is only created when `initialize()` is explicitly called.
- [ ] Confirm the module exports a clean public API from `index.ts`; no internal implementation details are re-exported.
- [ ] Verify TypeScript strict mode (`"strict": true`) produces zero errors: `pnpm tsc --noEmit`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="ActiveFilePinStore"` and confirm all tests pass with zero failures.
- [ ] Confirm test coverage for `ActiveFilePinStore.ts` is ≥ 90% lines/branches as reported by Jest's `--coverage` flag.

## 5. Update Documentation
- [ ] Create `packages/memory/src/active-file-pin/ActiveFilePinStore.agent.md` describing:
  - Purpose: persists the list of actively pinned files across turns.
  - Schema: column names, types, and constraints.
  - Public API: method signatures and return types.
  - Error types: `DuplicatePinError` and when it is thrown.
- [ ] Append an entry to `packages/memory/CHANGELOG.md` noting the new `active-file-pin` sub-module.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/memory test -- --testPathPattern="ActiveFilePinStore" --ci` in the CI environment.
- [ ] Confirm exit code is `0`.
- [ ] Run `pnpm tsc --noEmit` in `packages/memory` and confirm exit code is `0`.
- [ ] Validate that the `active_file_pins` table schema matches the expected definition by running the schema-check script: `node scripts/validate-schema.js active_file_pins`.
