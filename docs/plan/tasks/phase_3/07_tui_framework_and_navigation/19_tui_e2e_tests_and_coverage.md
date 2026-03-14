# Task: TUI E2E Tests and Coverage Gate Enforcement (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-424], [6_UI_UX_ARCHITECTURE-REQ-425], [6_UI_UX_ARCHITECTURE-REQ-426], [6_UI_UX_ARCHITECTURE-REQ-427], [6_UI_UX_ARCHITECTURE-REQ-428], [6_UI_UX_ARCHITECTURE-REQ-429], [6_UI_UX_ARCHITECTURE-REQ-430], [6_UI_UX_ARCHITECTURE-REQ-431], [6_UI_UX_ARCHITECTURE-REQ-433], [6_UI_UX_ARCHITECTURE-REQ-439], [6_UI_UX_ARCHITECTURE-REQ-440], [6_UI_UX_ARCHITECTURE-REQ-441], [6_UI_UX_ARCHITECTURE-REQ-442], [6_UI_UX_ARCHITECTURE-REQ-443], [6_UI_UX_ARCHITECTURE-REQ-444], [6_UI_UX_ARCHITECTURE-REQ-445], [6_UI_UX_ARCHITECTURE-REQ-446], [6_UI_UX_ARCHITECTURE-REQ-447], [6_UI_UX_ARCHITECTURE-REQ-448], [6_UI_UX_ARCHITECTURE-REQ-449], [6_UI_UX_ARCHITECTURE-REQ-450], [6_UI_UX_ARCHITECTURE-REQ-451], [6_UI_UX_ARCHITECTURE-REQ-452], [6_UI_UX_ARCHITECTURE-REQ-453], [6_UI_UX_ARCHITECTURE-REQ-454], [6_UI_UX_ARCHITECTURE-REQ-455], [6_UI_UX_ARCHITECTURE-REQ-456], [6_UI_UX_ARCHITECTURE-REQ-457], [6_UI_UX_ARCHITECTURE-REQ-458], [6_UI_UX_ARCHITECTURE-REQ-459], [6_UI_UX_ARCHITECTURE-REQ-460], [6_UI_UX_ARCHITECTURE-REQ-461], [6_UI_UX_ARCHITECTURE-REQ-462], [6_UI_UX_ARCHITECTURE-REQ-463], [6_UI_UX_ARCHITECTURE-REQ-464], [6_UI_UX_ARCHITECTURE-REQ-465], [6_UI_UX_ARCHITECTURE-REQ-466], [6_UI_UX_ARCHITECTURE-REQ-467], [6_UI_UX_ARCHITECTURE-REQ-468], [6_UI_UX_ARCHITECTURE-REQ-469], [6_UI_UX_ARCHITECTURE-REQ-470], [6_UI_UX_ARCHITECTURE-REQ-471], [6_UI_UX_ARCHITECTURE-REQ-472], [6_UI_UX_ARCHITECTURE-REQ-473]

## Dependencies
- depends_on: ["12_dashboard_tab_assembly.md", "13_logs_tab.md", "14_debug_tab.md", "15_pools_tab.md", "16_keyboard_input_and_focus_management.md", "18_snapshot_testing_infrastructure.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written
- [ ] Write TUI E2E test: full event loop cycle — create App with TestBackend, send key events via handle_event(), verify rendered output via snapshot (REQ-412, REQ-468)
- [ ] Write TUI E2E test: tab switching cycle — press `1`, `2`, `3`, `4`, verify each tab renders correctly (REQ-469)
- [ ] Write TUI E2E test: run selection flow — populate AppState with runs, press `j`, `Enter`, verify detail pane appears (REQ-470)
- [ ] Write TUI E2E test: reconnect display — set ConnectionStatus::Reconnecting, render, verify StatusBar shows RECONNECTING (REQ-471)
- [ ] Write TUI E2E test: help overlay — press `?`, verify overlay renders, press any key, verify it dismisses (REQ-472)
- [ ] Write TUI E2E test: minimum terminal size — render at 79×23, verify error message (REQ-473)
- [ ] Write E2E tests for exit code scenarios: unknown run → code 2, server unreachable → code 3, validation error → code 4, success → code 0 (REQ-439-445)
- [ ] Write E2E test for `devs logs --follow` exit behavior: exits 0 on Completed, 1 on Failed (REQ-446)
- [ ] Write test with `// Covers: 6_UI_UX_ARCHITECTURE-REQ-NNN` annotations for traceability (REQ-464)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/tests/e2e/` directory for E2E test files
- [ ] Implement comprehensive E2E test suite covering all tabs, navigation flows, and edge cases
- [ ] Add `// Covers: REQ-ID` annotations to all E2E tests for traceability scanning (REQ-464)
- [ ] Implement E2E tests for all exit code scenarios (REQ-439-455):
  - Success (code 0): submit, cancel, list, status on running, logs on completed
  - Failed (code 1): logs --follow on failed run, general errors
  - Not found (code 2): unknown run ID, unknown stage
  - Unreachable (code 3): no server, discovery failure
  - Validation (code 4): missing required input, duplicate run name, bad arguments
- [ ] Implement E2E tests for MCP bridge behavior (REQ-459-463): invalid JSON handling, sequential processing, streaming responses
- [ ] Ensure `./do coverage` can measure TUI E2E coverage via TestBackend full cycle (REQ-412)
- [ ] Target ≥50% TUI E2E line coverage (REQ-412)
- [ ] Ensure `./do test` generates `target/traceability.json` entries for TUI tests (REQ-464)

## 3. Code Review
- [ ] Verify all `// Covers:` annotations reference valid requirement IDs (REQ-464)
- [ ] Verify E2E tests exercise full handle_event → render cycle, not just unit functions (REQ-412)
- [ ] Verify exit code tests cover all specified scenarios (REQ-439-455)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and verify all pass
- [ ] Run `./do coverage` and verify TUI E2E coverage ≥50% (QG-004)

## 5. Update Documentation
- [ ] Document E2E test patterns in test module doc comments

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `grep -r "// Covers:" crates/devs-tui/tests/ | wc -l` and confirm non-zero count
- [ ] Run `./do coverage` and verify QG-004 gate passes
