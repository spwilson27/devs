# Task: Phase Transition Checkpoint (PTC) Validation and ADR Linting (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-018], [9_PROJECT_ROADMAP-REQ-019], [9_PROJECT_ROADMAP-REQ-024], [9_PROJECT_ROADMAP-REQ-031], [9_PROJECT_ROADMAP-REQ-033], [9_PROJECT_ROADMAP-REQ-038], [9_PROJECT_ROADMAP-REQ-108], [9_PROJECT_ROADMAP-REQ-129], [9_PROJECT_ROADMAP-REQ-417], [9_PROJECT_ROADMAP-REQ-427], [9_PROJECT_ROADMAP-REQ-441], [9_PROJECT_ROADMAP-REQ-442]
- [8_RISKS-REQ-051] through [8_RISKS-REQ-100]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `pytest .tools/tests/test_ptc_logic.py` that verifies a mock `docs/adr/ptc_phase_1.md` file.
- [ ] Test cases must verify that if a PTC is missing the "Evidence" section, it fails validation.
- [ ] Test cases must verify that if a PTC references an incomplete requirement (not in `target/traceability.json`), it fails validation.
- [ ] Test cases must verify that `./do lint` correctly identifies an "Illegal Phase Advance" (adding code for Phase N+1 before Phase N PTC is committed).
- [ ] Test cases must verify that `commit_sha` in ADR frontmatter does NOT equal `HEAD` (must be committed separately).

## 2. Task Implementation
- [ ] Implement a PTC validator in `.tools/verify_ptc.py`.
- [ ] Define a JSON schema or specific markdown structure required for PTC ADRs.
- [ ] Integrate PTC validation into `./do lint`.
- [ ] Add the "Illegal Phase Advance" check: use `git diff` to ensure that if any new requirement IDs from Phase N+1 are referenced in code, there is already a `docs/adr/ptc_phase_n.md` committed.
- [ ] Implement the `adr-commit-sha-check`: parse the ADR frontmatter and verify the `commit_sha` is present and does not match the current `HEAD` commit.
- [ ] Add a `check-for-uncommitted-adr` lint that warns if an ADR in `docs/adr/` exists but is not staged/committed.

## 3. Code Review
- [ ] Verify that the PTC validation is strict but clear in its error messages.
- [ ] Ensure the "Illegal Phase Advance" logic correctly handles multi-phase requirement overlaps.
- [ ] Check that the validator is integrated cleanly into the existing `./do` script infrastructure.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_ptc_logic.py`.
- [ ] Run `./do lint` on the current project and ensure it passes (since current PTCs are completed).

## 5. Update Documentation
- [ ] Update any existing PTC documents to match the new required structure if necessary.
- [ ] Ensure `MEMORY.md` reflects the new PTC and ADR linting capabilities.

## 6. Automated Verification
- [ ] Add a temporary, invalid PTC file and verify that `./do lint` fails with the expected error.
- [ ] Add a temporary requirement reference from a future phase and verify `./do lint` detects the Illegal Phase Advance.
