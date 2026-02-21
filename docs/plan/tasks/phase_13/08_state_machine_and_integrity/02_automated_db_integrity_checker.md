# Task: Implement Automated SQLite and LanceDB Integrity Checker with Auto-Repair (Sub-Epic: 08_State Machine and Integrity)

## Covered Requirements
- [4_USER_FEATURES-REQ-071]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/integrity/__tests__/integrity-checker.test.ts`, write tests covering:
  - `IntegrityChecker.checkSQLite()`:
    - Returns `{ healthy: true }` when the database passes `PRAGMA integrity_check`.
    - Returns `{ healthy: false, errors: string[] }` with descriptive messages when `PRAGMA integrity_check` returns errors.
    - Returns `{ healthy: false, errors: ['DATABASE_FILE_MISSING'] }` when the SQLite file path does not exist.
  - `IntegrityChecker.checkLanceDB()`:
    - Returns `{ healthy: true }` when all expected LanceDB table manifests are present and parseable.
    - Returns `{ healthy: false, errors: ['TABLE_MANIFEST_CORRUPT: embeddings'] }` when the manifest JSON is malformed.
    - Returns `{ healthy: false, errors: ['TABLE_MISSING: embeddings'] }` when a required table directory is absent.
  - `IntegrityChecker.runAll()`:
    - Returns a combined `IntegrityReport` aggregating results from both checks.
    - Emits an `IntegrityCheckCompleted` event with the full report after every run.
  - `AutoRepairService.repairSQLite()`:
    - When `IntegrityChecker.checkSQLite()` returns unhealthy: emits `AutoRepairRequired` event with a user-facing prompt string; does NOT automatically alter data.
    - When `IntegrityChecker.checkSQLite()` returns `DATABASE_FILE_MISSING`: calls `DatabaseService.initialize()` to create a fresh database, then returns `{ repaired: true }`.
  - Background scheduling: assert that `IntegrityScheduler` calls `IntegrityChecker.runAll()` at the configured interval (default 60 seconds); use Jest fake timers.

## 2. Task Implementation
- [ ] Create `packages/devs-core/src/integrity/integrity-checker.ts`:
  - `IntegrityChecker` class with injected `DatabaseService` and `LanceDBService` dependencies.
  - `checkSQLite(): Promise<CheckResult>`: executes `PRAGMA integrity_check` via `DatabaseService.raw()` and parses results.
  - `checkLanceDB(): Promise<CheckResult>`: reads the LanceDB table directory (path from config), verifies that each required table's `_latest_manifest.json` exists and is valid JSON.
  - `runAll(): Promise<IntegrityReport>`: calls both checks, merges results, emits `IntegrityCheckCompleted` via `EventEmitter2`.
- [ ] Create `packages/devs-core/src/integrity/auto-repair-service.ts`:
  - `AutoRepairService` class with `repairSQLite(report: CheckResult): Promise<RepairResult>`.
  - If error is `DATABASE_FILE_MISSING`: calls `DatabaseService.initialize()` and returns `{ repaired: true, action: 'RECREATED_DATABASE' }`.
  - For all other SQLite errors: emits `AutoRepairRequired` event with payload `{ message: string, repairOptions: ['RESTORE_FROM_BACKUP' | 'MANUAL_INTERVENTION'] }` and returns `{ repaired: false, promptShown: true }`.
  - LanceDB repair: emits `AutoRepairRequired` with options `['REBUILD_INDEX' | 'PRUNE_CORRUPT_ENTRIES']`; does not auto-mutate vector data.
- [ ] Create `packages/devs-core/src/integrity/integrity-scheduler.ts`:
  - `IntegrityScheduler` class that uses `setInterval` (configurable via `INTEGRITY_CHECK_INTERVAL_MS` env var, default `60000`) to call `IntegrityChecker.runAll()`.
  - Exposes `start()` and `stop()` methods; the interval is cleared on `stop()`.
- [ ] Export all from `packages/devs-core/src/integrity/index.ts`.
- [ ] Register `IntegrityChecker`, `AutoRepairService`, and `IntegrityScheduler` in the DI container; start the scheduler on application bootstrap in `packages/devs-core/src/bootstrap.ts`.

## 3. Code Review
- [ ] Verify `PRAGMA integrity_check` result parsing handles both the `"ok"` single-row response and multi-row error responses correctly.
- [ ] Confirm `AutoRepairService` never deletes or overwrites user data without emitting an `AutoRepairRequired` event first (the event is the prompt mechanism).
- [ ] Ensure `IntegrityScheduler.stop()` is called in the application teardown hook to prevent dangling intervals in tests.
- [ ] Confirm `LanceDBService` path resolution is read from the project config singleton, not hardcoded.
- [ ] Verify `IntegrityReport` type has a `timestamp: Date`, `sqliteResult: CheckResult`, and `lancedbResult: CheckResult` field for full traceability.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter devs-core test -- --testPathPattern="integrity"` and confirm all tests pass.
- [ ] Run `pnpm --filter devs-core test -- --coverage --testPathPattern="integrity"` and confirm ≥ 90% line/branch coverage for the `integrity/` directory.

## 5. Update Documentation
- [ ] Create `packages/devs-core/src/integrity/integrity-checker.agent.md` documenting:
  - What checks are performed (SQLite PRAGMA, LanceDB manifest validation).
  - The auto-repair decision tree (file missing → recreate; corruption → prompt user).
  - The background scheduler interval and how to configure it.
  - The events emitted (`IntegrityCheckCompleted`, `AutoRepairRequired`) and their payload shapes.
- [ ] Update `docs/user-guide/reliability.md` with a section "Automated State Integrity Checks" explaining what users see when corruption is detected and what options they have.

## 6. Automated Verification
- [ ] Run `pnpm --filter devs-core test:ci` and assert exit code is `0`.
- [ ] Run the following smoke test script `scripts/smoke-integrity.sh`:
  ```bash
  #!/usr/bin/env bash
  set -e
  node -e "
    const { IntegrityChecker } = require('./packages/devs-core/dist');
    const checker = new IntegrityChecker();
    checker.checkSQLite().then(r => { if (r.healthy !== true && r.healthy !== false) process.exit(1); });
  "
  echo "PASS: IntegrityChecker smoke test"
  ```
  Assert exit code is `0`.
