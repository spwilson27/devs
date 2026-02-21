# Task: Implement Sandbox Violation Alerts — Log Blocked Egress as Security Events (Sub-Epic: 08_Network Egress and Sandbox Isolation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-063], [9_ROADMAP-REQ-020]

## 1. Initial Test Written
- [ ] Create `src/sandbox/proxy/__tests__/violationLogger.test.ts`.
- [ ] Write a unit test for `ViolationLogger.record(event: BlockedEvent)` that inserts a row into the SQLite `security_alerts` table and asserts the row is retrievable via `ViolationLogger.getAll()`.
- [ ] Write a unit test that asserts `ViolationLogger.record()` persists `{ domain, method, url, timestamp, sandboxId }` and that `timestamp` is an ISO-8601 string.
- [ ] Write a unit test for `ViolationLogger.getRecent(n)` that returns at most `n` most recent alerts ordered by `timestamp DESC`.
- [ ] Write a unit test that verifies calling `ViolationLogger.record()` with a blocked event fires the `SecurityAlertTable.push(alert)` hook (use a Jest mock for `SecurityAlertTable`), so the dashboard is notified in real time.
- [ ] Write an integration test that wires a live `EgressProxy` to a `ViolationLogger` via the `onBlocked` callback, sends a blocked request, and then asserts `ViolationLogger.getAll()` returns exactly one entry for that domain.
- [ ] All tests must FAIL before implementation.

## 2. Task Implementation
- [ ] Create `src/sandbox/proxy/violationLogger.ts` exporting `ViolationLogger` class:
  - Constructor accepts `db: Database` (better-sqlite3 instance) and optional `onAlert?: (alert: SecurityAlert) => void`.
  - `record(event: BlockedEvent & { sandboxId: string }): void` — writes to `security_alerts` table synchronously (better-sqlite3 is synchronous; this is intentional for atomicity).
  - `getAll(): SecurityAlert[]`
  - `getRecent(n: number): SecurityAlert[]`
- [ ] Create the `security_alerts` table migration in `src/db/migrations/`:
  ```sql
  CREATE TABLE IF NOT EXISTS security_alerts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sandbox_id TEXT    NOT NULL,
    domain     TEXT    NOT NULL,
    method     TEXT    NOT NULL,
    url        TEXT    NOT NULL,
    timestamp  TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON security_alerts(timestamp DESC);
  ```
- [ ] Create `src/ui/components/SecurityAlertTable.ts` (or extend existing) that:
  - Exposes a `push(alert: SecurityAlert): void` method used by `ViolationLogger` to emit real-time alerts to the VSCode Webview via `postMessage`.
  - Serialises `SecurityAlert` to the Webview message format `{ type: 'SECURITY_ALERT', payload: SecurityAlert }`.
- [ ] Wire `ViolationLogger` into `SandboxLauncher.spawnWithProxy` by passing `violationLogger.record` as the `onBlocked` callback to `EgressProxy`, populating `sandboxId` from the active task ID.
- [ ] Export `SecurityAlert { id: number; sandboxId: string; domain: string; method: string; url: string; timestamp: string; createdAt: string }` from `src/sandbox/proxy/types.ts`.
- [ ] Annotate with `// [5_SECURITY_DESIGN-REQ-SEC-SD-063] [9_ROADMAP-REQ-020]`.

## 3. Code Review
- [ ] Verify `ViolationLogger.record()` never throws — all DB errors must be caught and logged to stderr without crashing the proxy.
- [ ] Verify `SecurityAlertTable.push()` is non-blocking (fire-and-forget) so the proxy's `onBlocked` callback returns immediately.
- [ ] Verify the `security_alerts` migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Verify `getRecent(n)` uses a parameterised SQL query (no string interpolation) to prevent SQL injection.
- [ ] Verify the Webview message payload includes all fields required by the dashboard's `SecurityAlertTable` component (domain, method, timestamp, sandboxId at minimum).
- [ ] Verify strict TypeScript compliance and requirement ID annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/proxy/__tests__/violationLogger.test.ts --runInBand` and confirm all tests pass.
- [ ] Run `npx jest src/sandbox/ src/ui/components/ --runInBand` and confirm no regressions.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.
- [ ] Run the DB migration manually against a test DB and verify the table and index are created: `sqlite3 /tmp/test.db < migration_file.sql && sqlite3 /tmp/test.db ".schema security_alerts"`.

## 5. Update Documentation
- [ ] Create `src/sandbox/proxy/VIOLATION_LOGGER.agent.md` documenting:
  - Schema of `security_alerts` table.
  - Real-time alert flow: `EgressProxy.onBlocked → ViolationLogger.record → SecurityAlertTable.push → Webview`.
  - How to query recent violations from the CLI: `devs trace --security-alerts`.
  - Requirement traceability: `[5_SECURITY_DESIGN-REQ-SEC-SD-063]`, `[9_ROADMAP-REQ-020]`.
- [ ] Update `docs/architecture/sandbox.md` with the violation alert flow (Mermaid sequence diagram).

## 6. Automated Verification
- [ ] Add `validate:violation-logger` script to `package.json`:
  ```
  "validate:violation-logger": "jest src/sandbox/proxy/__tests__/violationLogger.test.ts --runInBand --passWithNoTests=false && tsc --noEmit"
  ```
- [ ] Run `npm run validate:violation-logger` and confirm exit code 0.
- [ ] Confirm `test-results/violation-logger.xml` contains zero `<failure>` elements.
- [ ] Confirm the `security_alerts` table exists in the project's SQLite DB after running migrations: `npm run db:migrate && sqlite3 .devs/state.db ".tables" | grep security_alerts`.
