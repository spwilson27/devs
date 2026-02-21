# Task: Implement Lifecycle Control API (Pause/Resume/Status) (Sub-Epic: 10_Lifecycle Management & Phase Milestones)

## Covered Requirements
- [4_USER_FEATURES-REQ-001]

## 1. Initial Test Written
- [ ] Write integration tests in `tests/lifecycle/Control.test.ts`:
  - Test `pause()`: Verify `status` changes to `PAUSED` in DB.
  - Test `resume()`: Verify `status` changes back to `ACTIVE`.
  - Test `status()`: Verify it returns current phase, milestone, and a list of completed/active epics.
- [ ] Mock the orchestrator loop to verify it stops/starts based on these status changes.

## 2. Task Implementation
- [ ] Add `pause()`, `resume()`, and `status()` methods to `ProjectManager`.
- [ ] `pause()`: Update `projects.status` to `PAUSED` and signal the LangGraph orchestrator to stop at the next checkpoint.
- [ ] `resume()`: Update `projects.status` to `ACTIVE` and re-trigger the LangGraph execution.
- [ ] `status()`: Query `projects`, `epics`, and `tasks` tables to aggregate a comprehensive state object:
  - Overall progress percentage.
  - Current Phase & Milestone.
  - List of Epics with their status.
  - Last 5 agent log entries.

## 3. Code Review
- [ ] Ensure that `pause` is respected by the orchestrator at node boundaries to prevent state corruption.
- [ ] Verify `status` output matches the required CLI headless mode (`--json`) schema.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test tests/lifecycle/Control.test.ts` and ensure state transitions are correctly persisted and reported.

## 5. Update Documentation
- [ ] Document the lifecycle control API in the internal architecture docs for the VSCode Extension team.

## 6. Automated Verification
- [ ] Use `sqlite3 .devs/state.sqlite "SELECT status FROM projects"` after calling `pause()` via a test script to confirm DB-level persistence.
