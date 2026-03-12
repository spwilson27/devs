# Task: Risk Record Data Model Schema Validation (Sub-Epic: 06_Risk 006 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-008]

## Dependencies
- depends_on: [01_enhanced_risk_table_validation.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_risk_schema_validation.py` that:
    - Defines a JSON schema representing the risk record data model (§1.1).
    - Asserts that the schema validation correctly:
        - Accepts valid risk records (with all required fields: `id`, `description`, `category`, `impact`, `probability`, `score`, `mitigation`, `status`, `fallback_id`).
        - Rejects records missing mandatory fields (e.g., `status` or `impact`).
        - Rejects records with invalid field types (e.g., `score` as a string instead of an integer).

## 2. Task Implementation
- [ ] Define the JSON schema for a risk record in a common location (e.g., `.tools/risk_record_schema.json` or within the validation script).
- [ ] Extend the validation script (`.tools/validate_risk_matrix.py`) to:
    - For every extracted risk matrix row, convert it into a JSON-compatible dictionary.
    - Validate each risk record against the JSON schema using a Python JSON schema validator library (e.g., `jsonschema`).
    - Exit non-zero and print the exact schema violations if any record fails validation.
- [ ] Ensure `./do test` (or `./do lint`) invokes this schema validation check.

## 3. Code Review
- [ ] Verify that the JSON schema accurately reflects the field constraints and required fields defined in §1.1 and §1.4 of `8_risks_mitigation.md`.
- [ ] Ensure the error messages from the schema validator are clear enough to identify which risk record and which field caused the failure.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_schema_validation.py`.
- [ ] Run `./do lint` and ensure it passes on the current `docs/plan/requirements/8_risks_mitigation.md`.

## 5. Update Documentation
- [ ] Document the risk record data model and the use of JSON schema for its validation in the project's development guides.

## 6. Automated Verification
- [ ] Temporarily remove a required field (e.g., `status`) from a risk matrix row in the Markdown and verify that `./do lint` fails with a schema violation error.
