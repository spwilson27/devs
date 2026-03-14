# Sub-Epic: 22_Risk 006 Verification

## Overview
This sub-epic addresses **RISK-006**: The risk that the 90%/80%/50% coverage gates (QG-001 through QG-005) are unachievable within the MVP timeline. The tasks in this sub-epic implement the infrastructure and validation logic to ensure coverage gates are properly enforced, tracked, and validated.

## Covered Requirements
All requirements in this sub-epic are covered by the following task documents:

| Requirement ID | Description | Task Document |
|----------------|-------------|---------------|
| [AC-RISK-006-01] | `./do coverage` exits non-zero when any of QG-001–QG-005 fails | `01_coverage_gate_enforcement.md` |
| [AC-RISK-006-02] | `target/coverage/report.json` contains exactly 5 gate entries with `gate_id` values `QG-001` through `QG-005` | `01_coverage_gate_enforcement.md` |
| [MIT-006] | Mitigation for coverage gate unachievability risk | `01_coverage_gate_enforcement.md` |
| [RISK-006-BR-003] | The `delta_pct` field in `report.json` compares against the most recent `report.json` artifact committed to the GitLab CI 7 days artifact store; a missing baseline causes `delta_pct: null` (not an error) | `02_coverage_delta_tracking.md` |
| [RISK-006-BR-004] | `target/coverage/excluded_lines.txt` MUST be committed alongside source changes that introduce new `// llvm-cov:ignore` annotations; `./do lint` MUST fail if an annotation exists in source but is absent from `excluded_lines.txt` | `03_excluded_lines_validation.md` |

## Task List

### Task 01: Coverage Gate Enforcement & Report Generation
- **File**: `01_coverage_gate_enforcement.md`
- **Dependencies**: none
- **Summary**: Implements the core coverage gate enforcement infrastructure including:
  - Definition of 5 mandatory gates (QG-001 through QG-005)
  - Coverage orchestration script using `cargo-llvm-cov`
  - JSON report generation at `target/coverage/report.json`
  - Non-zero exit code enforcement when any gate fails

### Task 02: GitLab CI Coverage Delta Tracking
- **File**: `02_coverage_delta_tracking.md`
- **Dependencies**: `01_coverage_gate_enforcement.md`
- **Summary**: Implements coverage delta tracking against GitLab CI baseline artifacts:
  - Fetches most recent `report.json` from GitLab CI artifact store
  - Computes `delta_pct = actual_pct (current) - actual_pct (baseline)`
  - Handles missing baseline gracefully (`delta_pct: null`)
  - Warns on regression > -0.5%

### Task 03: Excluded Lines Integrity Check
- **File**: `03_excluded_lines_validation.md`
- **Dependencies**: `01_coverage_gate_enforcement.md`
- **Summary**: Implements validation for `// llvm-cov:ignore` annotations:
  - Scans workspace for `// llvm-cov:ignore` annotations
  - Validates each annotation has corresponding entry in `target/coverage/excluded_lines.txt`
  - Validates each annotation has justification comment
  - Integrated into `./do lint` with failure on missing entries

## Shared Components
This sub-epic **consumes** the following shared components:
- **./do Entrypoint Script**: Coverage and lint integration points
- **Traceability & Coverage Infrastructure**: `// Covers:` annotation convention, `target/traceability.json` output

This sub-epic does **not own** any shared components from the SHARED COMPONENTS manifest.

## Execution Order
Tasks should be executed in the following order:
1. `01_coverage_gate_enforcement.md` (no dependencies)
2. `02_coverage_delta_tracking.md` (depends on Task 01)
3. `03_excluded_lines_validation.md` (depends on Task 01)

## Verification
Upon completion of all tasks:
- `./do coverage` exits non-zero when any QG gate fails
- `target/coverage/report.json` contains all 5 gates with correct schema
- `delta_pct` is computed against GitLab CI baseline (or `null` if missing)
- `./do lint` fails if `// llvm-cov:ignore` annotations are not documented in `excluded_lines.txt`
- All 5 requirements ([RISK-006-BR-003], [RISK-006-BR-004], [MIT-006], [AC-RISK-006-01], [AC-RISK-006-02]) are verified by automated tests
