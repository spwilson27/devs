# Sub-Epic: 23_Risk 006 Verification

## Overview
This sub-epic addresses verification requirements for **RISK-006** (coverage gate achievability) and **RISK-007** (template injection via attacker-controlled stage output). The tasks implement coverage reporting enhancements and template resolver security hardening to ensure the application meets quality gates and prevents injection attacks.

## Covered Requirements
All requirements in this sub-epic are covered by the following task documents:

| Requirement ID | Description | Task Document |
|----------------|-------------|---------------|
| [AC-RISK-006-03] | `delta_pct` in `report.json` is non-null and reflects the difference from the previous successful coverage run | `01_verify_coverage_details.md` |
| [AC-RISK-006-04] | `uncovered_lines` is populated for any failing gate and points to real source locations in the workspace | `01_verify_coverage_details.md` |
| [RISK-007] | Template injection via attacker-controlled stage output | `02_template_resolver_single_pass.md`, `03_template_resolver_scalar_restriction.md` |
| [RISK-007-BR-001] | `TemplateResolver::resolve()` MUST process the template string in a single left-to-right pass; after substituting a `{{...}}` expression, the scan position MUST advance to `end + 2` (past the closing `}}`), never to the beginning of the substituted value | `02_template_resolver_single_pass.md` |
| [RISK-007-BR-002] | Only scalar JSON types (string, number, boolean, null) from `stage.<name>.output.<field>` are permitted as template variable values; accessing a JSON object or array field MUST return `TemplateError::NonScalarField` before any partial substitution occurs | `03_template_resolver_scalar_restriction.md` |

## Task List

### Task 01: Verify Coverage Delta and Uncovered Line Accuracy
- **File**: `01_verify_coverage_details.md`
- **Dependencies**: `docs/plan/tasks/phase_5/22_risk_006_verification/01_coverage_gate_enforcement.md`
- **Summary**: Implements coverage reporting enhancements including:
  - Delta calculation: `delta_pct = actual_pct (current) - actual_pct (baseline)`
  - Ensuring `delta_pct` is non-null when baseline exists
  - Extracting `uncovered_lines` from `cargo-llvm-cov --format=json` output
  - Validating that uncovered line entries point to real source locations
  - Updating `target/coverage/report.json` schema to include these fields

### Task 02: Template Resolver Security: Single-Pass Enforcement
- **File**: `02_template_resolver_single_pass.md`
- **Dependencies**: `docs/plan/tasks/phase_1/03_template_resolution_context/02_strict_resolution_engine.md`
- **Summary**: Implements single-pass template resolution to prevent injection attacks:
  - Refactors `TemplateResolver::resolve()` to use single left-to-right pass
  - Ensures cursor advances to `end + 2` after each substitution
  - Prevents re-expansion of substituted values
  - Verifies nested template expressions resolve as literal strings
  - Unit tests for injection prevention

### Task 03: Template Resolver Security: Scalar Type Enforcement
- **File**: `03_template_resolver_scalar_restriction.md`
- **Dependencies**: `02_template_resolver_single_pass.md`
- **Summary**: Implements scalar-only restriction for template variable values:
  - Validates `serde_json::Value` type before substitution
  - Returns `TemplateError::NonScalarField` for JSON objects/arrays
  - Allows deeper path access to scalar leaf values
  - Handles boolean stringification (`true`/`false`)
  - Provides helpful error context for non-scalar fields

## Shared Components
This sub-epic **consumes** the following shared components:
- **./do Entrypoint Script & CI Pipeline**: Coverage orchestration and report generation
- **Traceability & Coverage Infrastructure**: `// Covers:` annotation convention, `target/coverage/report.json` output, `target/traceability.json` generation
- **devs-core**: Domain types including `TemplateResolver`, `TemplateContext`, `TemplateError`

This sub-epic does **not own** any shared components from the SHARED COMPONENTS manifest.

## Execution Order
Tasks should be executed in the following order:
1. `01_verify_coverage_details.md` (depends on 22_risk_006_verification/01_coverage_gate_enforcement.md)
2. `02_template_resolver_single_pass.md` (depends on phase_1 template resolution implementation)
3. `03_template_resolver_scalar_restriction.md` (depends on Task 02)

## Verification
Upon completion of all tasks:
- `./do coverage` produces `target/coverage/report.json` with `delta_pct` field reflecting coverage change from baseline
- `target/coverage/report.json` contains `uncovered_lines` entries with valid file paths and line numbers for failing gates
- `TemplateResolver::resolve()` processes templates in a single left-to-right pass without re-expanding substituted values
- `TemplateResolver` returns `TemplateError::NonScalarField` when attempting to substitute JSON objects or arrays
- All 5 requirements ([AC-RISK-006-03], [AC-RISK-006-04], [RISK-007], [RISK-007-BR-001], [RISK-007-BR-002]) are verified by automated tests with `// Covers:` annotations
- `./do test` reports 100% traceability for all requirements in this sub-epic
