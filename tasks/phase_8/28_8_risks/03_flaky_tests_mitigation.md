# Task: Implement Flaky Test Handling and Quarantine Mechanism (Sub-Epic: 28_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-116]

## 1. Initial Test Written
- [ ] Create unit and integration tests at tests/risks/test_flaky_test_handler.py.
  - test_quarantine_marks_test: when FlakinessDetector.is_flaky(test_id) returns True, FlakyTestHandler.quarantine(test_id) records the quarantine and subsequent should_run(test_id) returns False.
  - test_rerun_with_variations_identifies_non_determinism: implement a fake flaky test function that depends on a random seed; FlakyTestHandler.rerun_with_variations(test_callable, attempts=3) should run the callable with different deterministic seeds and identify non-deterministic behavior.
  - test_pytest_plugin_skips_quarantined: install and test a pytest plugin (see implementation) that skips quarantined tests and reports SKIPPED with a specific reason code.

## 2. Task Implementation
- [ ] Implement the FlakyTestHandler and pytest integration:
  - src/risks/flaky_handler.py: FlakyTestHandler
    - mark_quarantined(test_id: str, reason: str, ttl_days: int = 7) -> None
    - is_quarantined(test_id: str) -> bool
    - rerun_with_variations(callable, attempts: int = 3, seed_variations: List[int]) -> List[Outcome]
  - src/plugins/pytest_flaky_guard.py: pytest plugin that hooks into collection/running to skip quarantined tests and optionally schedule reruns for flaky tests before quarantine.
  - Persist quarantines in a SQLite table flaky_quarantine(test_id TEXT PRIMARY KEY, reason TEXT, created_at TIMESTAMP, ttl_days INTEGER).
  - Expose a management CLI scripts/flaky_manage.py list|unquarantine|status.
  - Default configuration in config/risks.yml: { quarantine_ttl_days: 7, rerun_attempts: 3 }

## 3. Code Review
- [ ] Verify:
  - The pytest plugin is opt-in and disabled by default unless config enabled in pytest.ini or environment variable.
  - Quarantine records have TTL and are purgeable by management CLI.
  - rerun_with_variations is deterministic in tests (explicit seed list) and does not introduce flaky test behavior into CI.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/risks/test_flaky_test_handler.py
- [ ] Run a local pytest session with the plugin enabled to verify quarantined tests appear as SKIPPED with the correct reason mapping.

## 5. Update Documentation
- [ ] Add docs/risks/flaky_tests_mitigation.md documenting:
  - Quarantine lifecycle and TTL semantics.
  - How agents should react to quarantined tests (e.g., convert to a task to stabilize test before marking feature done).
  - How to manually unquarantine and rationale for doing so.

## 6. Automated Verification
- [ ] Add tests/scripts/verify_flaky_handler.py that:
  - Programmatically marks a test quarantined and verifies pytest with plugin reports it as SKIPPED.
  - Runs rerun_with_variations on a fake non-deterministic callable and asserts the handler identifies non-determinism.
