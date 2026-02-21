# Task: Implement Strategy Pivot Agent (Sub-Epic: 04_1_PRD)

## Covered Requirements
- [1_PRD-REQ-REL-005]
- [1_PRD-REQ-REL-001]

## 1. Initial Test Written
- [ ] Create unit tests first using pytest at `tests/unit/test_strategy_pivot.py`.
  - Tests to write (exact assertions):
    - test_pivot_after_three_identical_errors:
      - Create a StrategyPivotAgent with a stubbed entropy_detector whose `is_loop_detected` returns True when appropriate.
      - Simulate recording the same error three times: `agent.record_error("fatal: null pointer")` x3
      - assert agent.should_pivot() is True
      - assert agent.pivot_strategy({"task_id": "T1"}) returns a dict-like plan with keys `approach` and `notes` and that approach == "first-principles" or similar marker of pivot
    - test_no_pivot_for_distinct_errors:
      - Record three distinct error messages and assert agent.should_pivot() is False
    - test_pivot_invokes_root_cause_analysis:
      - Use a spy/mocked root_cause_analysis function and assert it was called once when pivot_strategy() is executed

Provide exact call sequences and assertions so an agent can write the tests verbatim.

## 2. Task Implementation
- [ ] Implement `src/strategy_pivot.py` with a `StrategyPivotAgent` class and the following API:
  - __init__(self, entropy_detector, identical_threshold: int = 3, sim_threshold: float = 0.95)
    - `entropy_detector` is injected to make the class unit-testable.
  - def record_error(self, error_text: str) -> None
    - Append the error to an internal history buffer (bounded to recent N entries).
  - def should_pivot(self) -> bool
    - Return True when either the entropy_detector reports a loop on recent outputs OR the last `identical_threshold` recorded error signatures are identical.
  - def pivot_strategy(self, context: Dict[str, Any]) -> Dict[str, Any]
    - Perform a simple, deterministic "first-principles" plan generation that returns a plan dictionary e.g. {"approach": "first-principles", "steps": [...], "rationale": "..."}.
    - Ensure pivot_strategy has no external effects; it returns data suitable for downstream PlanNode consumption.
- [ ] Add configuration for thresholds and logging; ensure class is deterministic and easily mocked.

## 3. Code Review
- [ ] Verify the following:
  - StrategyPivotAgent uses dependency injection for entropy detection and root cause analysis.
  - Thresholds (identical_threshold, sim_threshold) are configurable via constructor.
  - pivot_strategy returns a serializable plain-data plan (no functions, no open sockets).
  - Add unit tests and docstrings that describe how pivot decisions are made.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_strategy_pivot.py -q` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `docs/strategy_pivot.md` describing:
  - Behavior when pivot is triggered (what developer-agent should expect).
  - Public API of StrategyPivotAgent and recommended configuration values.
  - Example of how DeveloperAgent should wire the pivot agent into the TDD loop.

## 6. Automated Verification
- [ ] Add `scripts/verify_strategy_pivot.sh` that runs the unit tests and performs a small smoke integration: create a StrategyPivotAgent with a fake entropy_detector and assert pivot is triggered after 3 identical errors and not triggered for 3 distinct errors.
