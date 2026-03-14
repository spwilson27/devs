# Task: Verify Bootstrap Milestone ADR and Evidence (Sub-Epic: 28_Risk 009 Verification)

## Covered Requirements
- [RISK-009-BR-006]

## Dependencies
- depends_on: []
- shared_components: [.tools/verify_requirements.py]

## 1. Initial Test Written
- [ ] Create a new Python test file `.tools/tests/test_bootstrap_adr_verification.py`.
- [ ] Mock an ADR file `docs/adr/0001-bootstrap-complete.md` (or similar).
- [ ] Assert that a verification tool fails if any of the following are missing:
    - Commit SHA of the passing self-hosting attempt.
    - CI pipeline URL.
    - Verified list of `COND-NNN` conditions.
- [ ] Assert that the verification fails if the ADR is NOT in the same PR (or commit range) as the self-hosting evidence.
- [ ] Assert that it passes when all required evidence is correctly formatted.

## 2. Task Implementation
- [ ] Implement a tool in `.tools/` (e.g., `verify_bootstrap_milestone.py`) that checks for the existence and content of the `BootstrapComplete` ADR.
- [ ] Use regular expressions or a markdown parser to extract the SHA, CI URL, and conditions from the ADR file.
- [ ] Compare the SHA in the ADR with the git commit history to ensure it points to a valid commit containing self-hosting evidence (checkpoints or logs).
- [ ] Verify that the ADR and evidence are within the same pull request or commit series.
- [ ] Integrate this verification tool into the final MVP release checklist or `./do presubmit`.

## 3. Code Review
- [ ] Verify that the ADR template includes all required fields as per `RISK-009-BR-006`.
- [ ] Confirm that the SHA validation logic correctly identifies self-hosting evidence.
- [ ] Ensure that the CI URL format is correctly validated for the project's GitLab instance.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest .tools/tests/test_bootstrap_adr_verification.py` and ensure it passes.
- [ ] Manually create a mock ADR and evidence commit, then run the verification tool to confirm success.

## 5. Update Documentation
- [ ] Add the `Bootstrap Milestone` ADR template to the project's ADR documentation.
- [ ] Update the `Documentation & Release` section of Phase 5 plan with a reference to this verification tool.

## 6. Automated Verification
- [ ] Verify the requirement `[RISK-009-BR-006]` is linked in the code using the traceability tool: `python3 .tools/verify_requirements.py --req RISK-009-BR-006`.
