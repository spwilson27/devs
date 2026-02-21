# Task: ArchitectAgent core skeleton and interface (Sub-Epic: 01_ArchitectAgent Core Implementation)

## Covered Requirements
- [9_ROADMAP-TAS-401], [TAS-050]

## 1. Initial Test Written
- [ ] Create a pytest file at tests/test_architect_agent_core.py with the following two tests:
  - test_architect_agent_importable_and_instantiable:
    - Import ArchitectAgent from src.architect_agent.core (module path: architect_agent.core).
    - Instantiate ArchitectAgent with a minimal config dict: {"name": "test-agent", "model": "gemini-3-pro"}.
    - Assert the instance has attributes `name` and `model` and that they match the config.
  - test_generate_blueprint_method_exists_and_raises:
    - Given the instantiated ArchitectAgent, assert it exposes a method `generate_blueprint(research_path)`.
    - Call `generate_blueprint` with a temp file path and assert it raises `NotImplementedError` (the initial skeleton should signal unimplemented behavior).
  - Tests must be runnable with `pytest tests/test_architect_agent_core.py -q` and use only standard pytest fixtures (tmp_path) and monkeypatch where needed.

## 2. Task Implementation
- [ ] Create a new package at `src/architect_agent/` with an `__init__.py` and `core.py` implementing a minimal, importable ArchitectAgent class:
  - class ArchitectAgent:
    - def __init__(self, config: dict): store `self.config`, `self.name`, and `self.model` (from config)
    - def generate_blueprint(self, research_path: str): raise NotImplementedError()
  - Add type hints and minimal logging.
  - Ensure package is importable as `architect_agent.core.ArchitectAgent` from the project root.

## 3. Code Review
- [ ] Verify the implementation follows SRP (ArchitectAgent only holds orchestration-level responsibilities), uses dependency injection for external systems (no direct Gemini calls inside the skeleton), has type hints, and does not log secrets.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_architect_agent_core.py -q` and confirm both tests pass (the instantiation test should pass and the generate_blueprint should raise NotImplementedError as expected).

## 5. Update Documentation
- [ ] Add `docs/architecture/architect_agent.md` describing the public API for ArchitectAgent, config keys (name, model, api client injection), and a brief example of usage.

## 6. Automated Verification
- [ ] Create a small verification script `tools/verify_architect_agent_skeleton.py` that imports ArchitectAgent and asserts that calling `generate_blueprint` raises NotImplementedError; CI should run this script as an extra assertion after pytest.