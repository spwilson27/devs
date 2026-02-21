# Task: Security Alert DB Schema and Logging Service (Sub-Epic: 20_Security Alert Table and Escalation UI)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-075]

## 1. Initial Test Written
- [ ] In `src/security/__tests__/securityAlertLogger.test.ts`, write unit tests for a `SecurityAlertLogger` service:
  - Test `logNetworkViolation(agentId: string, url: string, reason: string)` inserts a row into `security_alerts` with `type = 'NETWORK_VIOLATION'`, correct `agent_id`, `detail` JSON, and a valid ISO-8601 `timestamp`.
  - Test `logFilesystemViolation(agentId: string, path: string, operation: string)` inserts a row with `type = 'FILESYSTEM_VIOLATION'`.
  - Test `logResourceDoS(agentId: string, resourceType: string, usage: number, limit: number)` inserts a row with `type = 'RESOURCE_DOS'`.
  - Test `logRedactionHit(agentId: string, tokenType: string)` inserts a row with `type = 'REDACTION_HIT'`.
  - Test that querying `getAlerts({ limit: 50, offset: 0 })` returns rows ordered by `timestamp DESC`.
  - Test that `getAlerts({ type: 'NETWORK_VIOLATION' })` filters correctly.
  - Test that `getAlerts({ agentId: 'agent-xyz' })` filters by agent.
  - Use an in-memory SQLite instance (via `better-sqlite3`) for all tests so no persistent state is created.
  - All tests must be written and failing before any implementation begins.

## 2. Task Implementation
- [ ] Add a new migration file `src/db/migrations/0XX_create_security_alerts.sql` with the following schema:
  ```sql
  CREATE TABLE IF NOT EXISTS security_alerts (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    type        TEXT NOT NULL CHECK(type IN ('NETWORK_VIOLATION','FILESYSTEM_VIOLATION','RESOURCE_DOS','REDACTION_HIT')),
    agent_id    TEXT NOT NULL,
    detail      TEXT NOT NULL,  -- JSON blob with violation-specific fields
    timestamp   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    severity    TEXT NOT NULL DEFAULT 'HIGH' CHECK(severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    acknowledged INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_security_alerts_type      ON security_alerts(type);
  CREATE INDEX IF NOT EXISTS idx_security_alerts_agent_id  ON security_alerts(agent_id);
  CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON security_alerts(timestamp DESC);
  ```
- [ ] Register the migration in `src/db/migrationRunner.ts` so it runs automatically on `devs init` / DB bootstrap.
- [ ] Create `src/security/securityAlertLogger.ts` implementing `SecurityAlertLogger`:
  - Constructor accepts a `Database` instance (from `better-sqlite3`).
  - Implement `logNetworkViolation`, `logFilesystemViolation`, `logResourceDoS`, `logRedactionHit` – each serializes the relevant fields into the `detail` JSON column and calls an internal `_insert(row)` helper.
  - Implement `getAlerts(opts: { type?: AlertType; agentId?: string; limit?: number; offset?: number; since?: string }): SecurityAlert[]` using a parameterized prepared statement.
  - Implement `acknowledgeAlert(id: string): void` to set `acknowledged = 1`.
  - Export a singleton `securityAlertLogger` that is initialized with the shared DB instance from `src/db/index.ts`.
- [ ] Export types `AlertType`, `SecurityAlert` from `src/security/types.ts`.
- [ ] Wire `SecurityAlertLogger` into existing sandbox violation hooks:
  - In `src/sandbox/networkEgressProxy.ts`: call `securityAlertLogger.logNetworkViolation(...)` on any blocked request.
  - In `src/sandbox/filesystemGuard.ts`: call `securityAlertLogger.logFilesystemViolation(...)` on path traversal or out-of-scope write attempts.

## 3. Code Review
- [ ] Verify the migration is idempotent (`IF NOT EXISTS`).
- [ ] Verify all SQL queries use parameterized statements – no string interpolation.
- [ ] Verify `detail` is always valid JSON before insertion (use `JSON.stringify` with try/catch).
- [ ] Verify `SecurityAlertLogger` has no direct `require('better-sqlite3')` import – it must accept the `Database` as a constructor dependency (dependency injection pattern).
- [ ] Verify the singleton export is the only place a concrete DB instance is bound, keeping the class itself testable in isolation.
- [ ] Confirm index on `timestamp DESC` exists and migration script is sequentially numbered correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="securityAlertLogger"` and confirm all tests pass with zero failures.
- [ ] Run `npm run lint` and confirm zero lint errors in changed files.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/security/securityAlertLogger.agent.md` documenting:
  - Purpose of `SecurityAlertLogger`.
  - The four alert types and their `detail` JSON schemas.
  - How to call each log method from other modules.
  - The `getAlerts` query API and filter options.
- [ ] Append a note to `src/db/MIGRATIONS.md` describing the `security_alerts` table and its indexes.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="securityAlertLogger" --coverage` and confirm coverage ≥ 90% for `src/security/securityAlertLogger.ts`.
- [ ] Run `node -e "const db = require('better-sqlite3')(':memory:'); require('./dist/db/migrationRunner').runMigrations(db); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=\\'table\\' AND name=\\'security_alerts\\'').get());"` and confirm the table exists.
