# Task: Scaffold diagram auto-generation module and test harness (Sub-Epic: 06_Diagram Auto-Generation)

## Covered Requirements
- [9_ROADMAP-TAS-402], [TAS-031]

## 1. Initial Test Written
- [ ] Create a pytest unit test at `tests/phase_6/diagram_auto_generation/test_scaffold_diagram_generator.py` that fails (red) before implementation. The test MUST:
  - Attempt to import `devs.diagram_generator` and provide a clear pytest.fail message if the module is missing.
  - Assert the module exposes a class named `DiagramGenerator` with a callable `generate` method.
  - Exact test to place in the file (copy/paste):

```python
import importlib
import pytest

def test_diagram_generator_interface():
    try:
        mod = importlib.import_module('devs.diagram_generator')
    except ModuleNotFoundError:
        pytest.fail("devs.diagram_generator module not found; create src/devs/diagram_generator.py")
    assert hasattr(mod, 'DiagramGenerator'), "Expected class DiagramGenerator in devs.diagram_generator"
    cls = getattr(mod, 'DiagramGenerator')
    assert callable(getattr(cls, 'generate', None)), "DiagramGenerator must implement a callable 'generate' method"
```

- Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_scaffold_diagram_generator.py`

## 2. Task Implementation
- [ ] Implement `src/devs/diagram_generator.py` with a minimal, typed skeleton:

```python
from typing import Any, Dict

class DiagramGenerator:
    """Base API for diagram auto-generation."""
    def generate(self, spec: Dict[str, Any]) -> str:
        """Return a mermaid diagram string for the provided spec."""
        raise NotImplementedError

__all__ = ["DiagramGenerator"]
```

- [ ] Add module docstring and a short README snippet in `docs/architecture/diagrams.md` describing the module's responsibility.
- [ ] Commit tests and the skeleton in a single focused PR titled: `phase6: scaffold diagram auto-generation module`.

## 3. Code Review
- [ ] Verify:
  - Public API uses typing and has concise docstrings.
  - No network calls or heavy runtime dependencies are introduced.
  - Tests are placed under `tests/phase_6/diagram_auto_generation/` and fail initially (red).
  - The PR includes a short changelog entry and a usage example.

## 4. Run Automated Tests to Verify
- [ ] Commands to run locally/CI:
  - `python -m pytest -q tests/phase_6/diagram_auto_generation/test_scaffold_diagram_generator.py`
  - Expect: failing test before implementation; green after implementing the class and method.

## 5. Update Documentation
- [ ] Add `docs/architecture/diagrams.md` with a minimal example:

```
from devs.diagram_generator import DiagramGenerator

dg = DiagramGenerator()
print(dg.generate({"type":"erd","models":[]}))
```

## 6. Automated Verification
- [ ] CI verification command: `python -m pytest -q tests/phase_6/diagram_auto_generation/ && echo "OK"` (exit non-zero on failure).