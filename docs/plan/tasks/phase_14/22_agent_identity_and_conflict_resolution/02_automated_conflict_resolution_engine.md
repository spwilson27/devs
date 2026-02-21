# Task: Automated Conflict Resolution Engine for Developer–Reviewer Disagreements (Sub-Epic: 22_Agent Identity and Conflict Resolution)

## Covered Requirements
- [1_PRD-REQ-CON-003]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/conflict/__tests__/ConflictResolutionEngine.test.ts`.
- [ ] Write a unit test `should detect a conflict when Reviewer rejects and Developer disagrees` that constructs a `ConflictEvent` with `developerVerdict: 'PASS'` and `reviewerVerdict: 'FAIL'` and calls `detectConflict(event)`, asserting it returns `{ conflictDetected: true, conflictId: <uuid> }`.
- [ ] Write a unit test `should not detect a conflict when both agents agree` that constructs a `ConflictEvent` with both verdicts as `'PASS'` and asserts `detectConflict` returns `{ conflictDetected: false }`.
- [ ] Write a unit test `should auto-resolve a conflict via tie-breaker model when attempt count is 1` that calls `resolve({ conflictId, attemptCount: 1, developerOutput: '...', reviewerFeedback: '...' })` and asserts it returns `{ resolution: 'AUTO', tieBreakerDecision: 'PASS' | 'FAIL', rationale: string }` (mock the Gemini tie-breaker model call).
- [ ] Write a unit test `should escalate to user when attempt count reaches threshold (3)` that calls `resolve({ conflictId, attemptCount: 3, ... })` and asserts it returns `{ resolution: 'ESCALATE', escalationReason: string }`.
- [ ] Write a unit test `should persist the conflict record to SQLite before returning` that stubs the SQLite `db.run` call and asserts it was called with the correct `INSERT INTO conflicts` statement including `conflict_id`, `thread_id`, `developer_verdict`, `reviewer_verdict`, `resolution`, `resolved_at`.
- [ ] Write an integration test that wires `ConflictResolutionEngine` into a mock `AgentOrchestrator` and verifies that a `ConflictEvent` emitted during a Code Review turn causes the orchestrator to emit a `PAUSED_FOR_USER_ESCALATION` event when `attemptCount` ≥ 3.

## 2. Task Implementation
- [ ] Create `src/orchestrator/conflict/ConflictResolutionEngine.ts`.
- [ ] Define `ConflictEvent` interface: `{ conflictId: string; threadId: string; taskId: string; developerVerdict: 'PASS' | 'FAIL'; reviewerVerdict: 'PASS' | 'FAIL'; developerOutput: string; reviewerFeedback: string; attemptCount: number; }`.
- [ ] Define `ConflictResolution` interface: `{ resolution: 'AUTO' | 'ESCALATE'; tieBreakerDecision?: 'PASS' | 'FAIL'; rationale?: string; escalationReason?: string; resolvedAt: string; }`.
- [ ] Implement `detectConflict(event: Omit<ConflictEvent, 'conflictId' | 'attemptCount'>): { conflictDetected: boolean; conflictId?: string }` — returns `conflictDetected: true` when `developerVerdict !== reviewerVerdict`, generating a UUID v4 for `conflictId`.
- [ ] Implement `resolve(event: ConflictEvent): Promise<ConflictResolution>`:
  - If `event.attemptCount < 3`: call a Gemini Flash model with a structured prompt that includes both the `developerOutput` and `reviewerFeedback`, requesting a binary `PASS`/`FAIL` verdict and rationale. Return `{ resolution: 'AUTO', tieBreakerDecision, rationale }`.
  - If `event.attemptCount >= 3`: return `{ resolution: 'ESCALATE', escalationReason: 'Maximum auto-resolution attempts reached; user intervention required.' }`.
- [ ] Persist every conflict record to `state/conflicts` SQLite table (schema: `conflict_id TEXT PRIMARY KEY`, `thread_id TEXT`, `task_id TEXT`, `developer_verdict TEXT`, `reviewer_verdict TEXT`, `resolution TEXT`, `tie_breaker_decision TEXT`, `rationale TEXT`, `escalation_reason TEXT`, `attempt_count INTEGER`, `resolved_at TEXT`). Create the table via migration if absent.
- [ ] Emit an `orchestrator:conflict:escalation` event on the `EventBus` when resolution is `ESCALATE`, carrying `{ conflictId, taskId, escalationReason }`.
- [ ] Subscribe to the `orchestrator:conflict:escalation` event in `AgentOrchestrator.ts` to transition orchestrator state to `PAUSED_FOR_USER_ESCALATION` and surface the escalation via the existing HITL signaling mechanism (`5_SECURITY_DESIGN-REQ-SEC-SD-071`).
- [ ] Add `// REQ: 1_PRD-REQ-CON-003` inline comments at the `detectConflict` and `resolve` function declarations.

## 3. Code Review
- [ ] Confirm the Gemini tie-breaker call is wrapped in a try/catch; on model error, fall back to `ESCALATE` rather than silently swallowing the error.
- [ ] Verify the SQLite insert is wrapped in a transaction to prevent partial writes.
- [ ] Ensure `conflictId` uses `crypto.randomUUID()` (Node.js 19+ built-in, no third-party dependency).
- [ ] Confirm the `PAUSED_FOR_USER_ESCALATION` state transition in `AgentOrchestrator.ts` is idempotent — repeated escalation events for the same `conflictId` must not push duplicate state transitions.
- [ ] Verify all prompt content passed to the tie-breaker model is sanitized through the existing `SecretMasker` middleware before transmission.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=ConflictResolutionEngine` and confirm all tests pass with zero failures.
- [ ] Run `npm run lint` and confirm zero errors in `src/orchestrator/conflict/`.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Create `docs/architecture/conflict-resolution.md` documenting the `ConflictResolutionEngine` flow: detection → auto-resolution via Gemini tie-breaker → escalation threshold → HITL escalation. Include a Mermaid sequence diagram.
- [ ] Update `docs/user-guide/monitoring.md` to describe the `PAUSED_FOR_USER_ESCALATION` state and what actions a user can take (approve Developer output, approve Reviewer feedback, or provide new directive).
- [ ] Add `[1_PRD-REQ-CON-003]` to the `## Requirements Covered` table in `docs/architecture/orchestrator.md`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=ConflictResolutionEngine --coverage` and assert line coverage for `ConflictResolutionEngine.ts` is ≥ 90%.
- [ ] Run `grep -rn "1_PRD-REQ-CON-003" src/` and confirm at least two matches exist (at the `detectConflict` and `resolve` declarations).
- [ ] Query the SQLite test database after the integration test completes: `SELECT COUNT(*) FROM conflicts WHERE resolution = 'ESCALATE'` must equal 1, confirming the persistence path is exercised.
