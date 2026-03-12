# Task: Phase 0 Dependency Verification (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [ROAD-P1-DEP-001]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a new integration test or script (e.g. `tests/verify_phase_0.sh`) that checks for the existence of the Phase 0 PTC ADR file: `docs/adr/*-phase-0-complete.md`.
- [ ] The test must verify that the PTC JSON block is present and contains `"phase_id": "ROAD-001"` and `"gate_conditions"` with all entries set to `"verified": true`.
- [ ] The test must also run `./do presubmit` to ensure the current state passes the Phase 0 baseline.

## 2. Task Implementation
- [ ] Locate the Phase 0 PTC ADR file in `docs/adr/`.
- [ ] If missing or incomplete, follow the protocol in `9_PROJECT_ROADMAP.md` to generate and commit it.
- [ ] Ensure `target/traceability.json` exists and can be parsed by the Phase 1 verification tools.
- [ ] Verify that `devs-proto` and `devs-core` have achieved their Phase 0 PTC requirements.

## 3. Code Review
- [ ] Confirm that no business logic for Phase 1 crates was authored before the Phase 0 PTC was committed.
- [ ] Verify that the PTC ADR file follows the naming convention `<NNNN>-phase-0-complete.md`.

## 4. Run Automated Tests to Verify
- [ ] Run the Phase 0 verification script: `bash tests/verify_phase_0.sh`.
- [ ] Run `./do presubmit` and ensure it exits 0.

## 5. Update Documentation
- [ ] Ensure the Phase 0 PTC is linked in the project's ADR index (if one exists).
- [ ] Update any agent memory reflecting that Phase 0 is formally closed.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure it doesn't report any Phase 0 stub violations (though Phase 1 allows stubs, we should ensure Phase 0 deliverables are solid).
- [ ] Check `target/traceability.json` to confirm all ROAD-001 requirements are marked as passed.
