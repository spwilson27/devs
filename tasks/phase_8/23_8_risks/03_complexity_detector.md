# Task: Implement High-Complexity Detector (max 200 LoC) (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-019]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/unit/test_complexity_detector.py` using pytest.
  - Test 1: Input a change-set metadata object with `lines_changed = 250` (or `lines_added + lines_removed >= 200`) and assert `is_high_complexity(change_set)` returns True.
  - Test 2: Input `lines_changed = 50` and assert function returns False.
  - Test 3: Input missing LOC metadata; assert function degrades to a conservative estimate using file count or falls back to `False` but logs a warning.
  - Make tests deterministic and avoid reading actual repo diffs; use small helper objects.

## 2. Task Implementation
- [ ] Implement `devs/plannode/complexity.py` exposing:
  - `DEFAULT_COMPLEXITY_THRESHOLD = 200` (configurable)
  - `def is_high_complexity(change_set: Dict[str, Any], threshold: int = DEFAULT_COMPLEXITY_THRESHOLD) -> Tuple[bool, int]:`
    - `change_set` should accept keys like `lines_added`, `lines_removed`, or `estimated_loc`.
    - Return `(True, total_lines_changed)` when threshold exceeded else `(False, total_lines_changed)`.
  - Add defensive parsing for missing keys and document fallback behavior.
- [ ] Expose function to PlanNode API so the Planning step can make binary decisions.

## 3. Code Review
- [ ] Confirm the detector is deterministic, uses only provided metadata, and is easy to unit test.
- [ ] Ensure threshold is configuration-driven and documented in TAS so architects can tune it per-language/project.
- [ ] Verify logging includes the metric used (total_lines_changed) and why the decision was taken.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_complexity_detector.py -q` and ensure green.
- [ ] Add a fast integration test that feeds a synthetic large change_set into PlanNode and asserts it branches to decomposition logic.

## 5. Update Documentation
- [ ] Update `docs/architecture/complexity_detector.md` describing the metric, threshold, and how the Architect Agent will be invoked when high complexity is detected.

## 6. Automated Verification
- [ ] Add a CI marker (e.g., `pytest -k complexity_detector`) to ensure the detector's tests run in under 10s and are included in merge checks.
