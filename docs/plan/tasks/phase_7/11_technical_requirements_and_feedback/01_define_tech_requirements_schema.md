# Task: Define Technical Requirements Data Model & Storage (Sub-Epic: 11_Technical_Requirements_and_Feedback)

## Covered Requirements
- [9_ROADMAP-TAS-010]

## 1. Initial Test Written
- [ ] Create unit test file `tests/requirements/test_tech_requirements_schema.py` and write tests BEFORE implementing code. Tests must be deterministic and self-contained (use sqlite3 in-memory where DB access is required). Tests to write first:
  - test_schema_construction(): import `TechRequirement` from `src/requirements/tech_schema.py` and construct an instance with fields: `req_id`, `title`, `description`, `source`, `dependencies` (list), `type`, `metadata` (dict). Assert each attribute equals the input.
  - test_to_from_dict_roundtrip(): call `to_dict()` on the instance and assert `TechRequirement.from_dict(obj.to_dict()) == obj` (implement __eq__ in tests if needed).
  - test_json_roundtrip(): serialize `to_dict()` to JSON and back and assert equality with original dict.
  - test_sql_create_and_insert(): using `sqlite3.connect(\":memory:\")`, execute `TechRequirement.create_table_sql()` (string returned by implementation) to create a table, insert a row with columns (`req_id TEXT PRIMARY KEY, payload JSON`), insert `json.dumps(obj.to_dict())` and select back to assert stored JSON contains expected `req_id` and `title`.

## 2. Task Implementation
- [ ] Implement `src/requirements/tech_schema.py` with a typed dataclass `TechRequirement` including at minimum: `req_id: str`, `title: str`, `description: str`, `source: str`, `dependencies: List[str]`, `type: str`, `metadata: Dict[str, Any]`.
  - Provide methods: `to_dict(self) -> Dict`, `@classmethod from_dict(cls, d: Dict) -> TechRequirement`, and `create_table_sql()` returning SQL to create a small table for persisting requirements (store payload as JSON TEXT).
  - Keep implementation dependency-light (stdlib only). Add type hints and runtime validation checks in `__post_init__` for required fields.
  - Add lightweight equality (`__eq__`) for test comparators or ensure tests use field-based equality.

## 3. Code Review
- [ ] Verify the implementation follows single-responsibility (data model only), uses type annotations, has no I/O side-effects at import, and includes docstrings for public methods.
- [ ] Confirm tests cover edge cases: empty dependencies, large metadata dict, and missing optional fields.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/requirements/test_tech_requirements_schema.py` and confirm all tests pass locally.

## 5. Update Documentation
- [ ] Add `docs/phase_7/11_technical_requirements_and_feedback/tech_requirements_schema.md` summarizing the schema fields, example JSON, and SQL table DDL. Also add a short entry to `docs/README.md` linking the new doc.

## 6. Automated Verification
- [ ] Add a CI check (or local script) `scripts/verify_tech_schema.sh` that runs the test file and exits non-zero on failure; document the command in the task doc. The verification step should be: `pytest -q tests/requirements/test_tech_requirements_schema.py` and treat non-zero exit as failure.
