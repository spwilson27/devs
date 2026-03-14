# Task: Phase 1 Coverage QG-001 Gate and Cargo Doc Zero Warnings (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-009]

## Dependencies
- depends_on: ["02_checkpoint_resilience_tests.md", "03_adapter_quality_and_freshness_verification.md", "04_architectural_lint_enforcement.md", "05_pool_and_executor_lifecycle_tests.md"]
- shared_components: ["Traceability & Coverage Infrastructure", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] In `tests/coverage_gate/phase_1_qg001.rs`, write a test `test_qg001_phase1_crates_90_percent` that: (1) runs `./do coverage` via `std::process::Command`, (2) reads `target/coverage/report.json`, (3) for each of the 5 Phase 1 crates (`devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor`), extracts the `line_coverage_pct` value, and (4) asserts each is `>= 90.0`. Annotate with `// Covers: AC-ROAD-P1-009`.
- [ ] Write a test `test_cargo_doc_zero_warnings` that runs `cargo doc --workspace --no-deps` with `RUSTDOCFLAGS="-D warnings"` and asserts exit code 0. Annotate with `// Covers: AC-ROAD-P1-009`.

## 2. Task Implementation
- [ ] Ensure `./do coverage` produces `target/coverage/report.json` with per-crate coverage data. The JSON should have a structure like `{ "crates": { "devs-config": { "line_coverage_pct": 92.3 }, ... } }`.
- [ ] If the coverage report format does not yet include per-crate breakdowns, extend the coverage tooling (likely `cargo-llvm-cov` or `cargo-tarpaulin`) output parsing in `./do coverage` to produce this.
- [ ] Ensure all Phase 1 crate source files have sufficient tests to reach 90% line coverage. This task is the gate — if coverage is below 90%, the test fails and blocks the phase transition.
- [ ] Ensure all public items in Phase 1 crates have doc comments (required for `cargo doc -D warnings`).

## 3. Code Review
- [ ] Verify the coverage gate test reads the actual coverage report, not a cached/stale version.
- [ ] Verify the test checks all 5 crates individually, not an aggregate number.
- [ ] Verify `cargo doc` test uses `-D warnings` to treat warnings as errors.

## 4. Run Automated Tests to Verify
- [ ] Run `./do coverage` and confirm it produces `target/coverage/report.json` with all 5 crates at >= 90%.
- [ ] Run `cargo doc --workspace --no-deps` with `RUSTDOCFLAGS="-D warnings"` and confirm exit code 0.

## 5. Update Documentation
- [ ] No additional documentation needed beyond existing doc comments.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm it passes end-to-end, which includes coverage gates and lint.
- [ ] Run `grep -r "AC-ROAD-P1-009" tests/` and confirm matches.
