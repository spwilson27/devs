# Sub-Epic: 21_Risk 005 Verification

## Overview
This sub-epic focuses on verifying risk mitigation measures related to CI performance thresholds and coverage gate constraints. It ensures that the aggressive coverage requirements (90%/80%/50% gates) are achievable within the MVP timeline and that presubmit checks complete within budgeted time limits.

## Covered Requirements
| Requirement ID | Description |
|---|---|
| [AC-RISK-005-03] | All three CI jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) complete within their respective 25-minute CI timeout. |
| [AC-RISK-005-04] | `./do presubmit` on a clean checkout (no `target/` cache) completes within 15 minutes on the GitLab `presubmit-linux` runner. |
| [RISK-006] | High Coverage Gate Unachievability — The coverage requirements are unusually aggressive; infrastructure code is hard to cover. |
| [RISK-006-BR-001] | Coverage exclusions via `// llvm-cov:ignore` are only permitted for platform-conditional branches, unreachable error paths, and generated code. Business logic exclusions are prohibited. |
| [RISK-006-BR-002] | Calling an internal Rust function directly in a `#[test]` function does NOT satisfy QG-003, QG-004, or QG-005 coverage requirements; only tests exercising the interface boundary count. |

## Task List
| Task File | Covered Requirements | Dependencies |
|---|---|---|
| [01_verify_ci_performance_thresholds.md](./01_verify_ci_performance_thresholds.md) | [AC-RISK-005-03], [AC-RISK-005-04] | none |
| [02_verify_coverage_exclusion_constraints.md](./02_verify_coverage_exclusion_constraints.md) | [RISK-006], [RISK-006-BR-001] | 01_verify_ci_performance_thresholds.md |
| [03_verify_e2e_coverage_isolation.md](./03_verify_e2e_coverage_isolation.md) | [RISK-006-BR-002] | 02_verify_coverage_exclusion_constraints.md |

## Shared Components
| Component | Role | Tasks |
|---|---|---|
| ./do Entrypoint Script | **Owner**: Phase 0 / Sub-Epic: ./do Entrypoint Script & CI Pipeline. **Consumer**: All tasks in this sub-epic use the `./do presubmit`, `./do lint`, and `./do coverage` commands. | 01, 02, 03 |

## Execution Order
1. **Task 01**: Verify CI Performance Thresholds
   - Sets up presubmit timing infrastructure
   - Configures CI timeout thresholds
   - No dependencies — can start immediately

2. **Task 02**: Verify Coverage Exclusion Constraints
   - Implements `// llvm-cov:ignore` annotation validation
   - Ensures exclusions comply with RISK-006-BR-001
   - Depends on Task 01 (presubmit infrastructure must be in place)

3. **Task 03**: Verify E2E Coverage Isolation
   - Implements coverage aggregation with unit/E2E isolation
   - Ensures QG-003, QG-004, QG-005 are calculated only from legitimate interface tests
   - Depends on Task 02 (exclusion validation must be in place first)

## Verification Strategy
Each task follows mandatory TDD discipline (Red-Green-Refactor):
1. **Initial Test Written**: Tests are written FIRST before any implementation code.
2. **Task Implementation**: Code is implemented to make tests pass.
3. **Code Review**: Self-review against architectural patterns and quality metrics.
4. **Run Automated Tests**: Execute tests to verify implementation.
5. **Update Documentation**: Update specs and agent memory with implementation details.
6. **Automated Verification**: Run `.tools/verify_requirements.py` to confirm requirement coverage.

## Acceptance Criteria
- [ ] All 5 requirements ([AC-RISK-005-03], [AC-RISK-005-04], [RISK-006], [RISK-006-BR-001], [RISK-006-BR-002]) are verified by passing tests.
- [ ] `target/traceability.json` shows 100% coverage for all requirements in this sub-epic.
- [ ] `./do presubmit` completes within 15 minutes on clean checkout.
- [ ] CI jobs complete within 25-minute timeout on all 3 platforms.
- [ ] `./do lint` fails on invalid `// llvm-cov:ignore` annotations.
- [ ] `target/coverage/report.json` correctly isolates unit-only coverage from E2E gates.
- [ ] All task documents are completed and committed to `docs/plan/tasks/phase_5/21_risk_005_verification/`.

## Related Sub-Epics
- **22_Risk 006 Verification**: Covers [RISK-006-BR-003], [RISK-006-BR-004], [MIT-006], [AC-RISK-006-01], [AC-RISK-006-02] (coverage delta tracking and excluded lines validation).
- **23_Risk 006 Verification**: Covers [AC-RISK-006-03], [AC-RISK-006-04] and additional risk requirements.
- **07_Risk 001 Verification**: Covers other risk verification tasks.

## Notes
- This sub-epic is part of Phase 5: Quality Hardening & MVP Release.
- All work follows TDD discipline as mandated by Phase 5 objectives.
- The aggressive coverage gates (QG-001 through QG-005) are a key MVP release criterion.
