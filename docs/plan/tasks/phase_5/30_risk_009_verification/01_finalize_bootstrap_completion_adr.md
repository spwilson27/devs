# Task: Finalize Bootstrap Completion ADR and Evidence (Sub-Epic: 30_Risk 009 Verification)

## Covered Requirements
- [AC-RISK-009-05]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a shell script or Python script `tests/verify_bootstrap_adr.sh` that:
    - Checks for the existence of `docs/adr/*.bootstrap-complete.md`.
    - Extracts the commit SHA using `grep`.
    - Verifies the SHA exists in the current git history using `git rev-parse`.
    - Extracts the CI pipeline URL and verifies it matches the project's GitLab pattern.
    - Extracts the list of verified conditions and ensures `COND-001`, `COND-002`, and `COND-003` are present and marked as verified.
- [ ] Run this script and ensure it FAILS initially (since the ADR doesn't exist yet).

## 2. Task Implementation
- [ ] Identify the successful self-hosting run commit SHA and the corresponding GitLab CI pipeline URL.
- [ ] Create the ADR file: `docs/adr/0002-bootstrap-complete.md` (sequentially after previous ADRs).
- [ ] Populate the ADR with:
    - **Title**: Bootstrap Phase Complete.
    - **Status**: Accepted.
    - **Evidence**:
        - `commit_sha`: <The actual SHA>.
        - `ci_pipeline_url`: <The actual URL>.
    - **Verification of Conditions**:
        - `COND-001`: Verified (description of the check).
        - `COND-002`: Verified (description of the check).
        - `COND-003`: Verified (description of the check).
- [ ] Ensure all placeholders are replaced with real data from the final self-hosting validation.

## 3. Code Review
- [ ] Verify the ADR follows the project's standard ADR format.
- [ ] Confirm that the SHA provided actually contains the `devs` state checkpoints in the project's state branch.
- [ ] Ensure the conditions `COND-001` through `COND-003` accurately reflect the self-hosting success criteria defined in the PRD.

## 4. Run Automated Tests to Verify
- [ ] Execute `bash tests/verify_bootstrap_adr.sh` and ensure it passes.

## 5. Update Documentation
- [ ] Update `docs/plan/phases/phase_5.md` to mark the Bootstrap Verification as complete.
- [ ] Update the agent's memory to reflect that the project has successfully transitioned from "bootstrapped" to "self-hosted" status.

## 6. Automated Verification
- [ ] Run the traceability tool to confirm coverage: `python3 .tools/verify_requirements.py --req AC-RISK-009-05`.
