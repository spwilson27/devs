# Task: Implement DocumentValidator for Markdown + Mermaid validation (Sub-Epic: 06_Diagram Auto-Generation)

## Covered Requirements
- [TAS-031]

## 1. Initial Test Written
- [ ] Create pytest tests at `tests/phase_6/diagram_auto_generation/test_document_validator.py` that verify extraction and validation behavior. The tests must:
  - Provide a markdown fixture `tests/phase_6/diagram_auto_generation/fixtures/with_mermaid.md` containing one or more fenced mermaid blocks (```mermaid ... ```).
  - Import `DocumentValidator` from `devs.diagram_generator.validator` and run `validate(markdown_text)` which returns a dict with `{ 'ok': bool, 'errors': [ ... ] }`.
  - Monkeypatch the underlying mermaid renderer or syntax checker to simulate both valid and invalid mermaid; assert that valid input yields `ok: True` and invalid input yields `ok: False` with an error message.

- Exact test to place in `tests/phase_6/diagram_auto_generation/test_document_validator.py`:

```python
from pathlib import Path
from devs.diagram_generator.validator import DocumentValidator

def test_document_validator_happy_and_unhappy(monkeypatch):
    md = Path(__file__).parent / "fixtures" / "with_mermaid.md"
    validator = DocumentValidator()

    # simulate valid run
    monkeypatch.setattr('devs.diagram_generator.validator._check_mermaid_syntax', lambda src: (True, []))
    res = validator.validate(md.read_text())
    assert res['ok'] is True

    # simulate invalid run
    monkeypatch.setattr('devs.diagram_generator.validator._check_mermaid_syntax', lambda src: (False, ['parse error']))
    res2 = validator.validate(md.read_text())
    assert res2['ok'] is False and 'parse error' in res2['errors'][0]
```

- Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_document_validator.py`

## 2. Task Implementation
- [ ] Implement `src/devs/diagram_generator/validator.py` with a `DocumentValidator` class exposing:

```python
class DocumentValidator:
    def validate(self, markdown_text: str) -> dict:
        """Return {'ok': bool, 'errors': [str], 'details': {...}}"""
```

- [ ] Implementation details:
  - Extract fenced code blocks labelled `mermaid` using a simple regex or a Markdown parser.
  - For each extracted mermaid block call an internal helper `_check_mermaid_syntax(src: str) -> (bool, list[str])` which delegates to the mermaid CLI (`mmdc --check`) or, in test-friendly mode, can be monkeypatched/substituted.
  - Aggregate results and return a structured dict with locations (start line) and error messages.

## 3. Code Review
- [ ] Verify:
  - The validator returns structured results (ok/errors/details) and does not raise for user input parsing errors.
  - The mermaid syntax checker is swappable for unit tests (design for dependency injection or monkeypatching).
  - Implement performance guardrails: abort validation if a single block is > 500KB and return a specific error.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_document_validator.py`

## 5. Update Documentation
- [ ] Document the validator API in `docs/architecture/diagrams.md` including example output JSON and how to run it in CI as part of the docs-generation pipeline.

## 6. Automated Verification
- [ ] CI: run the unit tests and ensure the validation json is emitted to `build/validation/document_validator.json` with a top-level `ok` boolean; a simple check: `pytest -q tests/phase_6/diagram_auto_generation/test_document_validator.py && jq . build/validation/document_validator.json | grep -q '"ok"'` (or equivalent Python check).
