# Task: Define Distiller Domain Models and Interfaces (Sub-Epic: 01_Distiller_Core_Extraction)

## Covered Requirements
- [TAS-051], [1_PRD-REQ-PLAN-001]

## 1. Initial Test Written
- [ ] Create tests/distiller/test_models.py using pytest.
  - Test file MUST contain the following tests (exact names):
    - test_requirement_model_validation()
    - test_distiller_result_schema()
    - test_requirement_provenance_fields()
  - Each test must import the models from src/distiller/models.py (relative import path: distiller.models).
  - test_requirement_model_validation(): instantiate a Requirement with sample values: id="1_PRD-REQ-PLAN-001", title="Sample", source_doc="tests/fixtures/sample_prd.md", line_start=10, line_end=12, raw_text="..." and assert field types and id equals the input string.
  - test_distiller_result_schema(): instantiate a DistillerResult containing a list of Requirement objects and assert JSON serialization returns keys: requirements, generated_at, rti (may be None at this stage).
  - Run the test and confirm it fails before implementation: pytest -q tests/distiller/test_models.py

## 2. Task Implementation
- [ ] Implement src/distiller/models.py with two pydantic.BaseModel classes (or dataclasses with type validation): Requirement and DistillerResult.
  - Requirement fields: id: str, title: Optional[str], source_doc: str, line_start: int, line_end: int, raw_text: str, normalized_id: Optional[str], confidence: Optional[float], tags: Optional[List[str]]
  - DistillerResult fields: requirements: List[Requirement], generated_at: datetime (UTC), rti: Optional[float], provenance_summary: Dict[str, Any]
- [ ] Add src/distiller/interfaces.py defining a ParserInterface Protocol with method: parse(source: str, filename: Optional[str]) -> List[Requirement]
- [ ] Add package __init__.py files as needed so imports use 'distiller.models' and 'distiller.interfaces'.

## 3. Code Review
- [ ] Verify all public classes are typed and documented with docstrings.
- [ ] Ensure pydantic validation errors raise useful messages for malformed Requirement inputs.
- [ ] Keep each file < 200 LOC; models module should only contain schema definitions and no extraction logic.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/distiller/test_models.py and confirm tests pass after implementation.

## 5. Update Documentation
- [ ] Add a short section in docs/distiller.md: describe Requirement and DistillerResult JSON schema examples and expected field semantics.

## 6. Automated Verification
- [ ] After tests pass, run a quick serialization smoke test: python -c "from distiller.models import DistillerResult, Requirement; print(DistillerResult(requirements=[Requirement(id='1_PRD-REQ-PLAN-001', source_doc='x', line_start=1, line_end=1, raw_text='x')]).json())" and confirm JSON contains "requirements" and the id string.
