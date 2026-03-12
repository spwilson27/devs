# Task: 05_Stale Fallback Meta-Risk Check (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-009]

## Dependencies
- depends_on: [none]
- shared_components: [devs-pool, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test in `.tools/tests/test_fallback_staleness.py` that verifies the meta-risk check.
- [ ] The test should mock a `fallback-registry.json` containing a fallback with `status = "Active"` and an `activated_at` date more than 4 weeks (two sprints) in the past.
- [ ] The test should verify that the check fails if no `[RISK-NNN]` entry exists in `docs/plan/requirements/8_risks_mitigation.md` referencing that fallback ID.
- [ ] The test should verify that the check passes if a matching risk ID is found.

## 2. Task Implementation
- [ ] Create or update a script in `.tools/` (e.g. `fallback_monitor.py` or as part of `verify_requirements.py`) to scan for active fallbacks.
- [ ] Parse `fallback-registry.json` and ADRs in `docs/adr/` to find all `Active` fallbacks.
- [ ] Calculate the age of each active fallback based on its `activated_at` field.
- [ ] For any fallback > 28 days (two sprints), search `docs/plan/requirements/8_risks_mitigation.md` for a requirement containing the string `fallback_id: FB-NNN` or `Covers: FB-NNN`.
- [ ] Implement this check as part of `./do presubmit`.

## 3. Code Review
- [ ] Verify that the tool accurately calculates fallback age and identifies active status.
- [ ] Ensure that the risk check regex is robust and matches the established schema for risk records.
- [ ] Verify that the error message clearly explains that a meta-risk entry is required for permanent fallbacks.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_fallback_staleness.py` and ensure it passes.
- [ ] Manually simulate a stale fallback without a risk entry and verify that the presubmit check fails.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/8_risks_mitigation.md` to reflect the new automated stale fallback check.

## 6. Automated Verification
- [ ] Run the fallback monitor tool on the current codebase and ensure it accurately identifies any existing stale fallbacks.
