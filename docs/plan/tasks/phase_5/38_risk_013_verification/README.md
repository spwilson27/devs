# Sub-Epic: 38_Risk 013 Verification

## Overview
This sub-epic focuses on verifying that the traceability maintenance burden risk (RISK-013) is properly mitigated. The risk is that the 100% requirement traceability gate creates an annotation maintenance burden. This sub-epic ensures:

1. **Synchronous ID Updates**: When spec documents are renamed or requirement IDs change, all affected `// Covers:` annotations are updated in the same commit
2. **Acceptance Criteria Verification**: All three acceptance criteria (AC-RISK-013-01, AC-RISK-013-02, AC-RISK-013-03) are verified through automated tests

## Requirements Covered
- [RISK-013-BR-005] - Spec rename/ID change triggers annotation audit
- [MIT-013] - Mitigation strategy with traceability.json and "two-together" convention
- [AC-RISK-013-01] - `./do test` exits non-zero when traceability < 100%
- [AC-RISK-013-02] - `stale_annotations` empty when all annotations reference real IDs
- [AC-RISK-013-03] - New spec tag without covering test causes `./do test` to fail

## Task Summary

| Task | Description | Requirements |
|---|---|---|
| [01_implement_rename_id_sync_audit.md](01_implement_rename_id_sync_audit.md) | Implement synchronous requirement rename and ID change audit | [RISK-013-BR-005], [MIT-013] |
| [02_verify_traceability_acceptance_criteria.md](02_verify_traceability_acceptance_criteria.md) | Final verification of traceability acceptance criteria | [AC-RISK-013-01], [AC-RISK-013-02], [AC-RISK-013-03] |

## Dependencies
- **Blocks**: [Phase 5 MVP Release Gate](../../phases/phase_5.md)
- **Blocked By**: [37_risk_013_verification](../37_risk_013_verification/README.md) - Foundational traceability implementation

## Shared Components
- **Owner**: None - This sub-epic consumes shared components
- **Consumer**: 
  - `./do Entrypoint Script` - Integration with lint and test commands
  - `Traceability & Verification Infrastructure` - Built in phase 37

## Completion Criteria
- [ ] All 5 requirements have passing automated tests
- [ ] `./do lint` detects spec renames and ID changes with stale annotations
- [ ] `./do test` exits non-zero when traceability is incomplete
- [ ] `traceability.json` correctly reports stale annotations
- [ ] All tests pass in `./do presubmit`
