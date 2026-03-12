# Task: Execute MVP Code Reviews (Sub-Epic: 45_Risk 016 Verification)

## Covered Requirements
- [AC-RISK-016-03]

## Dependencies
- depends_on: [02_verify_code_review_halt_logic.md]
- shared_components: [devs-scheduler, devs-config]

## 1. Initial Test Written
- [ ] Create a validation test script (e.g., `scripts/verify_review_artifacts.py`) that checks for the existence of:
  - `docs/reviews/devs-mcp-*.json`
  - `docs/reviews/devs-adapters-*.json`
  - `docs/reviews/devs-checkpoint-*.json`
  - `docs/reviews/devs-core-template-*.json`
- [ ] The script must also verify that each JSON file contains `critical_findings: 0`.

## 2. Task Implementation
- [ ] For each of the specified crates (`devs-mcp`, `devs-adapters`, `devs-checkpoint`, and the `devs-core` template resolution logic), execute the `code-review` workflow using a different agent tool than the one that implemented it.
- [ ] Save the resulting structured output JSON to `docs/reviews/` with the filename pattern `<crate>-<date>.json`.
- [ ] Address any `critical_findings` if they appear (they must be 0 for final completion of this task).
- [ ] Ensure that the `code-review` runs are submitted and managed by the `devs` server itself.

## 3. Code Review
- [ ] Verify that the review reports are comprehensive and cover the key security/design points.
- [ ] Ensure the filenames and structure match the requirement specification `AC-RISK-016-03`.

## 4. Run Automated Tests to Verify
- [ ] Run the validation script `scripts/verify_review_artifacts.py` and confirm it passes.
- [ ] Confirm that all four review artifacts are present and show zero critical findings.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/8_risks_mitigation.md` to reference the newly generated review artifacts.
- [ ] Add the coverage annotation `// Covers: AC-RISK-016-03` to the validation script or a dedicated test.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `AC-RISK-016-03` is covered.
