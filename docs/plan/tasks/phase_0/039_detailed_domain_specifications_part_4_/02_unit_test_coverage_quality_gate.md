# Task: Unit Test Coverage Quality Gate (QG-001) (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-050]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script & CI Pipeline" (consume), "Traceability & Coverage Infrastructure" (consume)]

## 1. Initial Test Written
- [ ] Create `tests/coverage/test_qg001_unit_gate.sh` that:
    - Generates a synthetic `target/coverage/report.json` with `{ "gates": [{ "id": "QG-001", "name": "Unit Test Line Coverage", "threshold_pct": 90.0, "actual_pct": 89.9, "passed": false }] }`.
    - Runs the coverage gate checker script (`.tools/check_coverage_gates.sh` or equivalent) against this file.
    - Asserts the checker exits non-zero and stderr contains `QG-001 FAILED: 89.9% < 90.0%`.
    - Generates a second report with `actual_pct: 90.0` and asserts the checker exits zero for QG-001.
    - Generates a report with `actual_pct: 0.0` and asserts the checker exits non-zero (zero-result protection).
- [ ] Create a Rust unit test `tests/coverage_gate_schema_test.rs` that deserializes a sample `report.json` into the gate struct and asserts all fields (`id`, `threshold_pct`, `actual_pct`, `passed`, `delta`) are present and correctly typed.

## 2. Task Implementation
- [ ] Implement (or extend) a coverage gate checker script at `.tools/check_coverage_gates.sh` that:
    - Reads `target/coverage/report.json`.
    - For each gate entry, compares `actual_pct` against `threshold_pct`.
    - Sets `passed: true/false` and computes `delta = actual_pct - threshold_pct`.
    - Prints a summary line per gate: `QG-001 PASSED: 92.3% >= 90.0% (+2.3)` or `QG-001 FAILED: 89.9% < 90.0% (-0.1)`.
    - Exits non-zero if any gate has `passed: false`.
    - Exits non-zero if any gate has `actual_pct == 0.0` (zero-result protection per project spec).
- [ ] In `./do coverage`, configure `cargo llvm-cov` to run unit tests only (tests in `src/` modules, not E2E tests). Use `--lib --bins` flags or test binary filtering to isolate unit tests from integration/E2E tests.
- [ ] Have `./do coverage` write the QG-001 entry to `target/coverage/report.json` with the measured percentage.
- [ ] Ensure `./do coverage` invokes the gate checker after generating the report, and propagates the exit code.
- [ ] Hardcode the 90.0% threshold — it must not be configurable via env var or config file.

## 3. Code Review
- [ ] Verify that unit test coverage measurement excludes E2E tests (tests in `tests/` directory or marked with `#[cfg(feature = "e2e")]`).
- [ ] Verify the 90.0% threshold is a literal constant, not read from any external source.
- [ ] Verify the `report.json` schema includes all required fields: `id`, `name`, `threshold_pct`, `actual_pct`, `passed`, `delta`.
- [ ] Verify zero-result protection: a `0.0%` actual always fails regardless of threshold.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/coverage/test_qg001_unit_gate.sh` — all assertions must pass.
- [ ] Run `./do coverage` on the workspace and verify `target/coverage/report.json` contains a QG-001 entry with `passed: true` (assuming sufficient test coverage exists).

## 5. Update Documentation
- [ ] Document the QG-001 gate in the developer guide: threshold, how it's measured, and how to debug failures.

## 6. Automated Verification
- [ ] Run `./do coverage` and parse `target/coverage/report.json` to confirm QG-001 exists with `threshold_pct: 90.0` and `passed: true`.
- [ ] Run `cat target/coverage/report.json | python3 -c "import json,sys; d=json.load(sys.stdin); g=[x for x in d['gates'] if x['id']=='QG-001'][0]; assert g['threshold_pct']==90.0; assert g['passed']==True; print('QG-001 verified')"`.
