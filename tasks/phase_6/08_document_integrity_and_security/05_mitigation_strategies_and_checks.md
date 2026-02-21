# Task: Document and automate "Mitigation Strategies for security risks" (machine-readable mapping and checks) (Sub-Epic: 08_Document Integrity and Security)

## Covered Requirements
- [1_PRD-REQ-DOC-010]

## 1. Initial Test Written
- [ ] Create a unit test `tests/ci/test_mitigation_presence.(ts|js|py)` that parses `specs/1_prd.md` (or `requirements.md`) and asserts there is a section titled "Mitigation Strategies" (or that `[1_PRD-REQ-DOC-010]` is present). The test must also assert that the document contains mitigation entries for the following concerns: `Tampering`, `Document checksum verification`, `AOD integrity`, and `Immutable sign-off`.
- [ ] Create a second test `tests/ci/test_mitigation_implementation_map.(ts|js|py)` that expects a machine-readable JSON file `specs/mitigation_map.json` to exist and contain mappings of the form `{ "REQ_ID": { "mitigation": "<short description>", "implemented_by": ["src/path/to/module"], "test_script": "scripts/..." } }` and asserts that the `implemented_by` paths exist on disk (or are referenced by tests added in prior tasks).

## 2. Task Implementation
- [ ] Author a machine-readable mitigation catalog `specs/mitigation_map.json` that maps each security requirement in this sub-epic to a mitigation entry. At minimum include entries for the four target requirements and link them to the modules/scripts produced in earlier tasks:
  - `5_SECURITY_DESIGN-REQ-SEC-SD-060` -> DocumentChecksum utility (`src/security/document_checksum`), `scripts/verify_checksums`.
  - `5_SECURITY_DESIGN-REQ-SEC-STR-002` -> AOD verification (`agents.ingest.verifyAodIntegrity`), `scripts/verify_aod_integrity`.
  - `5_SECURITY_DESIGN-REQ-SEC-SD-023` -> ARCH_CHANGE_DIRECTIVE flow (`orchestrator.authz`), `scripts/test_immutable_signoff`.
  - `1_PRD-REQ-DOC-010` -> This mitigation map itself and `docs/ops/checksums.md` / `docs/ops/arch_signoff.md`.
- [ ] Implement a small linter script `scripts/check_mitigations.(py|js)` that:
  - Loads `specs/mitigation_map.json` and verifies that each `implemented_by` path exists and that the referenced `test_script` exists and is executable.
  - Returns non-zero exit code if any mapping is missing or inconsistent. This script will be used by CI to ensure mitigation coverage.
- [ ] Ensure the mitigation map is part of the canonical documentation and kept in `specs/` so it is versioned with the repository.

## 3. Code Review
- [ ] Validate that the mitigation_map entries are truthful and that `implemented_by` points to real source files or to approved tests.
- [ ] Ensure the linter script is deterministic and returns meaningful error messages to help developers remedy missing implementations.
- [ ] Confirm that this mapping does not contain secrets or credentials.

## 4. Run Automated Tests to Verify
- [ ] Run `scripts/check_mitigations.(py|js)` and the new tests in `tests/ci/`. All checks must pass and the mitigation map must validate against implemented modules.

## 5. Update Documentation
- [ ] Update `specs/1_prd.md` to include a link to `specs/mitigation_map.json` and add a short summary of the mitigation strategy for each target requirement.
- [ ] Add `docs/ops/mitigations.md` explaining how to add new mitigations to the map and the expected format for `implemented_by` and `test_script` fields.

## 6. Automated Verification
- [ ] Configure CI to run `scripts/check_mitigations` as part of the security checks stage and to fail the pipeline if any required mitigation mapping is missing or broken.
