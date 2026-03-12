# Task: E2E Interface Coverage Quality Gates (QG-002–QG-005) (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-051]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Extend `tests/test_coverage_gates.py` to:
    - Generate a synthetic `report.json` where QG-002 (E2E aggregate) is 79.9% and verify it fails [1_PRD-REQ-051].
    - Generate a synthetic `report.json` where one of the interface gates (QG-003 CLI, QG-004 TUI, or QG-005 MCP) is 49.9% and verify it fails [1_PRD-REQ-051].
    - Verify that the report contains exactly 5 gate entries (QG-001 through QG-005) [4_USER_FEATURES-AC-3-DO-005].
    - Verify that QG-003 coverage only includes lines exercised via binary subprocess (e.g., using `assert_cmd`) [6_UI_UX_ARCHITECTURE-REQ-411].

## 2. Task Implementation
- [ ] Implement the logic in `./do coverage` to measure E2E coverage separately for:
    - **Aggregate E2E** (QG-002, 80%): All tests that are NOT unit tests [1_PRD-REQ-051].
    - **CLI E2E** (QG-003, 50%): Tests that invoke the binary as a subprocess [6_UI_UX_ARCHITECTURE-REQ-411].
    - **TUI E2E** (QG-004, 50%): Tests that use `TestBackend` and the full render cycle [6_UI_UX_ARCHITECTURE-REQ-412].
    - **MCP E2E** (QG-005, 50%): Tests that use the bridge/server POST interface [6_UI_UX_ARCHITECTURE-REQ-413].
- [ ] Implement the threshold checks for each of these 4 gates.
- [ ] Ensure the coverage report contains the `actual_pct`, `threshold_pct`, and `passed` status for all 4 gates.
- [ ] Ensure the overall command exits non-zero if ANY of these gates fail.

## 3. Code Review
- [ ] Verify that E2E coverage is measured independently from unit coverage [3_MCP_DESIGN-REQ-DBG-BR-014].
- [ ] Ensure that "calling internal Rust functions directly" does NOT satisfy interface gates QG-003, QG-004, or QG-005 [RISK-006-BR-002].
- [ ] Ensure that E2E tests are correctly tagged (e.g., using `#[cfg(feature = "e2e")]` or by directory).

## 4. Run Automated Tests to Verify
- [ ] Run the extended `tests/test_coverage_gates.py`.
- [ ] Run a minimal E2E test for each interface and verify the coverage is attributed correctly.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to document the 5-gate coverage enforcement structure.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify the `target/coverage/report.json` contains all 5 gates with correct statuses.
