# Task: ACID State Repository & Transactions (Sub-Epic: 03_ACID Transactions & State Integrity)

## Covered Requirements
- [TAS-067], [8_RISKS-REQ-115], [3_MCP-REQ-REL-004]

## 1. Initial Test Written
- [ ] Create `packages/core/test/persistence/StateRepository.test.ts`:
    - Test that multiple database updates (e.g., updating a task and an epic) inside a transaction successfully commit.
    - Test that if one update fails inside the transaction, all other updates are rolled back (atomicity).
    - Test that `StateRepository.transaction()` handles nested transactions correctly or throws if they are not supported.
    - Test that every `StateRepository` method (e.g., `updateTaskStatus`) is executed within a transaction.

## 2. Task Implementation
- [ ] In `packages/core/src/persistence/StateRepository.ts`:
    - Implement a `transaction<T>(cb: () => T): T` method that wraps a callback in a SQLite transaction using `better-sqlite3`'s `.transaction()` or explicit `BEGIN/COMMIT/ROLLBACK`.
    - Ensure every state update method (`createProject`, `updateTaskStatus`, `logAgentTurn`, etc.) uses the transaction manager.
    - Add a `ROLLBACK` support for failure scenarios within the `db_bridge`.
    - Ensure that every state change (task start, tool execution) is wrapped in a SQLite transaction.

## 3. Code Review
- [ ] Verify that the `StateRepository` does not allow raw, non-transactional writes.
- [ ] Confirm that error handling correctly triggers a `ROLLBACK` when a callback within `transaction()` throws.
- [ ] Ensure that row-level locking is maintained for parallel agent safety.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/persistence/StateRepository.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `ACID Transactions` section to `@devs/core` documentation explaining how the system maintains state integrity.

## 6. Automated Verification
- [ ] Run a simulation script `scripts/simulate_crash_during_write.ts` that kills the process mid-transaction and verifies that the database remains in its pre-transaction state.
