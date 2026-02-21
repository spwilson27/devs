# Task: Multi-Agent Conflict Detection (File-level Locking & Merge Proposals) (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-138]

## 1. Initial Test Written
- [ ] Create unit/integration tests at tests/locks/file-lock-manager.spec.ts which:
  - Simulate two agents A and B attempting to acquire an exclusive write lock on the same file path `src/foo/bar.js`.
  - Assert that when A holds the lock, B receives a conflict result containing `ownerAgentId`, `requestedAt`, and `filePath` and that a merge proposal entry is created when requested.
  - Assert lock TTL behavior: when A crashes (simulate by not releasing lock but removing process), lock expires and B can acquire it after TTL.

## 2. Task Implementation
- [ ] Implement `src/lib/locks/file-lock-manager.ts`:
  - Provide `acquireLock(agentId, filePath, ttlMs)`, `releaseLock(agentId, filePath)`, and `getLockInfo(filePath)`.
  - Persist locks in SQLite or an in-memory store with atomic compare-and-set semantics so concurrent agents behave deterministically.
  - When conflict occurs, create a merge proposal object persisted at `merge_proposals/{filePath}/{timestamp}.json` capturing diffs, the conflicting agent IDs, and context.
- [ ] Provide a small HTTP API endpoint (or internal method) `GET /locks/:filePath` to inspect locks for debugging.

## 3. Code Review
- [ ] Ensure locking is resilient to process crashes (uses TTL and lease-refresh patterns) and does not cause permanent deadlocks.
- [ ] Validate persistence format and ensure no sensitive payloads are written into merge proposal artifacts.
- [ ] Verify concurrency properties via stress tests locally.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/locks/file-lock-manager.spec.ts` and ensure lock and TTL behavior pass; run stress test harness locally.

## 5. Update Documentation
- [ ] Add `docs/agents/file-locks.md` documenting lock acquisition semantics, TTL defaults, how merge proposals are persisted, and operational troubleshooting steps.

## 6. Automated Verification
- [ ] Add `scripts/simulate-lock-conflict.sh` that spawns two Node processes simulating agents; assert proper conflict responses and TTL expiry behavior; CI can run this on a dedicated job if needed.
