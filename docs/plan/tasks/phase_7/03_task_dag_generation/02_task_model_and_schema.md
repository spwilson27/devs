# Task: Implement Task Schema & Serialization (Sub-Epic: 03_Task_DAG_Generation)

## Covered Requirements
- [9_ROADMAP-TAS-502]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/test_task_model.py that define and validate the canonical Task model.
  - Test: test_task_model_fields
    - Import src/models/task.py (implement a Pydantic BaseModel or dataclass with validators) and create a Task instance with fields: id, title, description, requirement_ids, epic_id, dependencies, max_loc, estimate_tokens, success_criteria, input_files.
    - Assert JSON serialization round-trip: Task.parse_obj(Task(**fields).dict()) equals original values for required fields.
  - Test: test_task_model_validators
    - Assert creating a Task with max_loc > 200 raises a validation error.

## 2. Task Implementation
- [ ] Implement src/models/task.py using pydantic (or equivalent) with explicit validators:
  - Fields (types): id: str (uuid), title: str, description: str, requirement_ids: List[str], epic_id: Optional[str], dependencies: List[str], max_loc: int (<=200), estimate_tokens: int, success_criteria: str, input_files: List[str].
  - Provide .schema() JSON Schema and a to_json()/from_json() helper for persistence.
  - Implement utility functions for generating stable task IDs (e.g., deterministic uuid5 based on requirement id + decomposition index when seed provided).

## 3. Code Review
- [ ] Verify model enforces constraints (max_loc <= 200), clear type annotations, validation errors are raised for invalid inputs, and no business logic leaks into model layer.
- [ ] Confirm schema is stable and used by generator tests for validation.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_task_model.py -q

## 5. Update Documentation
- [ ] Add docs/models/task.md including the JSON Schema, example serialized task, and notes on id generation and deterministic construction.

## 6. Automated Verification
- [ ] Add tests/fixtures/sample_task.json and a CI check script scripts/verify_task_model.sh that validates sample_task.json against the model JSON Schema using `python -c 'import jsonschema, json; ...'` and returns non-zero on mismatch.