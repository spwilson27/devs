# Task: Implement Persistent Decision Log in `.devs/state.sqlite` (Sub-Epic: 10_Report Generation Engine)

## Covered Requirements
- [1_PRD-REQ-MAP-002], [9_ROADMAP-REQ-MAP-002]

## 1. Initial Test Written
- [ ] Create `src/agents/research/reports/__tests__/decision_log_repository.test.ts`.
- [ ] Use an in-memory SQLite database (via `better-sqlite3` with `:memory:`) for all tests to avoid filesystem side-effects.
- [ ] Write unit tests asserting:
  - `DecisionLogRepository.initialize(db: Database)` creates a `decision_log` table with columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `phase TEXT NOT NULL`, `report_type TEXT NOT NULL`, `decision_key TEXT NOT NULL`, `decision_value TEXT NOT NULL`, `rationale TEXT`, `created_at TEXT NOT NULL`.
  - Calling `initialize()` twice on the same database is idempotent (no error thrown, table not duplicated).
  - `DecisionLogRepository.append(entry: DecisionLogEntry): void` inserts a row into `decision_log` with all required fields.
  - `DecisionLogRepository.getByPhase(phase: string): DecisionLogEntry[]` returns all entries for the given phase, ordered by `created_at` ascending.
  - `DecisionLogRepository.getByReportType(reportType: string): DecisionLogEntry[]` returns only entries matching `report_type`.
  - `DecisionLogRepository.getAll(): DecisionLogEntry[]` returns all entries ordered by `created_at` ascending.
  - Appending an entry with a missing required field (`phase`, `report_type`, `decision_key`, or `decision_value`) throws a `DecisionLogValidationError`.
  - `created_at` is automatically set to an ISO 8601 UTC timestamp if not provided.
- [ ] Write an integration test asserting that after `MarketReportGenerator.generate()` completes, querying `DecisionLogRepository.getByPhase('discovery')` returns at least one entry with `report_type === 'market'` and `decision_key === 'recommended_approach'`.

## 2. Task Implementation
- [ ] Install `better-sqlite3` and its TypeScript types:
  ```bash
  npm install better-sqlite3
  npm install --save-dev @types/better-sqlite3
  ```
- [ ] Create `src/state/decision_log_repository.ts`.
- [ ] Define and export `DecisionLogEntry` interface:
  ```typescript
  export interface DecisionLogEntry {
    id?: number;
    phase: string;
    reportType: string;
    decisionKey: string;
    decisionValue: string;
    rationale?: string;
    createdAt?: string; // ISO 8601 UTC
  }
  export class DecisionLogValidationError extends Error { ... }
  ```
- [ ] Implement `DecisionLogRepository` class:
  - Constructor accepts a `better-sqlite3` `Database` instance.
  - `initialize(): void` runs `CREATE TABLE IF NOT EXISTS decision_log (...)` using the schema defined above.
  - `append(entry: DecisionLogEntry): void`: validates required fields (throw `DecisionLogValidationError` if missing), sets `createdAt` to `new Date().toISOString()` if not provided, executes `INSERT INTO decision_log (...)`.
  - `getByPhase(phase: string): DecisionLogEntry[]`: executes `SELECT * FROM decision_log WHERE phase = ? ORDER BY created_at ASC`.
  - `getByReportType(reportType: string): DecisionLogEntry[]`: executes `SELECT * FROM decision_log WHERE report_type = ? ORDER BY created_at ASC`.
  - `getAll(): DecisionLogEntry[]`: executes `SELECT * FROM decision_log ORDER BY created_at ASC`.
- [ ] Create `src/state/database.ts` with a singleton `openDatabase(dbPath: string): Database` function that:
  - Opens (or creates) a `better-sqlite3` database at `dbPath`.
  - Enables WAL mode via `PRAGMA journal_mode=WAL`.
  - Calls `DecisionLogRepository.initialize()` on the opened database before returning.
  - Caches the open connection to avoid duplicate opens within a process.
- [ ] Update `BaseReportGenerator` to accept an optional `DecisionLogRepository` in its constructor. When provided, `generate()` must call `repository.append()` with a summary entry after each successful report generation (phase: `'discovery'`, reportType: the report's type, decisionKey: `'recommended_approach'`, decisionValue: the title of the recommended option or finding, rationale: first 200 chars of the report's overview or rationale field).
- [ ] Export `DecisionLogRepository`, `DecisionLogEntry`, `DecisionLogValidationError`, and `openDatabase` from `src/state/index.ts`.

## 3. Code Review
- [ ] Verify `CREATE TABLE IF NOT EXISTS` is used (not `CREATE TABLE`) so `initialize()` is idempotent.
- [ ] Verify all SQL statements use parameterized queries (`?` placeholders) — no string interpolation in SQL.
- [ ] Verify `openDatabase` enables WAL mode immediately after opening.
- [ ] Verify the singleton pattern in `openDatabase` uses a `Map<string, Database>` keyed by resolved `dbPath` (use `path.resolve()`).
- [ ] Verify `DecisionLogValidationError` lists which field(s) failed validation in its message.
- [ ] Verify `BaseReportGenerator` only calls `repository.append()` after a successful `generate()` — not on error paths.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="decision_log_repository"` and confirm all tests pass.
- [ ] Run `npm run type-check` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `docs/architecture/state_management.md` documenting the `.devs/state.sqlite` schema, the `decision_log` table columns, and the `DecisionLogRepository` API.
- [ ] Update `docs/agent_memory/phase_5_decisions.md` with: "Persistent decision log stored in `.devs/state.sqlite` (`decision_log` table, WAL mode). `DecisionLogRepository` uses `better-sqlite3`. All SQL uses parameterized queries. `BaseReportGenerator` appends a summary entry on successful generation."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="decision_log_repository" --passWithNoTests=false` and assert exit code is `0`.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
- [ ] Run a script that opens a real on-disk database at `/tmp/devs_test_state.sqlite`, calls `DecisionLogRepository.initialize()`, appends one entry, reads it back, asserts equality, then deletes the file. Assert script exits `0`.
