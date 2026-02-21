# Task: Implement Task Autonomy Rate (TAR) and Time-to-First-Commit (TTFC) Metrics Tracking (Sub-Epic: 36_1_PRD)

## Covered Requirements
- [1_PRD-REQ-MET-001], [1_PRD-REQ-MET-002]

## 1. Initial Test Written
- [ ] Create a test file `tests/core/metrics/TarTtfcTracker.test.ts`.
- [ ] Write a unit test `should calculate TTFC correctly` that mocks the `devs init` timestamp and records the time of the first successful Git commit, asserting it computes the delta in milliseconds.
- [ ] Write a unit test `should track TAR correctly` that simulates 10 task completions, 2 with human intervention (`human_approval_signature` or manual rewind), and asserts TAR is calculated as 80%.

## 2. Task Implementation
- [ ] Create `src/core/metrics/TarTtfcTracker.ts`.
- [ ] Implement a `TarTtfcTracker` class that hooks into the Orchestrator's event bus (`THOUGHT_STREAM`, `TOOL_LIFECYCLE`, `TASK_COMPLETE`).
- [ ] For TTFC, listen for the `PROJECT_INIT` event to store the start time in SQLite `.devs/state.sqlite` (projects table), and update upon the first `GIT_COMMIT` event.
- [ ] For TAR, query the `tasks` and `agent_logs` tables in SQLite to count the total tasks vs tasks that had `human_intervention` flags, exposing a `getTar()` getter method.
- [ ] Ensure the metrics are safely persisted in a new `project_metrics` table or updated in the `projects` table using ACID transactions.

## 3. Code Review
- [ ] Verify that the `TarTtfcTracker` uses the established database transaction patterns for `.devs/state.sqlite` updates.
- [ ] Check that date calculations use UTC timestamps to avoid timezone issues.
- [ ] Ensure that no persistent state is held in memory but always read/written to the SQLite database.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/core/metrics/TarTtfcTracker.test.ts` and confirm all tests pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/metrics.md` to document the TTFC and TAR calculation logic.
- [ ] Add the newly created SQLite table schema or columns to `docs/database/schema.md`.

## 6. Automated Verification
- [ ] Execute a verification script `npm run verify-metrics -- --type tar_ttfc` which simulates a mock project initialization, a git commit, and an intervention, then asserts that the database holds the correct TTFC and TAR values.
