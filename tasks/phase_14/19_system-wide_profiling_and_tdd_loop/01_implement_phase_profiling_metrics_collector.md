# Task: Implement Per-Phase Profiling Metrics Collector (Sub-Epic: 19_System-Wide Profiling and TDD Loop)

## Covered Requirements
- [1_PRD-REQ-NEED-DEVS-03]

## 1. Initial Test Written
- [ ] Create `src/profiling/__tests__/ProfilingService.test.ts`.
- [ ] Write a unit test `should record a phase start event` that calls `ProfilingService.startPhase('research')` and asserts an in-memory record is created with a `startTime` (ISO timestamp) and `phase` name.
- [ ] Write a unit test `should record a phase end event` that calls `ProfilingService.endPhase('research')` after `startPhase` and asserts the record now has an `endTime`, a computed `durationMs` (number > 0), and `tokenUsage: { prompt: 0, completion: 0, total: 0 }` as placeholder.
- [ ] Write a unit test `should accumulate token usage for a phase` that calls `ProfilingService.recordTokens('research', { prompt: 500, completion: 200 })` and asserts `tokenUsage.total === 700`.
- [ ] Write a unit test `should throw if endPhase is called before startPhase` to guard against misuse.
- [ ] Write an integration test `should persist phase metrics to SQLite` that instantiates `ProfilingService` with a real (in-memory) SQLite connection, runs a full start→recordTokens→end cycle, then queries the `phase_metrics` table directly and asserts one row exists with correct values.
- [ ] Ensure all tests are co-located in `src/profiling/__tests__/` and use the project's existing Vitest configuration.

## 2. Task Implementation
- [ ] Create `src/profiling/ProfilingService.ts`.
- [ ] Define and export a `PhaseMetric` interface: `{ phase: string; startTime: string; endTime?: string; durationMs?: number; tokenUsage: { prompt: number; completion: number; total: number } }`.
- [ ] Implement `ProfilingService` as a singleton class with:
  - `private metrics: Map<string, PhaseMetric>` for in-memory tracking.
  - `startPhase(phase: string): void` — records `startTime` as `new Date().toISOString()` and initialises `tokenUsage` to zeros.
  - `endPhase(phase: string): void` — computes `durationMs = Date.now() - Date.parse(startTime)`, sets `endTime`, persists to SQLite.
  - `recordTokens(phase: string, usage: { prompt: number; completion: number }): void` — accumulates on the existing `PhaseMetric`, guarding against missing start.
  - `getMetrics(): PhaseMetric[]` — returns all collected metrics as an array.
- [ ] Create the SQLite migration `migrations/013_phase_metrics.sql` which creates the table:
  ```sql
  CREATE TABLE IF NOT EXISTS phase_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_ms INTEGER,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    recorded_at TEXT DEFAULT (datetime('now'))
  );
  ```
- [ ] Wire `ProfilingService` to use the project's existing `DatabaseService` (dependency-injected in the constructor, not a global import) so tests can pass an in-memory instance.
- [ ] Export `ProfilingService` from `src/profiling/index.ts`.

## 3. Code Review
- [ ] Verify `ProfilingService` is injectable (constructor-based DI) — no singleton anti-pattern unless the project explicitly uses one via a DI container.
- [ ] Confirm `recordTokens` accumulates (does not overwrite) across multiple calls for the same phase.
- [ ] Confirm `endPhase` is idempotent — calling it twice should not create duplicate DB rows or corrupt `durationMs`.
- [ ] Verify the SQLite write uses a parameterised prepared statement (no string interpolation) to prevent SQL injection.
- [ ] Confirm the `PhaseMetric` type is exported and used consistently — no `any` types.
- [ ] Ensure there are no direct `process.env` reads inside `ProfilingService` (keep it pure and testable).

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/profiling/__tests__/ProfilingService.test.ts --reporter=verbose`.
- [ ] Assert exit code is `0` and all tests are marked `✓`.
- [ ] Run the full test suite `npx vitest run` to confirm no regressions.

## 5. Update Documentation
- [ ] Add a section `### ProfilingService` to `docs/architecture/profiling.md` (create the file if it does not exist) describing the class responsibility, the `PhaseMetric` shape, and the `phase_metrics` SQLite table schema.
- [ ] Update `docs/agent-memory/phase_14.md` with the note: `ProfilingService implemented; per-phase start/end/token recording persisted to phase_metrics table.`

## 6. Automated Verification
- [ ] Run `npx vitest run --coverage src/profiling` and assert line coverage ≥ 90% for `ProfilingService.ts`.
- [ ] Run `node -e "const db = require('better-sqlite3')(':memory:'); require('./migrations/013_phase_metrics.sql')" 2>&1 | grep -q "no such file" && echo FAIL || echo PASS` to verify the migration file exists.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0` (no type errors).
