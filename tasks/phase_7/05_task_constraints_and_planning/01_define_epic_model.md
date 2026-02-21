# Task: Define Epic data model and schema (Sub-Epic: 05_Task_Constraints_And_Planning)

## Covered Requirements
- [1_PRD-REQ-PLAN-006], [9_ROADMAP-TAS-014]

## 1. Initial Test Written
- [ ] Write unit tests in `tests/unit/models/test_epic_model.py` using `pytest` that assert:
  - Epic can be instantiated via `src.models.epic.Epic` with fields:
    - `id`: str (UUID)
    - `title`: non-empty str
    - `description`: str
    - `milestone`: optional str
    - `start_date`, `end_date`: ISO8601 date strings or `datetime.date`
    - `task_count`: int (default 0)
    - `success_criteria`: non-empty list[str]
  - Missing or invalid required fields raise `ValueError`.
  - `to_dict()` serializes dates to ISO8601 and includes all fields.
  - `from_dict()` reconstructs an equivalent `Epic`.
  - Validation: `start_date <= end_date` when both present.
  - Tests must be the first code written (red). Use fixtures in `tests/fixtures/epic.json`.

## 2. Task Implementation
- [ ] Implement `src/models/epic.py`:
  1. Create a typed Python `dataclass` `Epic` with the fields above.
  2. Use `uuid.uuid4()` for default `id` generation.
  3. Implement `__post_init__` to validate types, non-empty `title` and `success_criteria`, and date ordering.
  4. Implement `to_dict()` and `@classmethod from_dict()`.
  5. Add a lightweight persistence adapter interface at `src/adapters/epic_repo.py` with `InMemoryEpicRepo` implementing `save(epic)`, `get(id)`, `list()`, `delete(id)`; keep implementation small and dependency-free.
  6. Add fixture loader in `tests/conftest.py` to provide sample epic data.
  7. Keep implementation dependency-free (stdlib only: `dataclasses`, `datetime`, `uuid`, `typing`).

## 3. Code Review
- [ ] Verify:
  - All fields are typed and documented.
  - Validation failures are explicit (`ValueError` with clear messages).
  - No new third-party dependencies introduced.
  - Methods are small and single-responsibility; `to_dict()` uses ISO8601.
  - Module path is stable (`src.models.epic`) and importable by tests.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/unit/models/test_epic_model.py -q` and ensure exit code 0.

## 5. Update Documentation
- [ ] Add "Epic model" section to `docs/roadmap.md` or `docs/specs/phase_7_epics.md` describing fields, JSON schema example, and example `to_dict` output; add sample fixture `tests/fixtures/epic.json`.

## 6. Automated Verification
- [ ] Add `scripts/verify_epic_model.sh` that runs the test above and prints PASS/FAIL, and include CI-ready step to run that script as part of the planner verification pipeline.
