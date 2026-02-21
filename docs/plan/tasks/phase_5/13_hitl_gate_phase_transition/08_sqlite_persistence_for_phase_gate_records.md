# Task: Implement SQLite Persistence for PhaseGate Records (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [1_PRD-REQ-UI-001], [1_PRD-REQ-HITL-001], [9_ROADMAP-REQ-001], [9_ROADMAP-DOD-P3]

## 1. Initial Test Written
- [ ] In `packages/core/src/phase-gate/__tests__/sqlite-phase-gate.repository.test.ts`, write integration tests using an in-memory SQLite database (`:memory:`) that assert:
  - `SqlitePhaseGateRepository.create(record)` inserts a row and returns the inserted record with all fields populated.
  - `SqlitePhaseGateRepository.findById(id)` returns the correct record for a known ID.
  - `SqlitePhaseGateRepository.findById(unknownId)` returns `null`.
  - `SqlitePhaseGateRepository.findByPhaseId(phaseId)` returns the latest gate record for that phase.
  - `SqlitePhaseGateRepository.update(id, { state: PhaseGateState.APPROVED, approvedBy: 'user@example.com', approvedAt: new Date() })` updates only the specified fields and advances `updatedAt`.
  - `SqlitePhaseGateRepository.findAll()` returns records ordered by `createdAt` descending.
  - All date fields (`createdAt`, `updatedAt`, `approvedAt`) round-trip correctly as ISO 8601 strings in SQLite and are deserialized as `Date` objects in TypeScript.
  - `SqlitePhaseGateRepository.create()` throws `DuplicatePhaseGateError` if a record with the same `id` already exists.
- [ ] Verify that each test runs against a fresh in-memory database (no shared state between tests).

## 2. Task Implementation
- [ ] Add `better-sqlite3` and `@types/better-sqlite3` to `packages/core/package.json` if not already present.
- [ ] Create `packages/core/src/phase-gate/sqlite-phase-gate.repository.ts`:
  - Import `Database` from `better-sqlite3`.
  - Define private SQL schema constant `CREATE_TABLE_SQL` with the `phase_gates` DDL:
    ```sql
    CREATE TABLE IF NOT EXISTS phase_gates (
      id TEXT PRIMARY KEY,
      phase_id TEXT NOT NULL,
      state TEXT NOT NULL,
      report_ids TEXT NOT NULL,       -- JSON array
      confidence_scores TEXT NOT NULL, -- JSON object
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      approved_by TEXT,
      approved_at TEXT,
      rejection_reason TEXT
    )
    ```
  - Implement `SqlitePhaseGateRepository` satisfying `IPhaseGateRepository`:
    - Constructor accepts a `Database` instance and calls `db.exec(CREATE_TABLE_SQL)` to ensure the table exists.
    - `create(record)`: Serialize `reportIds` and `confidenceScores` to JSON strings; serialize all `Date` fields to ISO 8601 strings; use a prepared `INSERT` statement; return the deserialized record.
    - `findById(id)`: Use a prepared `SELECT` statement; deserialize JSON and date fields; return `null` if not found.
    - `findByPhaseId(phaseId)`: Use `ORDER BY created_at DESC LIMIT 1`.
    - `update(id, partial)`: Build a dynamic `UPDATE` statement from the provided partial object; update `updated_at` to current timestamp; return the full updated record via `findById`.
    - `findAll()`: Use `ORDER BY created_at DESC`.
  - Export `SqlitePhaseGateRepository`.
  - Export `DuplicatePhaseGateError` extending `Error` with `id` field.
- [ ] Update `packages/core/src/phase-gate/index.ts` to export `SqlitePhaseGateRepository` and `DuplicatePhaseGateError`.

## 3. Code Review
- [ ] Verify all SQL statements use prepared statements (no string interpolation that could allow SQL injection).
- [ ] Verify JSON serialization/deserialization is wrapped in try/catch blocks with descriptive error messages.
- [ ] Verify the `update()` method raises a `PhaseGateNotFoundError` if no row matched the given `id`.
- [ ] Verify the repository does not import from any non-core package.
- [ ] Verify `CREATE TABLE IF NOT EXISTS` is idempotent (safe to call on every constructor invocation).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="sqlite-phase-gate"` and confirm all tests pass.
- [ ] Confirm each test uses a fresh `:memory:` database instance (check for shared-state bugs by running tests in random order: `--randomize`).

## 5. Update Documentation
- [ ] Append to `packages/core/src/phase-gate/phase-gate.agent.md`:
  - Section: **SQLite Persistence** — document the `phase_gates` table schema, JSON-encoded columns, date serialization format, and the `SqlitePhaseGateRepository` class.
  - Note that `InMemoryPhaseGateRepository` remains the implementation used in unit tests and that `SqlitePhaseGateRepository` is wired in production.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:coverage -- --testPathPattern="sqlite-phase-gate"` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core test -- --randomize --testPathPattern="sqlite-phase-gate"` to verify no shared state between tests and assert exit code 0.
