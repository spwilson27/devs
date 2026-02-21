# Task: Implement RTI Metric Monitoring and Phase Dashboard (Sub-Epic: 09_Risk_Mitigation_and_Monitoring)

## Covered Requirements
- [8_RISKS-REQ-106]

## 1. Initial Test Written
- [ ] Create unit and integration tests for an `rti_monitor` component responsible for calculating and monitoring the Requirement Traceability Index per phase and raising alerts when RTI drops below thresholds.
  - Unit tests for `calculate_rti(requirements, task_mappings)` using synthetic datasets (100% coverage scenario, partial coverage scenarios, and zero-coverage scenarios).
  - Integration test that simulates a phase publishing step and asserts `rti_monitor` receives updated mappings and updates a persistent `phase_metrics` collection with `rti` and timestamp.
  - Tests for alerting: when RTI < 0.9 (configurable), an alert entry is created and an `alerts` event is emitted to the internal bus.

## 2. Task Implementation
- [ ] Implement `src/monitoring/rti_monitor.py` with these responsibilities:
  - `calculate_rti(requirements, task_mappings)` returns a float 0.0-1.0 using exact mapped ratios and weighted partial matches for fuzzy mappings.
  - Store periodic RTI snapshots into `phase_metrics` table/collection: fields {phase_id, rti, total_requirements, mapped_requirements, timestamp}.
  - Provide an API `GET /api/v1/monitoring/phases/{phase_id}/rti` to fetch latest RTI and history.
  - Implement alerting logic which publishes `monitoring.alert` events when thresholds breached and logs actionable details (which requirements are unmapped).
  - Add configuration support (env or config file) for thresholds, snapshot intervals, and retention.

## 3. Code Review
- [ ] Verify RTI calculation math is well-documented and unit-tested for edge cases.
- [ ] Ensure persistence uses existing DB abstractions and indexes the `phase_id` + `timestamp` for efficient queries.
- [ ] Confirm the alert payload contains sufficient data for automated remediation (requirement IDs, counts, links to source docs).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for RTI calculation and the integration tests that simulate phase updates, e.g., `pytest tests/test_rti_monitor.py`.

## 5. Update Documentation
- [ ] Add `docs/monitoring/rti.md` explaining RTI formula, how thresholds are configured, and how the phase dashboard interprets RTI changes.
- [ ] Add a short runbook `docs/ops/rti_alerts.md` describing steps when an RTI alert is fired (investigate orphan requirements, re-run distillation sweep, request user review).

## 6. Automated Verification
- [ ] Add a CI job step to run RTI unit tests and a smoke test that hits `GET /api/v1/monitoring/phases/{phase_id}/rti` against a test instance to assert a JSON with fields {rti, timestamp, mapped_requirements} is returned.
