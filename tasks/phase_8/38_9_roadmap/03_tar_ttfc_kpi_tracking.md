# Task: Implement KPI Tracking for TAR and TTFC (Sub-Epic: 38_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-049]

## 1. Initial Test Written
- [ ] Create `tests/metrics/KpiTracker.test.ts`.
- [ ] Write a test `should correctly calculate Task Autonomy Rate (TAR) over a set of completed tasks`.
- [ ] Write a test `should track and calculate Time-to-First-Commit (TTFC) accurately from task initiation to commit timestamp`.
- [ ] Write a test `should trigger alert or log metric if TAR drops below 85% or TTFC exceeds 1hr`.

## 2. Task Implementation
- [ ] Create `src/metrics/KpiTracker.ts`.
- [ ] Implement logic to hook into the `TaskEngine` and `GitManager` events to record the start time of a task and the timestamp of its resulting first Git commit.
- [ ] Implement logic to track human interventions (e.g., `HITL` responses, `strategy_pivot` overrides) to correctly calculate the Task Autonomy Rate (TAR).
- [ ] Add methods `getTarMetric()` and `getTtfcMetric()` to query the current session's KPI performance.
- [ ] Persist these metric events into the SQLite `projects` or `agent_logs` table for historical tracking.

## 3. Code Review
- [ ] Ensure that the KPI calculations do not introduce significant overhead or block the main execution loop.
- [ ] Verify that timestamp tracking accurately uses UTC and handles boundary conditions (e.g., tasks spanning multiple days).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/metrics/KpiTracker.test.ts` to verify KPI logic.

## 5. Update Documentation
- [ ] Update `docs/metrics/kpi_definitions.md` with the exact calculation formulas used for TAR and TTFC.
- [ ] Update `.agent.md` to instruct future Reviewer or Supervisor agents to monitor these KPI endpoints.

## 6. Automated Verification
- [ ] Run a simulated project pipeline that executes 10 tasks (with 1 simulated human intervention) and assert that the output of `KpiTracker.getTarMetric()` strictly equals `90.0%`.
