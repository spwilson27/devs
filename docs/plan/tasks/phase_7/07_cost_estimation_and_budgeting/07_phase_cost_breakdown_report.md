# Task: Implement per-phase cost breakdown report generator (Sub-Epic: 07_Cost_Estimation_And_Budgeting)

## Covered Requirements
- [1_PRD-REQ-NEED-MAKER-03]

## 1. Initial Test Written
- [ ] Create unit tests in `tests/test_phase_report.py` that assert the report generator aggregates per-epic and per-phase costs correctly. Tests to include:
  - test_phase_aggregation: provide a small roadmap fixture where task-level estimated_cost_usd values are known and assert the phase-level sums equal the expected totals.
  - test_phase_report_format: the report generator returns a dict/json with keys: `phase_id`, `phase_name` (optional), `total_tokens`, `total_estimated_cost_usd`, `epics: [{epic_id, total_tokens, estimated_cost_usd, tasks: [...] }]`.
  - test_report_serialization: the report can be serialized to JSON and round-tripped back to the same structure.

## 2. Task Implementation
- [ ] Implement `src/estimator/phase_report.py` with function `generate_phase_cost_report(roadmap: list) -> dict` that:
  - Accepts roadmap where each task includes: task_id, epic_id, phase_id, estimated_tokens, estimated_cost_usd.
  - Aggregates totals per-epic and per-phase and returns the structured JSON described in tests.
  - Provide an optional CLI `scripts/generate_phase_report.py --input <roadmap.json> --output <report.json>` that produces the report and prints a short human-readable summary.

## 3. Code Review
- [ ] Verify:
  - Aggregation is stable and uses integer arithmetic for token sums and safe float handling for USD.
  - The output structure matches the tests and documentation exactly.
  - The report generation is side-effect free; CLI only writes when `--output` is provided.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/test_phase_report.py` and confirm tests pass.

## 5. Update Documentation
- [ ] Update `docs/estimation.md` with an example phase cost report JSON and a short explanation of how the report maps to the roadmap structure (phases -> epics -> tasks).

## 6. Automated Verification
- [ ] Add `scripts/verify_phase_report.sh` that:
  - Runs the unit tests for the report and invokes the CLI on a small fixture roadmap, then validates the produced `report.json` matches expected totals using a small assertion script.
  - Exits non-zero on mismatch.
