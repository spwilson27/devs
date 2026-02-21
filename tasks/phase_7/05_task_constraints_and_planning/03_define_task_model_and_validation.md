# Task: Define Task data model and validation (Sub-Epic: 05_Task_Constraints_And_Planning)

## Covered Requirements
- [9_ROADMAP-TAS-019], [9_ROADMAP-REQ-045]

## 1. Initial Test Written
- [ ] Write unit tests `tests/unit/models/test_task_model.py` (pytest) that assert:
  - Task instantiation with fields: `id` (UUID), `title` (non-empty), `description` (str), `success_criteria` (non-empty list[str]), `estimated_loc` (int), `input_files` (list[str]), `dependencies` (list[str]), `status` (enum draft/ready/in_progress/done), `rti_links` (list[str]).
  - Validation: `estimated_loc` must be `<= 200` (enforce granularity cap); creating a Task with `estimated_loc > 200` raises `ValueError`.
  - Validation: `success_criteria` non-empty; `dependencies` may be empty.
  - `to_dict`/`from_dict` roundtrip.

## 2. Task Implementation
- [ ] Implement `src/models/task.py`:
  1. Create a typed `dataclass` `Task` with above fields.
  2. Implement `__post_init__` enforcing constraints, including `estimated_loc <= 200` and human-friendly error messages.
  3. Implement helper methods: `is_ready_for_planning()` (checks `success_criteria` and `estimated_loc`), `complexity_score()` (simple weighted sum).
  4. Add tests fixtures `tests/fixtures/task_long_description.txt` and tasks to drive tests.
  5. Keep implementation dependency-free; use stdlib only.

## 3. Code Review
- [ ] Verify:
  - Validation logic is deterministic and well-documented.
  - Error messages include field name and invalid value.
  - No new third-party libraries introduced.
  - Module is importable at `src.models.task` for other planner components.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/unit/models/test_task_model.py -q` and ensure tests pass.

## 5. Update Documentation
- [ ] Add `docs/task_spec.md` documenting the Task schema, JSON schema example, constraints (200 LOC cap), and examples of `success_criteria`.

## 6. Automated Verification
- [ ] Add `scripts/check_tasks_constraints.py` which loads tasks from `tests/fixtures/*.json` and asserts none exceed 200 LOC; incorporate into CI verification.
