# Task: Implement Approved-Only Vector Commit Gate to Prevent Context Poisoning (Sub-Epic: 16_Vector_Memory_Security_and_Integrity)

## Covered Requirements
- [3_MCP-RISK-503]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/vector-commit-gate.test.ts`.
- [ ] Write a unit test `VectorCommitGate_allowsApprovedTaskOutcome` that:
  - Creates a `MemoryRecord` with `{ sourceType: 'task_outcome', status: 'approved' }`.
  - Calls `VectorCommitGate.validate(record)` and asserts it returns `{ allowed: true }`.
- [ ] Write a unit test `VectorCommitGate_allowsVerifiedArchitecturalDecision` that:
  - Creates a `MemoryRecord` with `{ sourceType: 'architectural_decision', status: 'verified' }`.
  - Calls `VectorCommitGate.validate(record)` and asserts it returns `{ allowed: true }`.
- [ ] Write a unit test `VectorCommitGate_rejectsPendingTaskOutcome` that:
  - Creates a `MemoryRecord` with `{ sourceType: 'task_outcome', status: 'pending' }`.
  - Calls `VectorCommitGate.validate(record)` and asserts it returns `{ allowed: false, reason: expect.stringContaining('pending') }`.
- [ ] Write a unit test `VectorCommitGate_rejectsUnverifiedArchitecturalDecision` that:
  - Creates a `MemoryRecord` with `{ sourceType: 'architectural_decision', status: 'draft' }`.
  - Calls `VectorCommitGate.validate(record)` and asserts `allowed: false`.
- [ ] Write a unit test `VectorCommitGate_rejectsAnyResearchRecord` that:
  - Creates a `MemoryRecord` with `{ sourceType: 'research', status: 'approved' }` (even approved research).
  - Calls `VectorCommitGate.validate(record)` and asserts `allowed: false` (research goes to untrusted only; gating does not grant trusted access).
- [ ] Write a unit test `VectorStore_add_blockedByGateThrows` that:
  - Spies on `VectorCommitGate.validate` to return `{ allowed: false, reason: 'not approved' }`.
  - Calls `VectorStore.add(record, { partition: 'trusted' })`.
  - Asserts the call throws `VectorCommitBlockedError` with message containing `'not approved'`.
- [ ] Write a unit test `VectorStore_add_allowedByGateProceedsNormally` that:
  - Spies on `VectorCommitGate.validate` to return `{ allowed: true }`.
  - Stubs LanceDB `table.add()`.
  - Calls `VectorStore.add(record, { partition: 'trusted' })`.
  - Asserts `table.add()` was called exactly once.
- [ ] Write a unit test `VectorStore_add_bypassesGateForUntrustedPartition` that:
  - Spies on `VectorCommitGate.validate`.
  - Calls `VectorStore.add(record, { partition: 'untrusted' })`.
  - Asserts `VectorCommitGate.validate` was NOT called (the gate only guards the trusted partition).
- [ ] Write a unit test `CommitAuditLog_recordsDeniedAttempt` that:
  - Triggers a blocked `VectorStore.add()` (gate returns `allowed: false`).
  - Queries the SQLite `commit_audit_log` table.
  - Asserts a row exists with `{ recordId, status: 'denied', reason: 'not approved' }`.
- [ ] Write a unit test `CommitAuditLog_recordsAllowedCommit` that:
  - Triggers a successful `VectorStore.add()` on the trusted partition.
  - Asserts a row exists in `commit_audit_log` with `{ recordId, status: 'committed', partition: 'trusted' }`.

## 2. Task Implementation
- [ ] Create `packages/memory/src/vector-commit-gate.ts`:
  - Export `interface GateResult { allowed: boolean; reason?: string }`.
  - Export `class VectorCommitGate` with static method `validate(record: MemoryRecord): GateResult`.
  - Allowed combinations (return `{ allowed: true }`):
    - `sourceType === 'task_outcome' && status === 'approved'`
    - `sourceType === 'architectural_decision' && status === 'verified'`
    - `sourceType === 'lesson_learned' && status === 'verified'`
  - All other combinations return `{ allowed: false, reason: '<descriptive message>' }`.
  - Research records (`sourceType === 'research'`) always return `{ allowed: false, reason: 'research data must remain in untrusted partition' }` — even if status is `approved`.
- [ ] Create `packages/memory/src/errors.ts` entry (or extend existing):
  - `export class VectorCommitBlockedError extends Error { constructor(reason: string) { super(\`Vector commit blocked: \${reason}\`); } }`
- [ ] Modify `packages/memory/src/vector-store.ts` `add()` method:
  - Before any encryption or LanceDB write, if `partition === TRUSTED_PARTITION`:
    1. Call `VectorCommitGate.validate(record)`.
    2. If `result.allowed === false`, write a denied entry to `CommitAuditLog`, then throw `VectorCommitBlockedError(result.reason)`.
  - If `partition === UNTRUSTED_PARTITION`, skip the gate check entirely.
  - After a successful trusted write, call `CommitAuditLog.record({ recordId, status: 'committed', partition: 'trusted' })`.
- [ ] Create `packages/memory/src/commit-audit-log.ts`:
  - Connects to the project SQLite database (`@devs/db` or direct `better-sqlite3`).
  - Creates table on first use:
    ```sql
    CREATE TABLE IF NOT EXISTS commit_audit_log (
      id          TEXT PRIMARY KEY,
      record_id   TEXT NOT NULL,
      status      TEXT NOT NULL CHECK(status IN ('committed', 'denied')),
      partition   TEXT,
      reason      TEXT,
      source_type TEXT,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    ```
  - Export `CommitAuditLog.record(entry: AuditEntry): void` (synchronous, using better-sqlite3 prepared statements).
  - Export `CommitAuditLog.queryDenied(limit?: number): AuditEntry[]` for monitoring.
- [ ] Expose a new MCP tool `memory_query_commit_audit` in `packages/mcp-server/src/tools/memory.ts`:
  - Input: `{ status?: 'committed' | 'denied'; limit?: number }`.
  - Returns the last N audit log entries filtered by status.
  - This tool lets agents and users inspect whether any unauthorized commit attempts have been detected.
- [ ] Update `MemoryRecord` type in `packages/memory/src/types.ts` to ensure `status` and `sourceType` are required fields (not optional), so the gate can always evaluate them.

## 3. Code Review
- [ ] Verify `VectorCommitGate.validate` has no branch that allows a `research` record into the trusted partition regardless of status.
- [ ] Verify the gate is called on EVERY `add()` to the trusted partition — no bypass path exists in production code.
- [ ] Verify the gate check happens BEFORE encryption (fail fast, do not waste crypto operations on blocked records).
- [ ] Verify `CommitAuditLog.record` is called for BOTH allowed and denied outcomes (full audit trail).
- [ ] Verify `VectorCommitBlockedError` message always contains the `reason` string from `GateResult` so that callers can surface it to the user/agent.
- [ ] Verify the `commit_audit_log` SQLite table is created idempotently (`CREATE TABLE IF NOT EXISTS`) and the schema matches the type definitions.
- [ ] Confirm the MCP tool `memory_query_commit_audit` has input validation (e.g., `limit` is capped at 500).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="vector-commit-gate"` and confirm all new tests pass.
- [ ] Run `pnpm --filter @devs/memory test` for the full suite and confirm no regressions.
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="memory"` and confirm MCP tool tests pass.
- [ ] Run integration tests: `pnpm --filter @devs/memory test:integration -- --testPathPattern="commitGate"`.

## 5. Update Documentation
- [ ] Create `docs/memory/commit-gate.md` documenting:
  - The allowed source type / status combinations for trusted partition writes.
  - The `VectorCommitBlockedError` error and how agents should handle it (log, surface to user, do NOT retry with manipulated metadata).
  - The `commit_audit_log` table schema and purpose.
  - How to use the `memory_query_commit_audit` MCP tool to monitor for poisoning attempts.
- [ ] Update `packages/memory/README.md` with a "Commit Gate" section.
- [ ] Update agent memory (`docs/agent-memory/phase_4_decisions.md`) with: "Only records with `status: 'approved'` (for task outcomes) or `status: 'verified'` (for architectural decisions and lessons learned) are permitted to write to the `trusted` LanceDB partition. This is enforced by `VectorCommitGate` and all attempts (allowed or denied) are recorded in `commit_audit_log`."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test -- --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm coverage threshold is met.
- [ ] Execute `scripts/verify_vector_commit_gate.sh` which:
  1. Attempts to insert a `task_outcome` record with `status: 'pending'` into the trusted partition via `VectorStore.add()`.
  2. Asserts the call throws (non-zero exit from the script's node invocation) and the error message contains `"blocked"`.
  3. Queries `commit_audit_log` and asserts a `denied` row exists for the record.
  4. Re-runs the insert with `status: 'approved'` and asserts it succeeds.
  5. Queries `commit_audit_log` and asserts a `committed` row exists.
  6. Exits 0 on full success, non-zero on any assertion failure.
- [ ] Confirm CI pipeline step `test:memory` exits 0.
