# Phase 5: Quality Hardening & MVP Release

## Objective
Finalize the quality, reliability, and security of the `devs` platform to meet all MVP release criteria (SO-2, SO-3). This phase is executed primarily through automated agentic development, achieving the required coverage gates across all interfaces and ensuring 100% requirement traceability.

## Requirements Covered
- [2_TAS-REQ-082]: E2E tests for CLI, TUI, and MCP
- [3_MCP_DESIGN-REQ-042]: Agent next requirement selection
- [3_MCP_DESIGN-REQ-043]: Agent uncovered line selection
- [3_MCP_DESIGN-REQ-044]: Agent coverage report usage
- [3_MCP_DESIGN-REQ-055]: Agent TDD loop termination
- [3_MCP_DESIGN-REQ-056]: Agent traceability verification
- [3_MCP_DESIGN-REQ-082]: Agent coverage gate verification
- [3_MCP_DESIGN-REQ-AC-3.20]: stream_logs pagination
- [3_MCP_DESIGN-REQ-AC-5.15]: list_runs loop termination check
- [3_MCP_DESIGN-REQ-BR-036]: Agent retry attempt management
- [3_MCP_DESIGN-REQ-DBG-BR-000]: Quality gate enforcement
- [AC-RISK-001-01] [AC-RISK-001-02] [AC-RISK-001-03] [AC-RISK-001-04] [AC-RISK-001-05] [AC-RISK-001-06] [AC-RISK-002-01] [AC-RISK-002-02] [AC-RISK-002-03] [AC-RISK-002-04] [AC-RISK-003-01] [AC-RISK-003-02] [AC-RISK-003-03] [AC-RISK-003-04] [AC-RISK-004-01] [AC-RISK-004-02] [AC-RISK-004-03] [AC-RISK-004-04] [AC-RISK-005-01] [AC-RISK-005-02] [AC-RISK-005-03] [AC-RISK-005-04] [AC-RISK-006-01] [AC-RISK-006-02] [AC-RISK-006-03] [AC-RISK-006-04] [AC-RISK-007-01] [AC-RISK-007-02] [AC-RISK-007-03] [AC-RISK-007-04] [AC-RISK-007-05] [AC-RISK-008-01] [AC-RISK-008-02] [AC-RISK-008-03] [AC-RISK-008-04] [AC-RISK-009-01] [AC-RISK-009-02] [AC-RISK-009-03] [AC-RISK-009-04] [AC-RISK-009-05] [AC-RISK-010-01] [AC-RISK-010-02] [AC-RISK-010-03] [AC-RISK-010-04] [AC-RISK-010-05] [AC-RISK-011-01] [AC-RISK-011-02] [AC-RISK-011-03] [AC-RISK-011-04] [AC-RISK-012-01] [AC-RISK-012-02] [AC-RISK-012-03] [AC-RISK-012-04] [AC-RISK-012-05] [AC-RISK-013-01] [AC-RISK-013-02] [AC-RISK-013-03] [AC-RISK-013-04] [AC-RISK-014-01] [AC-RISK-014-02] [AC-RISK-014-03] [AC-RISK-014-04] [AC-RISK-015-01] [AC-RISK-015-02] [AC-RISK-015-03] [AC-RISK-015-04] [AC-RISK-016-01] [AC-RISK-016-02] [AC-RISK-016-03] [AC-RISK-016-04] [AC-RISK-016-05] [AC-RISK-021-01] [AC-RISK-021-02] [AC-RISK-021-03] [AC-RISK-021-04] [AC-RISK-021-05] [AC-RISK-021-06] [AC-RISK-022-01] [AC-RISK-022-02] [AC-RISK-022-03] [AC-RISK-022-04] [AC-RISK-023-01] [AC-RISK-023-02] [AC-RISK-023-03] [AC-RISK-023-04] [AC-RISK-024-01] [AC-RISK-024-02] [AC-RISK-024-03] [AC-RISK-024-04] [AC-RISK-024-05] [AC-RISK-025-01] [AC-RISK-025-02] [AC-RISK-025-03] [AC-RISK-025-04] [AC-RISK-025-05] [AC-RISK-MATRIX-001] [AC-RISK-MATRIX-002] [AC-RISK-MATRIX-003] [AC-RISK-MATRIX-004] [AC-RISK-MATRIX-005] [AC-RISK-MATRIX-006] [AC-RISK-MATRIX-007] [AC-RISK-MATRIX-008] [AC-RISK-MATRIX-009] [AC-RISK-MATRIX-010] [AC-ROAD-P5-001] [AC-ROAD-P5-002] [AC-ROAD-P5-003] [AC-ROAD-P5-005] [AC-ROAD-P5-006] [AC-ROAD-P5-007] [MIT-001] [MIT-002] [MIT-003] [MIT-004] [MIT-005] [MIT-006] [MIT-007] [MIT-008] [MIT-009] [MIT-010] [MIT-011] [MIT-012] [MIT-013] [MIT-014] [MIT-015] [MIT-016] [MIT-021] [MIT-022] [MIT-023] [MIT-024] [MIT-025] [MIT-NNN] [RISK-001] [RISK-001-BR-001] [RISK-001-BR-002] [RISK-001-BR-003] [RISK-001-BR-004] [RISK-002] [RISK-002-BR-001] [RISK-002-BR-002] [RISK-002-BR-003] [RISK-002-BR-004] [RISK-003] [RISK-003-BR-001] [RISK-003-BR-002] [RISK-003-BR-003] [RISK-003-BR-004] [RISK-004] [RISK-004-BR-001] [RISK-004-BR-002] [RISK-004-BR-003] [RISK-004-BR-004] [RISK-005] [RISK-005-BR-001] [RISK-005-BR-002] [RISK-005-BR-003] [RISK-005-BR-004] [RISK-006] [RISK-006-BR-001] [RISK-006-BR-002] [RISK-006-BR-003] [RISK-006-BR-004] [RISK-007] [RISK-007-BR-001] [RISK-007-BR-002] [RISK-007-BR-003] [RISK-007-BR-004] [RISK-008] [RISK-008-BR-001] [RISK-008-BR-002] [RISK-008-BR-003] [RISK-008-BR-004] [RISK-009] [RISK-009-BR-001] [RISK-009-BR-002] [RISK-009-BR-003] [RISK-009-BR-004] [RISK-009-BR-005] [RISK-009-BR-006] [RISK-010] [RISK-010-BR-001] [RISK-010-BR-002] [RISK-010-BR-003] [RISK-010-BR-004] [RISK-010-BR-005] [RISK-011] [RISK-011-BR-001] [RISK-011-BR-002] [RISK-011-BR-003] [RISK-011-BR-004] [RISK-012] [RISK-012-BR-001] [RISK-012-BR-002] [RISK-012-BR-003] [RISK-012-BR-004] [RISK-012-BR-005] [RISK-013] [RISK-013-BR-001] [RISK-013-BR-002] [RISK-013-BR-003] [RISK-013-BR-004] [RISK-013-BR-005] [RISK-014] [RISK-014-BR-001] [RISK-014-BR-002] [RISK-014-BR-003] [RISK-014-BR-004] [RISK-015] [RISK-015-BR-001] [RISK-015-BR-002] [RISK-015-BR-003] [RISK-015-BR-004] [RISK-016] [RISK-016-BR-001] [RISK-016-BR-002] [RISK-016-BR-003] [RISK-016-BR-004] [RISK-016-BR-005] [RISK-021] [RISK-021-BR-001] [RISK-021-BR-002] [RISK-021-BR-003] [RISK-021-BR-004] [RISK-022] [RISK-022-BR-001] [RISK-022-BR-002] [RISK-022-BR-003] [RISK-022-BR-004] [RISK-023] [RISK-023-BR-001] [RISK-023-BR-002] [RISK-023-BR-003] [RISK-023-BR-004] [RISK-024] [RISK-024-BR-001] [RISK-024-BR-002] [RISK-024-BR-003] [RISK-024-BR-004] [RISK-025] [RISK-025-BR-001] [RISK-025-BR-002] [RISK-025-BR-003] [RISK-025-BR-004] [RISK-BR-001] [RISK-BR-002] [RISK-BR-003] [RISK-BR-004] [RISK-BR-005] [RISK-BR-006] [RISK-BR-007] [RISK-BR-008] [RISK-BR-009] [RISK-BR-010] [RISK-BR-011] [RISK-BR-012] [RISK-BR-013] [RISK-BR-014] [RISK-BR-015] [RISK-BR-016] [RISK-BR-017] [RISK-BR-018] [RISK-BR-019] [RISK-BR-020] [RISK-NNN] [ROAD-P5-DEP-001] [ROAD-P5-DEP-002] [ROAD-P5-DEP-003]

## Detailed Deliverables & Components
### Coverage & Quality Hardening (QG-001–005)
- Achieve ≥90% unit test coverage for all core crates.
- Achieve ≥80% aggregate E2E test coverage across all three platforms.
- Achieve ≥50% E2E test coverage individually for the CLI, TUI, and MCP interfaces.
- Ensure all coverage results are verified in a single `./do coverage` run.

### Requirement Traceability
- Achieve 100% requirement traceability (`traceability_pct == 100.0`).
- Ensure every requirement in `requirements.md` is verified by an automated test.
- Resolve all `stale_annotations` reported by the traceability tool.

### Security & Compliance
- Run `cargo audit --deny warnings` and address all CRITICAL or HIGH severity advisories.
- Remove all `// TODO: BOOTSTRAP-STUB` annotations from the codebase.
- Validate the final security baseline on all supported OS platforms.

### Documentation & Release
- Finalize all doc comments for public items.
- Tag the MVP release milestone and prepare release artifacts.

## Technical Considerations
- **E2E Testing boundaries:** Ensure CLI tests use `assert_cmd`, TUI tests use `TestBackend`, and MCP tests use `POST /mcp/v1/call`.
- **Concurrent Coverage:** Run E2E and unit tests in a combined coverage suite to satisfy aggregate gate requirements.
- **Traceability Verification:** Use `.tools/verify_requirements.py` to confirm 100% coverage of requirements.
