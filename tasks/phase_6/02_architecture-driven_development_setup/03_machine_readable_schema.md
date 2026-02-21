# Task: Add Machine-Readable PRD/TAS Schema and validator (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create `tests/phase_6/test_schema_validation.py` (pytest):
  - Test `test_prd_matches_schema()` uses a JSON Schema file `specs/schema/prd_schema.json` to validate a serialized representation of the PRD (see implementation guidance below) and asserts no validation errors.
  - Test `test_tas_matches_schema()` uses `specs/schema/tas_schema.json` similarly.
  - The tests MUST use a deterministic markdown->JSON extractor `blueprint.frontmatter_extractor` or `blueprint.md_to_struct()` implemented in the task implementation step.

## 2. Task Implementation
- [ ] Create JSON Schema files at `specs/schema/prd_schema.json` and `specs/schema/tas_schema.json` that at minimum require the following top-level properties: `title` (string), `summary` (string), `goals` (array), `requirements` (array).
- [ ] Implement `src/blueprint/schema_validator.py` with:
  - `def md_to_struct(path: pathlib.Path) -> dict` — extracts the high-level sections from markdown into a canonical JSON object matching the schema (prefer YAML frontmatter when present; otherwise parse headered sections).
  - `def validate_against_schema(obj: dict, schema_path: pathlib.Path) -> List[dict]` — uses `jsonschema` to validate and returns a list of validation errors (empty list if OK).

## 3. Code Review
- [ ] Ensure the schema is conservative (only require minimal fields), the extractor is resilient to optional sections, and unit tests cover corner cases (missing goals, badly formatted lists).

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_schema_validation.py` and ensure both PRD and TAS validate cleanly.

## 5. Update Documentation
- [ ] Document the JSON schema location and `md_to_struct` contract in `docs/architecture_add.md` and include an example serialized PRD JSON.

## 6. Automated Verification
- [ ] CI verification: `pytest -q tests/phase_6/test_schema_validation.py && python -c "import json; print('OK')"` (fail on non-zero exit).