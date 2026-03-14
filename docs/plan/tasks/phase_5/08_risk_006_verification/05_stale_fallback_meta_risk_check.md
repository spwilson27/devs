# Task: 05_Stale Fallback Meta-Risk Check (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-009]

## Dependencies
- depends_on: []
- shared_components: [devs-pool, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python unit test file at `.tools/tests/test_fallback_staleness.py` with a test class `TestFallbackStaleness`.
- [ ] Write a test `test_active_fallback_older_than_two_sprints_requires_meta_risk` that:
  - Creates a mock `docs/adr/fallback-registry.json` with an entry: `{"fallback_id": "FB-003", "status": "Active", "activated_at": "2025-01-01T00:00:00Z"}` (more than 28 days old).
  - Creates a mock `docs/plan/requirements/8_risks_mitigation.md` without any `RISK-NNN` entry referencing `FB-003`.
  - Invokes the staleness checker and asserts it returns `StalenessResult.FAIL` with error "FB-003: Active for 45 days (>28 days); requires meta-risk entry".
- [ ] Write a test `test_active_fallback_with_meta_risk_passes` that:
  - Creates the same stale fallback but includes a `RISK-025` entry in the markdown with `fallback_id: FB-003` or `Covers: FB-003`.
  - Asserts the checker passes.
- [ ] Write a test `test_recent_active_fallback_does_not_require_meta_risk` that:
  - Creates an active fallback with `activated_at` 10 days ago.
  - Asserts the checker passes without a meta-risk entry.
- [ ] Write a test `test_inactive_fallback_does_not_require_meta_risk` that:
  - Creates a fallback with `status: "Inactive"` or `status: "Resolved"` older than 28 days.
  - Asserts the checker passes.
- [ ] Ensure all tests use pytest fixtures with frozen datetime for deterministic age calculation.

## 2. Task Implementation
- [ ] Create `.tools/fallback_monitor.py` with a class `FallbackStalenessChecker` that:
  - Parses `docs/adr/fallback-registry.json` to extract all fallbacks with their `fallback_id`, `status`, and `activated_at`.
  - Implements `check_stale_fallbacks()` method that:
    - Filters fallbacks with `status == "Active"` and `activated_at` older than 28 days (two sprints).
    - For each stale fallback, searches `docs/plan/requirements/8_risks_mitigation.md` for a `RISK-NNN` entry containing `fallback_id: FB-NNN` or `Covers: FB-NNN`.
    - Returns a list of stale fallbacks missing meta-risk entries.
  - Uses `datetime.now(timezone.utc)` for current time and parses ISO 8601 timestamps.
- [ ] Integrate the checker into `./do presubmit` by adding a step that runs `python -m tools.fallback_monitor` before the test phase.
- [ ] Add logging: `print(f"[FALLBACK-MONITOR] Checking {len(fallbacks)} fallbacks for staleness...")` and `print(f"[FALLBACK-MONITOR] Found {len(stale)} stale fallbacks requiring meta-risk")`.
- [ ] Ensure the tool exits with code 1 on any staleness violation.

## 3. Code Review
- [ ] Verify the age calculation uses UTC timezone consistently: `(now - activated_at).days > 28`.
- [ ] Confirm the regex for meta-risk detection is robust: `r'(?:fallback_id:\s*|Covers:\s*)FB-\d+'` matches both inline and block formats.
- [ ] Verify error messages include the fallback ID, age in days, and the 28-day threshold: "FB-003: Active for 45 days (>28 days); no meta-risk entry found".
- [ ] Ensure the checker handles edge cases: missing registry file, malformed JSON, future-dated `activated_at`.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_fallback_staleness.py -v` and confirm all tests pass.
- [ ] Manually create a stale fallback in `fallback-registry.json` without a meta-risk entry, run the checker, and verify it fails.
- [ ] Run `./do presubmit` with a valid stale fallback (with meta-risk entry) and verify the check passes.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/8_risks_mitigation.md` section on [RISK-BR-009] to document: "Stale fallback monitoring implemented in `.tools/fallback_monitor.py`, enforced by `./do presubmit`."
- [ ] Add a section to `docs/plan/adversarial_review.md` describing the meta-risk pattern: "Active fallbacks >28 days require a dedicated RISK-NNN entry documenting the permanent fallback risk."

## 6. Automated Verification
- [ ] Run `python -m tools.fallback_monitor` on the current codebase and verify it exits 0 with no stale fallback violations.
- [ ] Verify the checker is invoked in `./do presubmit` by checking the script output for `[FALLBACK-MONITOR]` log lines.
- [ ] Confirm `fallback-registry.json` is maintained alongside ADRs and updated when fallbacks are activated/resolved.
