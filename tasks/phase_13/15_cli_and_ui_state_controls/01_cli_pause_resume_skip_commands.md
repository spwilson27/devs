# Task: Implement CLI `pause`, `resume`, and `skip` Commands (Sub-Epic: 15_CLI and UI State Controls)

## Covered Requirements
- [1_PRD-REQ-INT-006]

## 1. Initial Test Written
- [ ] In `src/cli/__tests__/stateControls.test.ts`, write unit tests for three new CLI subcommands: `devs pause`, `devs resume`, and `devs skip`.
  - Test `devs pause`: assert it writes a `PAUSED` status record to the `run_state` SQLite table (column: `status`, value: `'PAUSED'`) and that any in-progress agent loop checks `isPaused()` and suspends before the next task turn.
  - Test `devs resume`: assert it reads the `run_state` table, confirms status is `'PAUSED'`, sets it to `'RUNNING'`, and triggers the `OrchestrationLoop.resume()` method.
  - Test `devs skip`: assert it sets the current task's status to `'SKIPPED'` in the `tasks` table and advances the orchestrator to the next task in the DAG without executing the skipped task.
  - Write integration tests using a mock SQLite DB and a mock `OrchestrationLoop` to verify state transitions are ACID (wrapped in a transaction that rolls back on failure).
  - Assert all three commands are idempotent: calling `pause` when already paused is a no-op with an appropriate CLI warning; calling `resume` when not paused errors with a clear message.

## 2. Task Implementation
- [ ] Add `pause`, `resume`, and `skip` subcommands to the CLI entry point (`src/cli/index.ts` or equivalent commander/yargs config):
  - `devs pause`: call `StateController.pause()` which sets `run_state.status = 'PAUSED'` inside a SQLite transaction.
  - `devs resume`: call `StateController.resume()` which validates status is `'PAUSED'`, sets it to `'RUNNING'`, and calls `OrchestrationLoop.resume()`.
  - `devs skip`: call `StateController.skip(taskId?)` which marks the current (or specified) task as `'SKIPPED'` in the `tasks` table and calls `OrchestrationLoop.advanceToNext()`.
- [ ] Implement `src/core/StateController.ts` with methods: `pause()`, `resume()`, `skip(taskId?: string)`. Each method must wrap DB writes in a `BEGIN IMMEDIATE` transaction.
- [ ] Add a polling check `StateController.isPaused(): Promise<boolean>` that the `OrchestrationLoop` calls at the top of each task iteration (before agent turn execution).
- [ ] Emit structured log events for each state transition (e.g., `{ event: 'STATE_TRANSITION', from: 'RUNNING', to: 'PAUSED', timestamp }`) via the existing logger.

## 3. Code Review
- [ ] Verify all DB writes use `BEGIN IMMEDIATE` transactions and roll back on any error.
- [ ] Confirm `isPaused()` is called inside the orchestration loop at a safe checkpoint (not mid-agent-turn).
- [ ] Confirm no global mutable state is used; state is read exclusively from SQLite.
- [ ] Verify CLI commands print human-readable feedback to stdout (e.g., "✓ devs paused. Run `devs resume` to continue.").
- [ ] Verify idempotency guards are in place and emit warnings rather than errors for benign duplicate calls.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="stateControls"` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="OrchestrationLoop"` to confirm the loop integration tests still pass with the new `isPaused()` checkpoint.

## 5. Update Documentation
- [ ] Update `docs/cli-reference.md` with entries for `pause`, `resume`, and `skip` including usage examples and expected output.
- [ ] Update `src/core/StateController.agent.md` (AOD) with a description of the module's responsibilities, the DB schema it touches, and its interaction with `OrchestrationLoop`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="stateControls"` and confirm line coverage ≥ 90% for `StateController.ts`.
- [ ] Execute `node dist/cli/index.js pause && node dist/cli/index.js resume` against a test SQLite DB and assert exit code 0 and correct `run_state` status values via `sqlite3 test.db "SELECT status FROM run_state LIMIT 1;"`.
