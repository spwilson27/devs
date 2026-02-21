# Task: Define Task Schema and Validator (Sub-Epic: 02_Decomposition_And_Orchestration)

## Covered Requirements
- [1_PRD-REQ-PLAN-005]

## 1. Initial Test Written
- [ ] Add unit tests at tests/unit/test_task_schema.py using the project's test harness (pytest assumed). Tests must be written first and fail:
  - [ ] Create a fixture `sample_task` with a minimal valid Task JSON/YAML object: {
      "id": "T-0001",
      "title": "Example task",
      "description": "Short description",
      "input_files": ["specs/example.md"],
      "success_criteria": ["tests/unit/test_example.py::test_feature"],
      "dependencies": []
    }
  - [ ] Write a test `test_valid_task_passes_validation()` that imports the validator module (tests should import src.tasks.schema.validate_task) and asserts the fixture validates without exception.
  - [ ] Parametrize tests `test_missing_required_field_raises(field)` over each required field (id, title, description, input_files, success_criteria, dependencies) asserting a ValidationError is raised and the error message identifies the missing field.
  - [ ] Write a test `test_id_format()` asserting `id` follows a pattern like `T-\d{4}` (adjust to project convention) and invalid IDs produce a validation error.
  - [ ] Add tests for `input_files` to assert the validator rejects non-list values and checks that relative paths are valid paths when provided.

## 2. Task Implementation
- [ ] Implement the Task schema and validation at `src/tasks/schema.py` (or `src/decomposition/task_schema.py`) and expose `validate_task(obj)` and `TaskModel`:
  - [ ] Use pydantic or a lightweight JSON Schema validator.
  - [ ] Define fields: `id: str` (pattern), `title: str`, `description: str`, `input_files: List[str]`, `success_criteria: List[str]`, `dependencies: List[str]`.
  - [ ] Ensure validation raises a typed ValidationError containing a JSON-serializable payload with `field` and `message` keys.
  - [ ] Add a helper CLI `scripts/validate_task.py --file <task.json|yaml>` to load and validate tasks (exit code 0 on success).
  - [ ] Keep the implementation file concise (<200 LOC) and well-typed.

## 3. Code Review
- [ ] Verify the validator is strongly typed, documented, and returns machine-parseable errors.
- [ ] Confirm no permissive Any usage; prefer pydantic/dataclasses and explicit types.
- [ ] Ensure the file size and complexity are appropriate for a single PR (<200 LOC change).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_task_schema.py` and confirm all new tests pass.

## 5. Update Documentation
- [ ] Add `docs/task_schema.md` describing the Task fields with examples (JSON + YAML) and CLI usage for `scripts/validate_task.py`.
- [ ] Add a short entry to `docs/README.md` or `README.md` under "Task format" linking to the new doc.

## 6. Automated Verification
- [ ] Add a lightweight verification script `tests/scripts/verify_task_schema.sh` that runs the test file and emits JSON: `{"file":"tests/unit/test_task_schema.py","passed":true}` on success. CI should consume that output for automated verification.
