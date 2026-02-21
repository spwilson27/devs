# Task: Integrate SQLite State Persistence (Sub-Epic: 04_LangGraph Core Orchestration Engine)

## Covered Requirements
- [4_USER_FEATURES-REQ-013], [TAS-078], [9_ROADMAP-PHASE-001]

## 1. Initial Test Written
- [ ] Create a test in `packages/core/src/orchestration/__tests__/persistence.test.ts` that mocks a LangGraph node transition.
- [ ] Verify that after each transition, the state is correctly written to the `state.sqlite` database.
- [ ] Write a "Crash Recovery" test: initialize the graph, run one node, kill the process (mocked), and verify the graph can resume from the exact same state using the `SQLiteSaver`.

## 2. Task Implementation
- [ ] Implement or integrate the `SQLiteSaver` checkpointer (from `@devs/core/persistence`) into the `OrchestrationGraph`.
- [ ] Ensure every node transition triggers an ACID-compliant commit to the `checkpoints` table in SQLite.
- [ ] Configure the `checkpoint_id` and `thread_id` to correlate with the `projectId` and `activeTaskId`.
- [ ] Ensure the `SQLiteSaver` handles serialization of complex objects (e.g., requirement DAGs) into binary or JSON blobs as per TAS-094.
- [ ] Verify WAL (Write-Ahead Logging) mode is enabled for the database to support concurrent reads during writes.

## 3. Code Review
- [ ] Confirm that state recovery is deterministic (1_PRD-REQ-REL-003).
- [ ] Ensure zero data loss on simulated crash during a node transition.
- [ ] Verify that the persistence layer doesn't introduce significant latency to the agent loop.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core` and ensure persistence and recovery tests pass.

## 5. Update Documentation
- [ ] Document the SQLite checkpointing schema and recovery procedure in the Technical Architecture Specification (TAS).

## 6. Automated Verification
- [ ] Run a "Chaos Test" script that randomly interrupts a multi-node graph execution and verifies that `devs resume` continues from the last successful checkpoint.
