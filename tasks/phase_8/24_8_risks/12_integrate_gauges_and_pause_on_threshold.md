# Task: Integrate resource gauges into orchestrator and pause on threshold (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-032]

## 1. Initial Test Written
- [ ] Write integration tests at tests/integration/gauges-orchestrator.spec.ts that simulate gauge 'threshold' events and assert that the orchestrator responds by pausing running tasks, persisting state, and emitting a PAUSE_FOR_INTERVENTION reason.

## 2. Task Implementation
- [ ] Subscribe the orchestrator/DeveloperAgent runtime to the GaugeCollector 'threshold' events. On threshold breach:
  - Pause active tasks (set state PAUSED_FOR_RESOURCE) and persist their execution state to state.sqlite.
  - Emit an MCP-level alert and record the event in agent_logs with metric snapshot.
  - Provide an automated short-lived mitigation (e.g., decrease parallelism) and require human confirmation for resume if configured.

## 3. Code Review
- [ ] Verify that responses to threshold events are safe (do not kill processes unexpectedly), that pause/resume paths are deterministic, and that no data corruption can occur while pausing. Confirm metrics snapshot is attached to pause records.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/integration/gauges-orchestrator.spec.ts --run and ensure orchestrator pauses and persists state correctly under simulated threshold breaches.

## 5. Update Documentation
- [ ] Update docs/risks/resource_gauges.md with orchestration behavior on threshold breach, example alert messages, and recommended runbook steps for operators.

## 6. Automated Verification
- [ ] CI validation: simulate a threshold event in a test cluster and assert that paused tasks are persisted in state.sqlite and that MCP alert endpoint reports the same metric snapshot within 5 seconds.
