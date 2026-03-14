# Task: Risk Matrix and Mitigation Header Audit (Sub-Epic: 07_Risk 001 Verification)

## Covered Requirements
- [RISK-BR-001], [RISK-BR-003]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/audit_risk_mitigation.sh` that:
    - Parses `docs/plan/specs/8_risks_mitigation.md` and `docs/plan/requirements/8_risks_mitigation.md`.
    - Extracts all `[RISK-NNN]` IDs from the assessment matrix.
    - Verifies that for each `RISK-NNN`, there is a corresponding `### **[MIT-NNN]**` header in the document.
    - Verifies that every `[MIT-NNN]` mentioned in the matrix is unique and present.
    - Fails if any mapping is broken.

## 2. Task Implementation
- [ ] Run the audit script and identify all missing or broken mitigation headers.
- [ ] Cross-reference `docs/plan/specs/8_risks_mitigation.md` and `docs/plan/requirements/8_risks_mitigation.md` to ensure they are in sync regarding Risk IDs.
- [ ] For every missing `MIT-NNN` section, add a placeholder section with the correct tag and a brief description (or full content if available in other documents).
- [ ] Update any `RISK-BR-003` violations by ensuring all risks identified during Phase 0-4 are correctly listed in the matrix.

## 3. Code Review
- [ ] Verify that every `MIT-NNN` tag in §2, §3, or §4 matches the one in the matrix table.
- [ ] Ensure that no Risk IDs are duplicated across the documents.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/audit_risk_mitigation.sh`.
- [ ] Run `./do lint` (which should now include the risk matrix validation from sub-epic 05).

## 5. Update Documentation
- [ ] Document the results of the audit in the project logs or agent memory.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py --verify-ordered` to ensure the risk mitigation document is correctly ordered and consistent.
