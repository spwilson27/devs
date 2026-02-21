# Task: Implement Deadlock Recovery & Watchdog (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-125], [8_RISKS-REQ-138]

## 1. Initial Test Written
- [ ] Create an integration-style unit test at tests/agents/watchdog.spec.ts that:
  - Uses a mock DeadlockDetector that emits a cycle event for agents [A,B,C].
  - Asserts the Watchdog takes recovery action according to policy (e.g., suspends the oldest agent, publishes an RCA entry, and requeues tasks for remaining agents).
  - Verify that the recovery action is idempotent and safe to call multiple times.

## 2. Task Implementation
- [ ] Implement `src/agents/watchdog.ts` which subscribes to the `deadlock-detector` events and implements recovery policies:
  - Configurable policy options: `preferOldest`, `preferLowestPriority`, `forceSuspend` boolean, and `requeueStrategy` (round-robin|first-fit).
  - Recovery actions: `suspendAgent(agentId)`, `createRCA(agentIds, reason)`, `reassignTasks(agentId, strategy)`.
  - Integrate with the project's persistence layer (SQLite or Git metadata) to record state changes atomically.
- [ ] Emit structured events (`watchdog.recovery`) summarizing actions taken.

## 3. Code Review
- [ ] Verify recovery actions are atomic and race-free; ensure a two-phase commit pattern or mutex is used around state transitions.
- [ ] Ensure the watchdog does not escalate to kill processes without explicit configuration; default should be non-destructive (suspend & requeue).
- [ ] Validate logs and RCA entries contain only metadata and no secret payloads.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/agents/watchdog.spec.ts` and ensure recovery flows behave as expected under mocked detector input.
- [ ] Run integration smoke `node scripts/simulate-deadlock-and-watchdog.js` locally against a dev sandbox to validate end-to-end behavior.

## 5. Update Documentation
- [ ] Add `docs/agents/watchdog.md` documenting default policies, configuration knobs, emitted event schema, and operational guidelines for operators.

## 6. Automated Verification
- [ ] Add `scripts/simulate-deadlock-and-watchdog.js` which sets up a fake graph, triggers the detector, and verifies the watchdog actions; return non-zero if state transitions are incorrect. CI should run this script on a schedule for regression detection.
