# Task: Implement requirement-to-task linking API and storage (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [8_RISKS-REQ-102], [1_PRD-REQ-MET-003]

## 1. Initial Test Written
- [ ] Create tests/unit/test_rti_linker.py using pytest that exercises the API surface before implementation. Tests should:
  - Import src.services.rti_linker and assert the presence of functions: link_requirement_to_task, unlink_requirement_from_task, get_links_for_requirement, get_requirements_for_task.
  - Use an in-memory fixture for storage (dict or in-memory SQLite) and assert that linking a requirement to a task produces a retrievable RequirementLink with the correct source_location.
  - Example test snippet:
    ```python
    from importlib import import_module
    import pytest

    def test_linker_api_surface_and_basic_flow(tmp_path):
        m = import_module('src.services.rti_linker')
        assert hasattr(m, 'link_requirement_to_task')
        assert hasattr(m, 'get_links_for_requirement')

        # create in-memory requirement/task objects (or use test fixtures)
        m.link_requirement_to_task('REQ-1', 'TASK-1', source_location='specs/1_prd.md:42')
        links = m.get_links_for_requirement('REQ-1')
        assert any(l.task_id == 'TASK-1' for l in links)
    ```

## 2. Task Implementation
- [ ] Implement src/services/rti_linker.py with the following API:
  - link_requirement_to_task(requirement_id: str, task_id: str, source_location: str) -> RequirementLink
  - unlink_requirement_from_task(requirement_id: str, task_id: str) -> bool
  - get_links_for_requirement(requirement_id: str) -> List[RequirementLink]
  - get_requirements_for_task(task_id: str) -> List[Requirement]

- Implementation details:
  - Use the persistence layer from src/models.rti_models. For MVP the service may use an in-memory dict or the project's DB session; abstract storage behind a Repository class so a test double can be injected.
  - Validate inputs and raise ValueError for missing/invalid IDs or missing source_location (mapping to [8_RISKS-REQ-102]).
  - Ensure linking is idempotent (linking same pair twice does not create duplicates).
  - Emit structured logging entries on create/delete with key fields: requirement_id, task_id, source_location.

## 3. Code Review
- [ ] Verify:
  - API surface exactly matches the tests and that methods are documented.
  - Idempotency and validation behavior are unit-tested.
  - No direct SQL in the service; use repository/ORM patterns for testability.
  - Logging contains structured JSON-friendly payloads.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_rti_linker.py -q

## 5. Update Documentation
- [ ] Update docs/metrics/rti_api.md with examples of API usage, sample payloads, and error cases. Include a short OpenAPI fragment if the project exposes HTTP endpoints.

## 6. Automated Verification
- [ ] Add a script scripts/verify_rti_links.py that runs link_requirement_to_task with sample data and prints a JSON list of links. CI will run this script as a smoke test for the linker service.
