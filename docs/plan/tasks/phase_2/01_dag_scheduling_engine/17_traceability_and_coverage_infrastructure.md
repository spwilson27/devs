# Task: Traceability & Coverage Infrastructure (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-455], [2_TAS-REQ-456], [2_TAS-REQ-457], [2_TAS-REQ-458], [2_TAS-REQ-459], [2_TAS-REQ-460], [1_PRD-REQ-050]

## Dependencies
- depends_on: ["11_do_script_implementation.md"]
- shared_components: [Traceability & Coverage Infrastructure (owner — traceability.json, coverage gates), ./do Entrypoint Script & CI Pipeline (consumer — coverage enforcement)]

## 1. Initial Test Written
- [ ] Create `tests/traceability_tests.rs` and `tests/coverage_tests.rs`.
- [ ] Write integration test `test_do_test_generates_traceability_json`: run `./do test`. Assert `target/traceability.json` is generated and is valid JSON. Annotate `// Covers: 2_TAS-REQ-455`.
- [ ] Write integration test `test_traceability_json_has_phase_gates`: parse `target/traceability.json`. Assert it contains `phase_gates` array with entries for each phase (ROAD-001 through ROAD-006). Annotate `// Covers: 2_TAS-REQ-455`.
- [ ] Write integration test `test_traceability_overall_passed_true`: when all requirements have covering tests, assert `overall_passed` field is `true`. Annotate `// Covers: 2_TAS-REQ-455`.
- [ ] Write integration test `test_stale_annotation_detected`: add `// Covers: NONEXISTENT_REQ` to a test file. Run `./do test`. Assert exit non-zero and `target/traceability.json` contains `NONEXISTENT_REQ` in `uncovered_ids` or `stale_annotations`. Annotate `// Covers: 2_TAS-REQ-456`.
- [ ] Write integration test `test_coverage_report_json_schema`: run `./do coverage`. Assert `target/coverage/report.json` is generated with exactly five gate entries (QG-001 through QG-005). Assert each entry has required fields: `gate_id`, `threshold_pct`, `actual_pct`, `passed`. Annotate `// Covers: 2_TAS-REQ-457`.
- [ ] Write integration test `test_coverage_gate_enforcement_qg001`: temporarily modify QG-001 threshold to 99.9% (artificially high). Run `./do coverage`. Assert exit non-zero. Annotate `// Covers: 2_TAS-REQ-458`.
- [ ] Write integration test `test_coverage_gate_enforcement_all_gates`: verify all five gates (QG-001: 90% unit, QG-002: 80% E2E aggregate, QG-003: 50% CLI, QG-004: 50% TUI, QG-005: 50% MCP) are enforced. Assert exit non-zero when any fails. Annotate `// Covers: 2_TAS-REQ-458`.
- [ ] Write integration test `test_presubmit_timeout_enforced`: create test script that replaces `./do test` with `sleep 99999`. Run `./do presubmit` with short timeout (10 seconds for test). Assert exit non-zero, child processes killed, partial timing data written. Annotate `// Covers: 2_TAS-REQ-459`.
- [ ] Write integration test `test_presubmit_timings_written_incrementally`: run `./do presubmit`, kill mid-execution. Assert `target/presubmit_timings.jsonl` contains entries for completed steps (not empty). Annotate `// Covers: 2_TAS-REQ-459`.
- [ ] Write integration test `test_do_unknown_command_shows_help`: run `./do foobar`. Assert exit non-zero and stderr contains "Valid commands" or similar help message. Annotate `// Covers: 2_TAS-REQ-460`.
- [ ] Write integration test `test_unit_coverage_90_pct_gate`: verify `./do coverage` enforces ≥ 90% unit test line coverage across all workspace crates. Annotate `// Covers: 1_PRD-REQ-050`.
- [ ] Write integration test `test_coverage_per_crate_reporting`: assert `target/coverage/report.json` contains per-crate coverage percentages. Annotate `// Covers: 1_PRD-REQ-050`.

## 2. Task Implementation
- [ ] Implement traceability scanner in `scripts/traceability_scanner.py` or Rust tool:
  - Scan all `**/*.rs` test files for `// Covers: REQ-ID` annotations.
  - Extract all requirement IDs from `docs/plan/requirements/*.md`.
  - Compute coverage: requirements with at least one test vs. total requirements.
  - Generate `target/traceability.json` with:
    - `overall_passed: bool` — true if all requirements covered.
    - `traceability_pct: f64` — percentage of requirements covered.
    - `uncovered_ids: Vec<String>` — requirements without tests.
    - `stale_annotations: Vec<String>` — test annotations referencing non-existent requirements.
    - `phase_gates: Vec<PhaseGate>` — per-phase gate status.
- [ ] Implement coverage gate enforcement in `./do coverage`:
  - Run `cargo llvm-cov --workspace --json > target/coverage/raw.json`.
  - Parse raw coverage data, compute per-crate and aggregate percentages.
  - Enforce five gates:
    - QG-001: ≥ 90% unit test line coverage (aggregate).
    - QG-002: ≥ 80% E2E test line coverage (aggregate).
    - QG-003: ≥ 50% CLI E2E coverage.
    - QG-004: ≥ 50% TUI E2E coverage.
    - QG-005: ≥ 50% MCP E2E coverage.
  - Generate `target/coverage/report.json` with gate results.
  - Exit non-zero if any gate fails.
- [ ] Implement presubmit timeout enforcement in `./do presubmit`:
  - Start background timer process (separate from shell, survives subshells).
  - Set hard timeout at 900,000 ms (15 minutes).
  - On timeout: kill all child processes, exit non-zero.
  - Write incremental timing data to `target/presubmit_timings.jsonl`:
    - One JSON line per step, flushed immediately.
    - Format: `{"step": "test", "duration_ms": 12345, "exit_code": 0, "over_budget": false}`.
  - Clean up timer PID file on all exit paths.
- [ ] Implement script argument validation in `./do`:
  - Use `case` statement to match subcommands.
  - Default case: print "Valid commands: setup, build, test, lint, format, coverage, presubmit, ci" to stderr.
  - Exit with code 1.
- [ ] Add `// Covers:` annotations in test code for all covered requirements.

## 3. Code Review
- [ ] Verify traceability scanner finds all `// Covers:` annotations.
- [ ] Verify coverage gates are enforced correctly (exit non-zero on failure).
- [ ] Verify presubmit timeout is enforced by separate background process.
- [ ] Verify `target/presubmit_timings.jsonl` is written incrementally (line-by-line).
- [ ] Verify timer PID file is cleaned up on all exit paths.
- [ ] Verify unknown subcommand prints help to stderr and exits 1.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test traceability_tests` and verify all tests pass.
- [ ] Run `cargo test --test coverage_tests` and verify all tests pass.
- [ ] Run `./do coverage` and verify all gates pass.
- [ ] Run `./do presubmit` and verify timeout enforcement works.

## 5. Update Documentation
- [ ] Add header comment to traceability scanner explaining its purpose.
- [ ] Document the `// Covers:` annotation convention.
- [ ] Document the five coverage gates (QG-001 through QG-005).
- [ ] Document the presubmit timeout and timing data format.

## 6. Automated Verification
- [ ] Run `cargo test --test traceability_tests --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo test --test coverage_tests --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Verify `target/traceability.json` is generated after `./do test` and contains valid JSON with `phase_gates` array.
- [ ] Verify `target/coverage/report.json` is generated after `./do coverage` and contains exactly five gate entries.
- [ ] Verify `./do coverage` exits 0 when all gates pass, non-zero when any fails.
- [ ] Verify `./do presubmit` exits non-zero on timeout and kills child processes.
