# Task: Implement Inter-Agent Handoff via Shared Database State (Sub-Epic: 03_TAS)

## Covered Requirements
- [TAS-039]

## 1. Initial Test Written
- [ ] Create tests/agents/handoff.spec.ts (integration with in-memory SQLite). Tests to write first:
  - Test A: "Agent A writes a handoff message; Agent B claims and consumes it"
    - Arrange: create DB and ensure handoffs table empty
    - Act: Agent A calls HandOffService.createHandoff(taskId, payload, origin)
    - Act: Agent B calls HandOffService.claimHandoff(taskId)
    - Assert: claimed payload matches original and mark consumed=true
  - Test B: "Multiple handoffs are ordered; claiming returns oldest unconsumed"
    - Arrange: write three handoffs
    - Act: claim twice
    - Assert: claims are ordered FIFO and second claim returns second message

## 2. Task Implementation
- [ ] Implement src/agents/handoff.ts with a HandOffService exposing:
  - async createHandoff(taskId: string, payload: object, originAgent: string): Promise<handoffId>
  - async claimHandoff(taskId: string): Promise<{handoffId, payload, originAgent} | null>
  - async listUnclaimed(taskId: string): Promise<Array<...>>
- Implementation details:
  1. Create DB table handoffs(id TEXT PRIMARY KEY, task_id TEXT, payload JSON, origin TEXT, created_at INTEGER, consumed INTEGER DEFAULT 0).
  2. createHandoff inserts a row within a lightweight transaction.
  3. claimHandoff performs an atomic SELECT ... FOR UPDATE equivalent using a transaction: select oldest consumed=0 row, mark consumed=1, and return payload.
  4. Ensure the handoff payload is stored as JSON and avoid storing large raw text—store small metadata and a pointer if payload is large.
  5. Tag operations with REQ:[TAS-039] and include source agent in logs.

## 3. Code Review
- [ ] Ensure atomic claim, FIFO ordering, parameterized queries, and no long-lived in-memory state. Validate indexing on task_id and consumed to ensure high performance and predictable ordering.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm vitest tests/agents/handoff.spec.ts --run` and confirm handoff behavior: create then claim, and FIFO ordering tests pass.

## 5. Update Documentation
- [ ] Add docs/agents/handoff.md with API examples for createHandoff and claimHandoff, explain data retention policy and how agents should poll or subscribe for handoffs. Reference [TAS-039].

## 6. Automated Verification
- [ ] Add a CI smoke test scripts/agents/verify_handoff.js which inserts a sequence of handoffs, claims them, and asserts FIFO ordering and consumed flags; exit non-zero on any discrepancy.
