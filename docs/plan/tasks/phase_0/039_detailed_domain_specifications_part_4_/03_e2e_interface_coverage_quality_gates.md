# Task: E2E Interface Coverage Quality Gates (QG-002 through QG-005) (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-051]

## Dependencies
- depends_on: ["02_unit_test_coverage_quality_gate.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline" (consume), "Traceability & Coverage Infrastructure" (consume)]

## 1. Initial Test Written
- [ ] Create `tests/coverage/test_qg002_005_e2e_gates.sh` that:
    - Generates a synthetic `target/coverage/report.json` with all 5 gates (QG-001 through QG-005). Set QG-002 `actual_pct: 79.9` (below 80% threshold). Run the gate checker and assert it exits non-zero with `QG-002 FAILED: 79.9% < 80.0%`.
    - Generates a report where QG-002 passes (80.1%) but QG-003 (CLI) has `actual_pct: 49.9` (below 50%). Assert the checker exits non-zero with `QG-003 FAILED`.
    - Generates a report where QG-004 (TUI) is 49.9%. Assert failure.
    - Generates a report where QG-005 (MCP) is 49.9%. Assert failure.
    - Generates a report where all 5 gates pass (QG-001: 91%, QG-002: 81%, QG-003: 51%, QG-004: 51%, QG-005: 51%). Assert the checker exits zero.
    - Asserts the report contains exactly 5 gate entries.
- [ ] Create a Rust test `tests/coverage/e2e_test_categorization_test.rs` that verifies:
    - A test file in `tests/cli/` is categorized as CLI E2E (QG-003).
    - A test file in `tests/tui/` using `TestBackend` is categorized as TUI E2E (QG-004).
    - A test file in `tests/mcp/` is categorized as MCP E2E (QG-005).
    - A test in `src/lib.rs` `#[cfg(test)]` module is categorized as unit only (QG-001), NOT E2E.

## 2. Task Implementation
- [ ] Extend `./do coverage` to run E2E tests separately from unit tests using `cargo llvm-cov` with appropriate test binary filtering:
    - **QG-002 (E2E aggregate, 80%)**: Run all test binaries in `tests/` directory (integration tests). Measure combined line coverage.
    - **QG-003 (CLI E2E, 50%)**: Run only test binaries matching `tests/cli/**` or tests tagged with `#[cfg(feature = "e2e_cli")]`. These must invoke the `devs` binary as a subprocess (e.g., via `assert_cmd`).
    - **QG-004 (TUI E2E, 50%)**: Run only test binaries matching `tests/tui/**` or tagged `#[cfg(feature = "e2e_tui")]`. These must use `ratatui::backend::TestBackend` with full render cycle.
    - **QG-005 (MCP E2E, 50%)**: Run only test binaries matching `tests/mcp/**` or tagged `#[cfg(feature = "e2e_mcp")]`. These must connect via the MCP bridge/server interface.
- [ ] Write each gate's result as a separate entry in `target/coverage/report.json` alongside QG-001.
- [ ] Ensure the gate checker (from task 02) already handles all 5 gates generically — no special-casing needed.
- [ ] Hardcode thresholds: QG-002 = 80.0%, QG-003 = 50.0%, QG-004 = 50.0%, QG-005 = 50.0%.
- [ ] Ensure `overall_passed` in the report is `false` if ANY of the 5 gates fails.

## 3. Code Review
- [ ] Verify E2E coverage is measured completely independently from unit coverage — no double-counting of lines.
- [ ] Verify that calling internal Rust functions directly (not through CLI/TUI/MCP) does NOT count toward QG-003, QG-004, or QG-005.
- [ ] Verify each interface gate measures only tests that go through that specific interface.
- [ ] Verify thresholds are hardcoded literals.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/coverage/test_qg002_005_e2e_gates.sh` — all boundary assertions must pass.
- [ ] Run `./do coverage` and verify `target/coverage/report.json` contains exactly 5 gate entries.

## 5. Update Documentation
- [ ] Document the E2E test directory conventions (`tests/cli/`, `tests/tui/`, `tests/mcp/`) and how each interface's coverage is measured.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify: `python3 -c "import json; d=json.load(open('target/coverage/report.json')); assert len(d['gates'])==5; assert all(g['passed'] for g in d['gates']); print('All 5 gates passed')"`.
