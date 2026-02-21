# Task: Implement Task granularity enforcement and auto-split heuristic (Sub-Epic: 05_Task_Constraints_And_Planning)

## Covered Requirements
- [9_ROADMAP-REQ-045], [9_ROADMAP-TAS-019]

## 1. Initial Test Written
- [ ] Create tests `tests/unit/test_granularity_enforcer.py` that cover:
  - Given a `Task` with `estimated_loc > 200`, `enforce_granularity(task)` returns either a list of `1+ Task` objects each with `estimated_loc <= 200` OR returns a `GranularityFlag` object describing why auto-split failed.
  - Verify splits preserve `success_criteria` per resulting subtask (append "—part N" to titles) and maintain references to original requirement ids.
  - Test splitting heuristics: numbered subitems, paragraph breaks, and "if no natural split, return flag".

## 2. Task Implementation
- [ ] Implement `src/planner/granularity.py`:
  1. Implement `enforce_granularity(task: Task, max_loc=200) -> Union[list[Task], GranularityFlag]`.
  2. Heuristics (in order):
     - If description contains numbered lists or subheadings, split along those markers.
     - Else split by paragraph (~blank-line) preserving nearest `success_criteria`.
     - Else attempt semantic split by sentence clusters of ~`max_loc/avg_loc_per_sentence` approximated (fallback).
     - If none safe, return `GranularityFlag` with suggested split points (character offsets) and explanation.
  3. Ensure deterministic behaviour; each new `Task` retains original dependencies and `rti_links`, and sets `estimated_loc` accordingly.
  4. Add small utility to compute `estimated_loc` from description if not provided (line break count heuristic).

## 3. Code Review
- [ ] Verify:
  - Splits are deterministic and preserve success criteria.
  - `GranularityFlag` includes actionable guidance for humans.
  - New tasks have unique ids and updated titles ("—part N").
  - Edge cases are documented and covered by tests.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/unit/test_granularity_enforcer.py -q` and ensure pass.

## 5. Update Documentation
- [ ] Add `docs/granularity.md` describing heuristics, examples before/after splitting, and CLI usage for manual review.

## 6. Automated Verification
- [ ] Add `scripts/enforce_granularity_on_sample.py` that loads sample tasks from `artifacts/distilled_requirements.json`, runs enforcer, writes resulting tasks to `artifacts/granularity_split.json` and exits non-zero if any task still exceeds `max_loc`.
