# Task: Define RTI data model and persistence layer (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [9_ROADMAP-TAS-043], [8_RISKS-REQ-102], [1_PRD-REQ-MET-003]

## 1. Initial Test Written
- [ ] Create a unit test file at tests/unit/test_rti_models.py using pytest. The test must import the target module and assert the presence and basic behavior of three classes: Requirement, Task, RequirementLink.
  - Example test body (copy into the test file):
    ```python
    import importlib
    from datetime import datetime

    def test_rti_models_have_expected_classes():
        m = importlib.import_module('src.models.rti_models')
        assert hasattr(m, 'Requirement')
        assert hasattr(m, 'Task')
        assert hasattr(m, 'RequirementLink')

        # basic instantiation checks (should fail until implementation exists)
        r = m.Requirement(req_id='REQ-1', title='Example', source_location='specs/1_prd.md:42')
        assert r.req_id == 'REQ-1'
        t = m.Task(task_id='TASK-1', title='Example Task')
        link = m.RequirementLink(requirement_id=r.req_id, task_id=t.task_id, source_location=r.source_location)
        assert link.requirement_id == 'REQ-1'
    ```
  - Use an in-memory database or simple dataclass objects so the test is fast and does not require external services.

## 2. Task Implementation
- [ ] Implement the data model in src/models/rti_models.py.
  - Provide three class definitions (dataclasses or ORM models): Requirement, Task, RequirementLink.
  - Fields (minimum):
    - Requirement: req_id (string, unique), title (string), description (string, optional), source_location (string, required), created_at (ISO timestamp)
    - Task: task_id (string, unique), title (string), description (string, optional), created_at
    - RequirementLink: id (uuid/string), requirement_id (string FK to Requirement.req_id), task_id (string FK to Task.task_id), source_location (string), created_at
  - If the project uses SQLAlchemy/ORM, add __tablename__, Column definitions, and simple helper methods: to_dict(), from_dict(). If not, implement as lightweight dataclasses with validation.
  - Add module-level docstring describing the mapping to source docs (per [8_RISKS-REQ-102]) and why source_location is required.
  - Add type hints and simple input validation (raise ValueError on missing source_location).

## 3. Code Review
- [ ] Verify the following during code review:
  - All three classes are documented and type-hinted.
  - Source-location is mandatory for Requirement and RequirementLink (ensures linkage back to spec: [8_RISKS-REQ-102]).
  - Field names follow snake_case and are consistent across modules.
  - No business logic in model constructors (keep models dumb; implement business rules in services).
  - Tests created above fail before implementation and pass after implementation.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_rti_models.py -q
  - Expectation: The test initially fails, then passes after implementation.

## 5. Update Documentation
- [ ] Add docs/metrics/rti_data_model.md describing the model shape, example JSON payloads, and the source_location convention (file:path or file:section). Include a short mermaid diagram showing relationships:
  ```mermaid
  classDiagram
    Requirement <|-- RequirementLink
    Task <|-- RequirementLink
    class Requirement {
      string req_id
      string title
      string source_location
    }
    class Task {
      string task_id
      string title
    }
    class RequirementLink {
      string id
      string requirement_id
      string task_id
      string source_location
    }
  ```

## 6. Automated Verification
- [ ] Add a lightweight verification script scripts/verify_models.py that imports src.models.rti_models and prints a JSON schema for the three classes. CI should run python scripts/verify_models.py and fail if the module import fails or required attributes are missing.
