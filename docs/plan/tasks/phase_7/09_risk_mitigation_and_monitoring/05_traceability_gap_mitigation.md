# Task: Implement Requirement Traceability Gap Detection & Auto-Remediation Suggestions (Sub-Epic: 09_Risk_Mitigation_and_Monitoring)

## Covered Requirements
- [8_RISKS-REQ-129]

## 1. Initial Test Written
- [ ] Create unit and integration tests for a `traceability_gap_detector` that scans the set of extracted requirements and the generated task mappings and identifies gaps where requirements have zero or insufficient task mappings.
  - Unit tests should cover exact gaps (no tasks mapped) and partial gaps (only partial coverage via fuzzy matches).
  - Integration tests should simulate a typical distillation run that produces some orphaned requirements and assert the detector flags them and creates suggested remediation actions.
  - Tests should assert remediation suggestions include: `create_task_template`, `suggest_re-distillation`, and `escalate_to_user_review`.

## 2. Task Implementation
- [ ] Implement `src/distiller/traceability_gap_detector.py` with the following features:
  - `detect_gaps(requirements, task_mappings, threshold=0.8) -> list[gaps]` where each gap contains requirement id, coverage_score, and supporting evidence.
  - Build a `suggest_remediations(gaps) -> list[ {req_id, suggested_actions} ]` generator that provides concrete starter task templates (title, acceptance criteria, inputs) that can be auto-seeded into the task backlog.
  - Integrate with the event bus to publish `traceability.gaps_detected` with payload including suggested remediation actions.
  - Ensure suggested task templates are small, TDD-friendly units (<=200 LoC) and include explicit test ideas, filenames, and minimal code scaffolding.

## 3. Code Review
- [ ] Review the detector for correctness of coverage scoring and that suggested task templates are actionable and small (one PR each).
- [ ] Confirm the detector avoids duplicate suggestions (idempotency) and includes timestamps for when gaps were detected.

## 4. Run Automated Tests to Verify
- [ ] Run unit and integration tests for gap detection and remediation suggestion generation, e.g., `pytest tests/test_traceability_gap_detector.py`.

## 5. Update Documentation
- [ ] Add `docs/distiller/traceability_gaps.md` that explains how gaps are detected, what coverage_score means, and how suggested remediation tasks are generated and consumed by backlog pipelines.
- [ ] Document the `traceability.gaps_detected` event schema in `docs/integration/events.md`.

## 6. Automated Verification
- [ ] Add a CI test that runs the detector against a canonical sample dataset and asserts the number of gaps detected matches the expected fixtures and that suggested remediation actions conform to the `task_template` JSON schema in `tests/schemas/task_template.json`.
