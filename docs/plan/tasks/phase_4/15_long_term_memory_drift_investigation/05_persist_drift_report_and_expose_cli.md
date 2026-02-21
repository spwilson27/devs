# Task: Persist Drift Report to SQLite and Expose CLI Command (Sub-Epic: 15_Long_Term_Memory_Drift_Investigation)

## Covered Requirements
- [9_ROADMAP-SPIKE-002]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/drift/__tests__/driftReportStore.spec.ts`.
- [ ] Mock `better-sqlite3` to use an in-memory database.
- [ ] Write a test asserting that `DriftReportStore.save(report: DriftReport)` inserts one row into the `drift_reports` table.
- [ ] Write a test asserting that `DriftReportStore.list(): DriftReport[]` returns all saved reports, ordered by `runAt DESC`.
- [ ] Write a test asserting that `DriftReportStore.getLatest(): DriftReport | null` returns the most recently saved report, or `null` if none exist.
- [ ] Create `packages/cli/src/commands/__tests__/driftInvestigate.spec.ts`.
- [ ] Write an integration test that stubs `DriftHarness.run()` and asserts the CLI command `devs memory drift-investigate --iterations 5 --query "test query"` exits with code 0 and prints a summary line containing `firstDegradationIteration`.

## 2. Task Implementation
- [ ] Create `packages/memory/src/drift/DriftReportStore.ts`:
  - Accept an injected `better-sqlite3` `Database` instance.
  - In the constructor, create the `drift_reports` table if it does not exist:
    ```sql
    CREATE TABLE IF NOT EXISTS drift_reports (
      id          TEXT PRIMARY KEY,
      run_at      TEXT NOT NULL,
      report_json TEXT NOT NULL
    );
    ```
  - `save(report: DriftReport): void` — generates a UUID for `id`, serializes `report` to JSON, inserts a row.
  - `list(): DriftReport[]` — selects all rows ordered by `run_at DESC`, deserializes `report_json`.
  - `getLatest(): DriftReport | null` — selects the first row ordered by `run_at DESC`.
- [ ] Export `DriftReportStore` from `packages/memory/src/drift/index.ts`.
- [ ] Create `packages/cli/src/commands/driftInvestigate.ts` registering a `memory drift-investigate` command with `commander`:
  - Options: `--iterations <number>` (default: 20), `--query <string>` (repeatable), `--noise-threshold <number>` (default: 0.35), `--noise-strategy <string>` (default: `gaussian`), `--synthetic-entries <number>` (default: 100), `--output <json|table>` (default: `table`).
  - Implementation:
    1. Resolve `.devs/memory.lancedb` relative to `process.cwd()`.
    2. Instantiate `DriftHarness` with resolved options.
    3. Call `harness.run()` and obtain a `DriftReport`.
    4. Persist the report using `DriftReportStore`.
    5. If `--output table`: print a human-readable summary table to stdout.
    6. If `--output json`: print `JSON.stringify(report, null, 2)` to stdout.
    7. Exit 0 on success; exit 1 if `firstDegradationIteration !== null` to signal degradation detected (useful for CI).
- [ ] Register the command in `packages/cli/src/index.ts`.

## 3. Code Review
- [ ] Verify `DriftReportStore` never opens its own database connection; it always receives the DB via constructor injection.
- [ ] Verify the CLI command validates that `--iterations` is a positive integer and `--noise-threshold` is in `[0, 1]`; if not, print a usage error and exit 2.
- [ ] Verify the exit-code semantics are documented in `devs memory drift-investigate --help` output via commander's `.description()`.
- [ ] Verify the table output uses `console.log` (not `process.stdout.write`) so it can be captured in tests.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=driftReportStore` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/cli test -- --testPathPattern=driftInvestigate` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a `## CLI: memory drift-investigate` section to `docs/cli.md` (or create it if absent) documenting all flags, exit codes, and example invocations.
- [ ] Add an entry in `packages/memory/README.md` under `## Drift Investigation Harness` describing the `DriftReportStore` and the SQLite persistence schema.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=driftReportStore` and confirm coverage ≥ 85% for `DriftReportStore.ts`.
- [ ] Run `pnpm --filter @devs/cli test --coverage -- --testPathPattern=driftInvestigate` and confirm coverage ≥ 80%.
- [ ] Run `pnpm --filter @devs/cli tsc --noEmit && pnpm --filter @devs/memory tsc --noEmit` and confirm zero errors.
