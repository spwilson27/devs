# Task: Implement GDPR Append-Only Audit Log with HMAC Integrity Chain (Sub-Epic: 14_GDPR and Compliance Logging)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-079]

## 1. Initial Test Written
- [ ] Create `src/audit/__tests__/audit-log.service.test.ts`.
- [ ] Write a unit test for `AuditLogService.append(event: AuditEvent)`:
  - Assert the written JSON line contains `{ timestamp, eventType, actorId, payload, hmac }`.
  - Assert the `hmac` field equals `HMAC-SHA256(previousHmac + JSON.stringify(event), AUDIT_HMAC_SECRET)`, verifying the chain is correctly constructed.
  - Use a fixed `AUDIT_HMAC_SECRET` env var in tests via `process.env`.
- [ ] Write a unit test for `AuditLogService.verify()`:
  - Feed a log file with one tampered line (modified `payload` field) and assert that `verify()` returns `{ valid: false, firstViolationLine: N }`.
  - Feed a correct log file and assert `{ valid: true }`.
- [ ] Write a unit test that asserts the log file is opened in **append-only** mode (`fs.open` flag `'a'`) and never in `'w'` or `'r+'` mode.
- [ ] Write an integration test that appends 100 events, closes the file, reopens it, and verifies the full HMAC chain via `verify()` returns `{ valid: true }`.

## 2. Task Implementation
- [ ] Create `src/audit/audit-log.service.ts` implementing `AuditLogService`:
  ```ts
  interface AuditEvent {
    eventType: string;   // e.g., "task_started", "purge_initiated", "agent_envelope_received"
    actorId: string;     // agent ID or user ID
    payload: Record<string, unknown>;
  }
  interface AuditLogEntry extends AuditEvent {
    timestamp: string;   // ISO-8601
    seq: number;         // monotonically increasing
    hmac: string;        // HMAC-SHA256 of (prevHmac + canonicalized entry)
  }
  ```
  - `append(event)`: Read last line to get `prevHmac` and `seq`, compute new HMAC, write a single JSON line via `fs.appendFileSync`.
  - `verify()`: Stream-read all lines, recompute HMAC chain, return first violation line index or `null` if valid.
  - `getLogPath()`: Returns `path.join(process.env.DEVS_HOME ?? '.devs', 'audit.log')`.
- [ ] Create `src/audit/audit-event.types.ts` enumerating all `eventType` constants used across the system.
- [ ] Wire `AuditLogService` as a singleton in the DI container (`src/container.ts`).
- [ ] Emit an audit event from the `devs purge` handler (task 01) using `AuditLogService.append({ eventType: 'purge_initiated', ... })` **before** any file deletion begins.
- [ ] Add `AUDIT_HMAC_SECRET` to `.env.example` with a comment explaining it must be set to a ≥32-byte random secret.

## 3. Code Review
- [ ] Confirm no code path writes to the audit log with `'w'` (truncate) mode — only `'a'` (append).
- [ ] Confirm HMAC uses `crypto.createHmac('sha256', secret)` with the secret sourced exclusively from `process.env.AUDIT_HMAC_SECRET`, never hardcoded.
- [ ] Confirm `verify()` does not short-circuit on the first valid line — it must check the full chain.
- [ ] Confirm `AuditEvent.payload` is sanitized to exclude PII fields (`email`, `name`, `ip`) per GDPR data minimization before hashing.
- [ ] Confirm `seq` is monotonically increasing and any gap detected during `verify()` is flagged as a violation.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=audit-log` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm no new errors.
- [ ] Run `npm run build` to confirm TypeScript compilation succeeds.

## 5. Update Documentation
- [ ] Update `docs/audit-logging.md` (create if missing) to describe: HMAC chain structure, log file location, how to run `verify()`, and GDPR relevance.
- [ ] Add requirement mapping comment to `src/audit/audit-log.service.ts`: `// REQ: 5_SECURITY_DESIGN-REQ-SEC-SD-079`.
- [ ] Update `CHANGELOG.md`: "feat(audit): add HMAC-chained append-only audit log for GDPR compliance".
- [ ] Update `docs/agent-memory/phase_14.agent.md` to note: audit log uses HMAC-SHA256 chain, log path is `.devs/audit.log`, PII fields are stripped before hashing.

## 6. Automated Verification
- [ ] Run `npm run validate` and confirm exit code 0.
- [ ] Run `npm test -- --coverage --testPathPattern=audit-log` and confirm `audit-log.service.ts` line coverage ≥ 90%.
- [ ] Run `node -e "require('./dist/audit/audit-log.service').AuditLogService.verify()" 2>&1` against a generated audit log and assert it prints `{ valid: true }`.
