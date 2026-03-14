# Sub-Epic: 24_Risk 007 Verification

## Overview
This sub-epic verifies the template injection risk mitigation (RISK-007) through implementation of output truncation, acceptance tests for single-pass resolution and scalar-only fields, and final mitigation verification.

## Requirement Coverage Matrix

| Requirement ID | Task File | Status |
|----------------|-----------|--------|
| RISK-007-BR-003 | `01_template_output_truncation_implementation.md` | Covered |
| RISK-007-BR-004 | `01_template_output_truncation_implementation.md` | Covered |
| MIT-007 | `03_risk_007_mitigation_verification.md` | Covered |
| AC-RISK-007-01 | `02_template_resolution_acceptance_tests.md` | Covered |
| AC-RISK-007-02 | `02_template_resolution_acceptance_tests.md` | Covered |

## Task List

### Task 01: Template Output Truncation Implementation
- **File:** `01_template_output_truncation_implementation.md`
- **Covered Requirements:** RISK-007-BR-003, RISK-007-BR-004
- **Dependencies:** 
  - `docs/plan/tasks/phase_1/03_template_resolution_context/01_template_resolver_skeleton.md`
- **Shared Components:** `devs-core`
- **Summary:** Implements 10,240-byte truncation of stdout/stderr in template context, preserving the last bytes (most recent content) consistent with BoundedBytes truncation semantics.

### Task 02: Template Resolution Acceptance Tests
- **File:** `02_template_resolution_acceptance_tests.md`
- **Covered Requirements:** AC-RISK-007-01, AC-RISK-007-02
- **Dependencies:**
  - `docs/plan/tasks/phase_5/23_risk_006_verification/02_template_resolver_single_pass.md`
  - `docs/plan/tasks/phase_5/23_risk_006_verification/03_template_resolver_scalar_restriction.md`
- **Shared Components:** `devs-core`
- **Summary:** Implements acceptance tests verifying single-pass expansion (no recursive template injection) and scalar-only field enforcement (NonScalarField error for JSON objects/arrays).

### Task 03: Risk 007 Mitigation Verification
- **File:** `03_risk_007_mitigation_verification.md`
- **Covered Requirements:** MIT-007
- **Dependencies:**
  - `01_template_output_truncation_implementation.md`
  - `02_template_resolution_acceptance_tests.md`
- **Shared Components:** `devs-core`
- **Summary:** Final audit and verification that all RISK-007 mitigations are correctly implemented, including integration-level scenario tests.

## Execution Order

1. **Task 01** - Template Output Truncation Implementation (can start after phase_1 dependency)
2. **Task 02** - Template Resolution Acceptance Tests (can start after risk_006_verification tasks)
3. **Task 03** - Risk 007 Mitigation Verification (depends on Task 01 and Task 02)

## Shared Component Usage

### devs-core (Owner: Phase 0)
This sub-epic is a **Consumer** of the `devs-core` shared component. All implementation and tests are within the `devs-core` crate:
- Template resolver implementation: `crates/devs-core/src/template/resolver.rs`
- Template context: `crates/devs-core/src/template/context.rs`
- Test files: `crates/devs-core/src/template/tests.rs`, `crates/devs-core/tests/risk_mitigation_ac_tests.rs`, `crates/devs-core/tests/risk_007_final_audit.rs`

## Verification Gates

- **Unit Tests:** All tests in `devs-core` template module must pass
- **Coverage:** `devs-core` must achieve ≥90% line coverage (QG-001)
- **Traceability:** `// Covers:` annotations must map to all 5 requirement IDs
- **Integration:** Final audit test suite must pass all scenarios

## Related Documentation

- Requirements: `docs/plan/requirements/8_risks_mitigation.md`
- Spec: `docs/plan/specs/8_risks_mitigation.md`
- Phase Plan: `docs/plan/phases/phase_5.md`
