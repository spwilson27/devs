# Task: Implement ScaleTrace Archival Utility for agent_logs > 100MB (Sub-Epic: 12_Audit Logging and Traceability)

## Covered Requirements
- [TAS-071]

## 1. Initial Test Written

- [ ] Create test file `src/tracing/__tests__/ScaleTrace.test.ts` using Vitest.
- [ ] Write a unit test: `ScaleTrace.shouldArchive(sizeBytes: number): boolean` returns `true` when `sizeBytes > 100 * 1024 * 1024` and `false` otherwise. Verify with boundary values: exactly 100MB (false), 100MB+1 byte (true).
- [ ] Write a unit test: `ScaleTrace.archive(dbPath: string, outputDir: string): Promise<ArchiveResult>` — mock `fs.stat` to return a size of 150MB for the `agent_logs` table dump. Assert the function:
  - Calls `exportAgentLogsToBigJSON(dbPath)` to produce a raw JSON byte stream.
  - Pipes the stream through `zlib.createGzip()` and writes to `<outputDir>/agent_logs_<ISO8601_TIMESTAMP>.json.gz`.
  - Returns an `ArchiveResult` with `{ archivedFilePath: string, originalSizeBytes: number, compressedSizeBytes: number, rowsArchived: number }`.
- [ ] Write a unit test: After a successful archive, `ScaleTrace.purgeArchivedRows(db: Database, olderThanTimestamp: string): Promise<number>` deletes rows from `agent_logs` where `created_at < olderThanTimestamp` and returns the count of deleted rows. Mock the SQLite `Database` instance.
- [ ] Write an integration test using a real in-memory SQLite DB: insert 500 synthetic `agent_logs` rows, call `archive()` with a temp output dir, assert a `.json.gz` file is created, decompress it, and verify all 500 rows are present in the decompressed JSON array.
- [ ] Write a test that `ScaleTrace.run(dbPath, outputDir)` is a no-op (does not create any archive file) when the `agent_logs` table occupies less than 100MB. Use `fs.stat` mock returning 50MB.

## 2. Task Implementation

- [ ] Create `src/tracing/ScaleTrace.ts`. Export a class `ScaleTrace` with the following static methods:
  - `shouldArchive(sizeBytes: number): boolean` — returns `sizeBytes > 100 * 1024 * 1024`.
  - `getAgentLogsSize(dbPath: string): Promise<number>` — executes `PRAGMA page_count; PRAGMA page_size;` on `state.sqlite` scoped to the `agent_logs` table via `SELECT SUM(length(cast(row as text))) FROM agent_logs` or uses `sqlite3` page analysis. Returns approximate size in bytes.
  - `exportAgentLogsToStream(db: Database): Readable` — creates a readable stream of a JSON array of all `agent_logs` rows, streaming row-by-row to avoid loading all rows into memory.
  - `archive(dbPath: string, outputDir: string): Promise<ArchiveResult>` — checks size, streams rows to a Gzip-compressed file named `agent_logs_<ISO8601>.json.gz` in `outputDir`, returns `ArchiveResult`.
  - `purgeArchivedRows(db: Database, olderThanTimestamp: string): Promise<number>` — deletes rows from `agent_logs` where `created_at < olderThanTimestamp` within a SQLite transaction. Returns deleted row count.
  - `run(dbPath: string, outputDir: string): Promise<void>` — orchestrates: get size, if `shouldArchive`, call `archive`, call `purgeArchivedRows` with the cutoff timestamp from the archive result, log outcome via the project `Logger`.
- [ ] Add the `ArchiveResult` interface to `src/tracing/types.ts`:
  ```typescript
  export interface ArchiveResult {
    archivedFilePath: string;
    originalSizeBytes: number;
    compressedSizeBytes: number;
    rowsArchived: number;
    cutoffTimestamp: string;
  }
  ```
- [ ] Register `ScaleTrace.run()` as a scheduled job in `src/orchestrator/Orchestrator.ts`: after each phase completion, call `ScaleTrace.run(STATE_DB_PATH, ARCHIVE_DIR)` where `ARCHIVE_DIR` defaults to `.devs/archives/`.
- [ ] Use Node.js built-in `zlib` and `stream` modules only — no external compression libraries.
- [ ] Add `// [TAS-071]` inline comment above the `ScaleTrace` class declaration.

## 3. Code Review

- [ ] Verify that the export stream is truly streaming (no full in-memory array of rows): confirm `exportAgentLogsToStream` uses `sqlite3`'s `db.each()` or equivalent cursor, pushing rows one-by-one to a `Readable` stream.
- [ ] Confirm `purgeArchivedRows` wraps the `DELETE` in a SQLite transaction (`BEGIN IMMEDIATE / COMMIT`).
- [ ] Ensure the archive filename includes a UTC ISO 8601 timestamp to avoid collisions.
- [ ] Verify no sensitive data fields (e.g., raw prompt text that may contain secrets) are exported without redaction — confirm `agent_logs` schema. If `prompt_text` is present, assert it is excluded or redacted via the project's `TokenRedactor`.
- [ ] Check TypeScript strict mode compliance: no `any` types, all return types declared.
- [ ] Verify error handling: if the gzip stream fails mid-write, the partial `.gz` file is deleted and an error is thrown.

## 4. Run Automated Tests to Verify

- [ ] Run `npm run test -- src/tracing/__tests__/ScaleTrace.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `npm run test:integration -- ScaleTrace` and confirm the integration test producing the real `.json.gz` file passes.
- [ ] Run `npm run lint` and `npm run typecheck` — zero errors.

## 5. Update Documentation

- [ ] Create `src/tracing/ScaleTrace.agent.md` with:
  - Purpose: archives `agent_logs` rows exceeding 100MB to `.devs/archives/agent_logs_<ISO8601>.json.gz`.
  - When it runs: automatically after each phase completion via `Orchestrator`.
  - Key invariants: streaming export, atomic purge within a transaction, no full in-memory load.
  - Covered requirement: `[TAS-071]`.
- [ ] Update `docs/architecture/tracing.md` to document the archival lifecycle and the `ARCHIVE_DIR` configuration key.

## 6. Automated Verification

- [ ] Run `node scripts/validate-all.js --check ScaleTrace` — this script must assert:
  1. `src/tracing/ScaleTrace.ts` exists and exports a `ScaleTrace` class.
  2. `src/tracing/ScaleTrace.agent.md` exists (AOD density check).
  3. All test files in `src/tracing/__tests__/` pass via `vitest run`.
  4. The string `// [TAS-071]` appears in `src/tracing/ScaleTrace.ts`.
